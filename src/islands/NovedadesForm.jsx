import React, { useState, useMemo } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, NOVEDADES_COLLECTION } from '../lib/firebase';
import { notifyError, notifySuccess } from '../lib/toast';
import { subirEvidencias } from '../lib/evidencias';
import useStore from '../lib/store';
import { getBodegasBySede } from '../data/sedes';

const TIPO_NOVEDAD_OPTIONS = [
  { value: 'AVERIA', label: 'Avería' },
  { value: 'ACCIDENTE_TRABAJO', label: 'Accidente de Trabajo' },
  { value: 'INCIDENTE_SEGURIDAD', label: 'Incidente de Seguridad' },
  { value: 'DANO_EQUIPO', label: 'Daño a Equipo' },
  { value: 'RUPUTRA', label: 'Rotura' },
  { value: 'OTRO', label: 'Otro' },
];

export default function NovedadesForm() {
  const user = useStore((s) => s.user);
  const [formData, setFormData] = useState({
    tipo: '',
    descripcion: '',
    bodega: '',
  });
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const sede = user?.sede || '';
  const bodegasDisponibles = useMemo(() => getBodegasBySede(sede), [sede]);

  const fieldBase = 'mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wide text-slate-700';
  const helperText = 'mt-1 text-[11px] text-slate-500';
  const errorText = 'mt-1 text-[11px] font-medium text-rose-600';
  const actionBase = 'inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((file) => ['image/jpeg', 'image/png'].includes(file.type));

    if (valid.length === 0) return;

    setImagenes((prev) => [...prev, ...valid]);

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, { name: file.name, url: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const eliminarImagen = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = () => {
    const nextErrors = {};
    if (!formData.tipo) nextErrors.tipo = 'Requerido';
    if (!formData.descripcion || !formData.descripcion.trim()) nextErrors.descripcion = 'Requerido';
    if (!sede) nextErrors.sede = 'No tienes una sede asignada';
    setErrores(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetear = () => {
    setFormData({ tipo: '', descripcion: '', bodega: '' });
    setImagenes([]);
    setPreviews([]);
    setErrores({});
    const camara = document.getElementById('novedad-camara');
    const archivos = document.getElementById('novedad-archivos');
    if (camara) camara.value = '';
    if (archivos) archivos.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      notifyError('Corrija los errores del formulario');
      return;
    }

    setGuardando(true);

    try {
      let evidenciasSubidas = [];
      if (imagenes.length > 0) {
        evidenciasSubidas = await subirEvidencias(imagenes, auth.currentUser?.uid, 'novedades');
      }

      const registro = {
        tipo: formData.tipo,
        descripcion: formData.descripcion.trim(),
        sede,
        bodega: formData.bodega || '',
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email || '',
        evidencias: evidenciasSubidas,
        createdBy: auth.currentUser?.email || '',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, NOVEDADES_COLLECTION), registro);
      notifySuccess('Novedad registrada correctamente');
      resetear();
    } catch (error) {
      console.error('Error guardando novedad', error);
      notifyError(error?.code === 'permission-denied'
        ? 'Firestore bloqueó la escritura. Verifica tus permisos.'
        : 'No se pudo guardar la novedad.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
      <div className="border-b border-slate-100 bg-white px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 18v-6a5 5 0 1 1 10 0v6" />
              <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
              <path d="M21 12h1" />
              <path d="M18.5 4.5 18 5" />
              <path d="M2 12h1" />
              <path d="M12 2v1" />
              <path d="m4.929 4.929.707.707" />
              <path d="M12 12v6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Módulo de novedades</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Registrar Novedad</h2>
            <p className="mt-2 text-sm text-slate-600">Reporta averías, incidentes, accidentes o cualquier novedad operativa.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className="block">
            <span className={labelBase}>Tipo de novedad <span className="text-rose-500">*</span></span>
            <select name="tipo" value={formData.tipo} onChange={handleInputChange} className={fieldBase}>
              <option value="">Seleccione una opción</option>
              {TIPO_NOVEDAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errores.tipo ? <span className={errorText}>{errores.tipo}</span> : <span className={helperText}>Seleccione el tipo de novedad a reportar.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Sede</span>
            <input value={sede} disabled className={fieldBase} />
            {errores.sede ? <span className={errorText}>{errores.sede}</span> : <span className={helperText}>Sede asignada automáticamente.</span>}
          </label>

          {bodegasDisponibles.length > 0 && (
            <label className="block">
              <span className={labelBase}>Bodega <span className="normal-case font-normal text-slate-500">(Opcional)</span></span>
              <select name="bodega" value={formData.bodega} onChange={handleInputChange} className={fieldBase}>
                <option value="">No aplica / No seleccionada</option>
                {bodegasDisponibles.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className={helperText}>Bodega donde ocurrió la novedad.</span>
            </label>
          )}

          <label className="block sm:col-span-2">
            <span className={labelBase}>Descripción <span className="text-rose-500">*</span></span>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Describa la novedad en detalle..." rows="4" className={fieldBase + ' h-auto py-3'} />
            {errores.descripcion ? <span className={errorText}>{errores.descripcion}</span> : <span className={helperText}>Explique qué ocurrió, dónde y cualquier detalle relevante.</span>}
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-3">
            <span className={labelBase}>Evidencia fotográfica <span className="normal-case font-normal text-slate-500">(Opcional - solo JPG/PNG)</span></span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label htmlFor="novedad-camara" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent bg-linear-to-r from-red-700 to-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
              Tomar Foto
            </label>
            <input id="novedad-camara" type="file" accept="image/jpeg,image/png" capture="environment" multiple onChange={handleImagenesChange} className="hidden" />

            <input id="novedad-archivos" type="file" accept="image/jpeg,image/png" multiple onChange={handleImagenesChange} className="hidden" />
          </div>

          {previews.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Imágenes adjuntas ({previews.length})</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <button type="button" onClick={() => eliminarImagen(index)} className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow cursor-pointer">
                      ✕
                    </button>
                    <img src={preview.url} alt={preview.name} className="h-28 w-full object-cover" />
                    <div className="border-t border-slate-100 px-2 py-1">
                      <span className="block truncate text-[11px] text-slate-600">{preview.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button type="submit" disabled={guardando} className={`${actionBase} bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60`}>
            {guardando ? 'GUARDANDO...' : 'REGISTRAR NOVEDAD'}
          </button>
          <button type="button" onClick={resetear} className={`${actionBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200`}>
            LIMPIAR FORMULARIO
          </button>
        </div>
      </form>
    </div>
  );
}
