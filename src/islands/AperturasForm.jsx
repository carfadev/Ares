import React, { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { notifyError, notifySuccess } from '../lib/toast';

const openingThemes = {
  REJA: {
    accentSoft: 'bg-amber-50 text-amber-700 ring-amber-100',
    badge: 'bg-amber-100 text-amber-700',
    button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M6 3v18" />
        <path d="M12 3v18" />
        <path d="M18 3v18" />
      </svg>
    ),
    title: 'Apertura de reja',
    description: '',
  },
  CUARTO: {
    accentSoft: 'bg-sky-50 text-sky-700 ring-sky-100',
    badge: 'bg-sky-100 text-sky-700',
    button: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="14" x="4" y="5" rx="2" />
        <path d="M8 5V3" />
        <path d="M16 5V3" />
        <path d="M8 11h8" />
      </svg>
    ),
    title: 'Apertura de cuarto de seguridad',
    /* description: 'Registra la apertura de cuartos de seguridad y sus responsables.', */
  },
  DEFAULT: {
    accentSoft: 'bg-slate-50 text-slate-700 ring-slate-100',
    badge: 'bg-slate-100 text-slate-700',
    button: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12h6" />
      </svg>
    ),
    title: 'Módulo de aperturas',
    description: 'Selecciona el tipo de apertura para continuar.',
  },
};

const aperturaOptionsByType = {
  REJA: [
    { value: 'DELL', label: 'Reja Dell', bodega: { value: '502', label: 'Bodega 502 - Celta' } },
    { value: 'APPLE', label: 'Reja Apple', bodega: { value: '502', label: 'Bodega 502 - Celta' } },
    { value: 'BAT', label: 'Reja Bat', bodega: { value: '116', label: 'Bodega 116 - Celta' } },
    { value: 'ALTO_VALOR', label: 'Reja Alto Valor', bodega: { value: 'LA_ESTRELLA', label: 'La Estrella - Medellín' } },
  ],
  CUARTO: [
    { value: '79', label: 'Cuarto de seguridad 79', bodega: { value: '79', label: 'Bodega 79 - Celta' } },
    { value: '61', label: 'Cuarto de seguridad 61', bodega: { value: '61', label: 'Bodega 61 - Celta' } },
  ],
};

export default function AperturasForm() {
  const [formData, setFormData] = useState({
    tipoElemento: '',
    puntoApertura: '',
    bodega: '',
    autoriza: '',
    observaciones: '',
  });
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const puntosDisponibles = useMemo(() => aperturaOptionsByType[formData.tipoElemento] || [], [formData.tipoElemento]);
  const bodegaDisponible = useMemo(
    () => puntosDisponibles.find((opcion) => opcion.value === formData.puntoApertura)?.bodega || null,
    [formData.puntoApertura, puntosDisponibles]
  );
  const openingTheme = openingThemes[formData.tipoElemento] || openingThemes.DEFAULT;

  const fieldBase = 'mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wide text-slate-700';
  const helperText = 'mt-1 text-[11px] text-slate-500';
  const errorText = 'mt-1 text-[11px] font-medium text-rose-600';
  const actionBase = 'inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2';

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tipoElemento') {
      setFormData((prev) => ({ ...prev, tipoElemento: value, puntoApertura: '', bodega: '' }));
    } else if (name === 'puntoApertura') {
      const opcionSeleccionada = puntosDisponibles.find((opcion) => opcion.value === value);
      setFormData((prev) => ({
        ...prev,
        puntoApertura: value,
        bodega: opcionSeleccionada?.bodega?.value || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((file) => ['image/jpeg', 'image/png'].includes(file.type));

    if (valid.length === 0) {
      return;
    }

    setImagenes((prev) => [...prev, ...valid]);

    valid.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => setPreviews((prev) => [...prev, { name: file.name, url: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const eliminarImagen = (index) => {
    setImagenes((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setPreviews((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const validarFormulario = () => {
    const nextErrors = {};

    if (!formData.tipoElemento) nextErrors.tipoElemento = 'Requerido';
    if (!formData.puntoApertura) nextErrors.puntoApertura = 'Requerido';
    if (!formData.bodega) nextErrors.bodega = 'Requerido';
    if (!formData.autoriza || !formData.autoriza.trim()) nextErrors.autoriza = 'Requerido';

    setErrores(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetear = () => {
    setFormData({
      tipoElemento: '',
      puntoApertura: '',
      bodega: '',
      autoriza: '',
      observaciones: '',
    });
    setImagenes([]);
    setPreviews([]);
    setErrores({});

    const camara = document.getElementById('evidencia-camara');
    const archivos = document.getElementById('evidencia-archivos');

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

    const registro = {
      modulo: 'APERTURAS',
      tipoRegistro: 'APERTURA',
      ...formData,
      bodegaLabel: bodegaDisponible?.label || '',
      evidencias: imagenes.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      fechaCreacion: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'aperturas_seguridad'), registro);
      notifySuccess('Apertura guardada en Firestore');
      resetear();
    } catch (error) {
      console.error('Error guardando apertura en Firestore', error);
      notifyError(error?.code === 'permission-denied'
        ? 'Firestore bloqueó la escritura. Tus reglas actuales no permiten guardar sin autenticación.'
        : 'No se pudo guardar la apertura en Firestore.');
    } finally {
      setGuardando(false);
    }
  };

  const submitLabel = formData.tipoElemento === 'CUARTO' ? 'REGISTRAR APERTURA DE CUARTO' : formData.tipoElemento === 'REJA' ? 'REGISTRAR APERTURA DE REJA' : 'REGISTRAR APERTURA';

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
      <div className="border-b border-slate-100 bg-white px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${openingTheme.badge}`}>
            {openingTheme.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Módulo de aperturas</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{openingTheme.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{openingTheme.description}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className="block">
            <span className={labelBase}>Tipo de apertura <span className="text-rose-500">*</span></span>
            <select name="tipoElemento" value={formData.tipoElemento} onChange={handleInputChange} className={`${fieldBase} ${openingTheme.accentSoft} ring-1 ring-inset`}>
              <option value="">Seleccione una opción</option>
              <option value="REJA">REJA</option>
              <option value="CUARTO">CUARTO DE SEGURIDAD</option>
            </select>
            {errores.tipoElemento ? <span className={errorText}>{errores.tipoElemento}</span> : <span className={helperText}>Seleccione la clase de apertura a reportar.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>¿Qué apertura? <span className="text-rose-500">*</span></span>
            <select name="puntoApertura" value={formData.puntoApertura} onChange={handleInputChange} disabled={!formData.tipoElemento} className={fieldBase}>
              <option value="">{formData.tipoElemento ? 'Seleccione una opción' : 'Primero seleccione el tipo de apertura'}</option>
              {puntosDisponibles.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
              ))}
            </select>
            {errores.puntoApertura ? <span className={errorText}>{errores.puntoApertura}</span> : <span className={helperText}>Primero elige la reja o el cuarto de seguridad.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>¿Qué bodega? <span className="text-rose-500">*</span></span>
            <select name="bodega" value={formData.bodega} onChange={handleInputChange} disabled={!formData.puntoApertura} className={fieldBase}>
              <option value="">{formData.puntoApertura ? 'Seleccione una bodega' : 'Primero seleccione la apertura'}</option>
              {bodegaDisponible ? (
                <option value={bodegaDisponible.value}>{bodegaDisponible.label}</option>
              ) : null}
            </select>
            {errores.bodega ? <span className={errorText}>{errores.bodega}</span> : <span className={helperText}>La bodega se define según la apertura seleccionada.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Autoriza <span className="text-rose-500">*</span></span>
            <input name="autoriza" value={formData.autoriza} onChange={handleInputChange} placeholder="Nombre de quien autoriza" className={fieldBase} />
            {errores.autoriza ? <span className={errorText}>{errores.autoriza}</span> : <span className={helperText}>Responsable que autoriza la apertura.</span>}
          </label>

          <label className="block sm:col-span-2">
            <span className={labelBase}>Observaciones <span className="normal-case font-normal text-slate-500">(Opcional)</span></span>
            <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} placeholder="Ingrese observaciones adicionales..." rows="4" className={fieldBase + ' h-auto py-3'} />
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-3">
            <span className={labelBase}>Evidencia fotográfica <span className="normal-case font-normal text-slate-500">(Opcional - solo JPG/PNG)</span></span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label htmlFor="evidencia-camara" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent bg-linear-to-r from-slate-700 to-cyan-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
              <span>📷</span>
              Tomar Foto
            </label>
            <input id="evidencia-camara" type="file" accept="image/jpeg,image/png" capture="environment" multiple onChange={handleImagenesChange} className="hidden" />

            <label htmlFor="evidencia-archivos" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              <span>🖼️</span>
              Seleccionar Archivos
            </label>
            <input id="evidencia-archivos" type="file" accept="image/jpeg,image/png" multiple onChange={handleImagenesChange} className="hidden" />
          </div>

          {previews.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Imágenes adjuntas ({previews.length})</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <button type="button" onClick={() => eliminarImagen(index)} className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow">
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
          <button type="submit" disabled={guardando} className={`${actionBase} ${openingTheme.button} text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60`}>
            {guardando ? 'GUARDANDO...' : submitLabel}
          </button>
          <button type="button" onClick={resetear} className={`${actionBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200`}>
            LIMPIAR FORMULARIO
          </button>
        </div>
      </form>
    </div>
  );
}