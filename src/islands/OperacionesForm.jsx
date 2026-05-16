import React, { useState, useMemo } from 'react';
import { getSedes, getBodegasBySede } from '../data/sedes';

export default function OperacionesForm() {
  const [formData, setFormData] = useState({
    tipoOperacion: '', sede: '', bodega: '', cliente: '', muelle: '', conductor: '', numeroCC: '', placa: '', destino: '', responsable: '', asistente: '', observaciones: ''
  });

  const bodegasDisponibles = useMemo(() => formData.sede ? getBodegasBySede(formData.sede) : [], [formData.sede]);
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errores, setErrores] = useState({});
  const sedes = getSedes();

  const validarPlaca = (placa) => /^[A-Z]{3}[0-9]{3}$/.test(placa);

  const handlePlacaChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0,6);
    if (value.length === 6 && !validarPlaca(value)) {
      setErrores(prev => ({ ...prev, placa: 'Formato inválido (ej: ABC123)' }));
    } else {
      setErrores(prev => ({ ...prev, placa: '' }));
    }
    setFormData(prev => ({ ...prev, placa: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sede') setFormData(prev => ({ ...prev, sede: value, bodega: '' }));
    else setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => ['image/jpeg','image/png'].includes(f.type));
    if (valid.length === 0) return;
    setImagenes(prev => [...prev, ...valid]);
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setPreviews(prev => [...prev, { name: file.name, url: reader.result }]);
      reader.readAsDataURL(file);
    });
  };

  const eliminarImagen = (i) => {
    setImagenes(prev => prev.filter((_,idx)=>idx!==i));
    setPreviews(prev => prev.filter((_,idx)=>idx!==i));
  };

  const validarFormulario = () => {
    const nErr = {};
    if (!formData.tipoOperacion) nErr.tipoOperacion = 'Requerido';
    if (!formData.sede) nErr.sede = 'Requerido';
    if (!formData.bodega) nErr.bodega = 'Requerido';
    if (!formData.cliente || !formData.cliente.trim()) nErr.cliente = 'Requerido';
    if (!formData.conductor || !formData.conductor.trim()) nErr.conductor = 'Requerido';
    if (!formData.numeroCC || !/^[0-9]+$/.test(formData.numeroCC)) nErr.numeroCC = 'Número inválido';
    if (!formData.placa || !validarPlaca(formData.placa)) nErr.placa = 'Placa inválida';
    setErrores(nErr);
    return Object.keys(nErr).length === 0;
  };

  const resetear = () => {
    setFormData({ tipoOperacion: '', sede: '', bodega: '', cliente: '', muelle: '', conductor: '', numeroCC: '', placa: '', destino: '', responsable: '', asistente: '', observaciones: '' });
    setImagenes([]); setPreviews([]); setErrores({});
    const cam = document.getElementById('camara'); const arc = document.getElementById('archivos'); if (cam) cam.value=''; if (arc) arc.value='';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) { alert('Corrija los errores'); return; }
    const horaInicio = new Date().toISOString();
    const registro = {
      ...formData,
      muelle: formData.muelle ? parseInt(formData.muelle) : null,
      horaInicio,
      evidencias: imagenes.map(f=>({ name: f.name, size: f.size, type: f.type })),
      fechaCreacion: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })
    };
    console.log('Registro de cargue', registro);
    alert('Registro guardado (temporal)');
    resetear();
  };

  const fieldBase = 'mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wide text-slate-700';
  const helperText = 'mt-1 text-[11px] text-slate-500';
  const errorText = 'mt-1 text-[11px] font-medium text-rose-600';
  const actionBase = 'inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2';

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 px-4 py-8 text-center text-white sm:px-8 sm:py-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm sm:h-16 sm:w-16">
          <span className="text-2xl font-bold sm:text-3xl">R</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">Control de Cargues</h2>
        <p className="mt-2 text-xs text-white/90 sm:text-sm">Registro de operaciones • Repremundo</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className="block">
            <span className={labelBase}>Tipo de Operación <span className="text-rose-500">*</span></span>
            <select name="tipoOperacion" value={formData.tipoOperacion} onChange={handleInputChange} className={fieldBase}>
              <option value="">Seleccione una opción</option>
              <option value="CARGUE">CARGUE</option>
              <option value="DESCARGUE">DESCARGUE</option>
            </select>
            {errores.tipoOperacion ? <span className={errorText}>{errores.tipoOperacion}</span> : <span className={helperText}>Seleccione el tipo de operación.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Sede <span className="text-rose-500">*</span></span>
            <select name="sede" value={formData.sede} onChange={handleInputChange} className={fieldBase}>
              <option value="">Seleccione una sede</option>
              {sedes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errores.sede ? <span className={errorText}>{errores.sede}</span> : <span className={helperText}>La bodega depende de la sede.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Bodega <span className="text-rose-500">*</span></span>
            <select name="bodega" value={formData.bodega} onChange={handleInputChange} disabled={!formData.sede} className={fieldBase}>
              <option value="">{formData.sede ? 'Seleccione una bodega' : 'Primero seleccione una sede'}</option>
              {bodegasDisponibles.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errores.bodega ? <span className={errorText}>{errores.bodega}</span> : <span className={helperText}>Se activa cuando eliges la sede.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Cliente <span className="text-rose-500">*</span></span>
            <input name="cliente" value={formData.cliente} onChange={handleInputChange} placeholder="Nombre del cliente" className={fieldBase} />
            {errores.cliente && <span className={errorText}>{errores.cliente}</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Muelle <span className="text-rose-500">*</span></span>
            <input type="number" name="muelle" value={formData.muelle} onChange={handleInputChange} placeholder="Número de muelle" min="1" className={fieldBase} />
            {errores.muelle ? <span className={errorText}>{errores.muelle}</span> : <span className={helperText}>Ingresa un número mayor a 0.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Conductor <span className="text-rose-500">*</span></span>
            <input name="conductor" value={formData.conductor} onChange={handleInputChange} placeholder="Nombre del conductor" className={fieldBase} />
            {errores.conductor && <span className={errorText}>{errores.conductor}</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Número de CC <span className="text-rose-500">*</span></span>
            <input name="numeroCC" value={formData.numeroCC} onChange={handleInputChange} placeholder="Cédula de ciudadanía" className={fieldBase} />
            {errores.numeroCC ? <span className={errorText}>{errores.numeroCC}</span> : <span className={helperText}>Solo números.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Placa <span className="text-rose-500">*</span> <span className="ml-1 normal-case font-normal text-slate-500">(3 letras + 3 números)</span></span>
            <input name="placa" value={formData.placa} onChange={handlePlacaChange} placeholder="ABC123" maxLength="6" className={fieldBase + ' uppercase font-semibold tracking-[0.18em]'} />
            {formData.placa && validarPlaca(formData.placa) ? <span className="mt-1 text-[11px] font-medium text-emerald-600">✓ Placa válida</span> : errores.placa ? <span className={errorText}>{errores.placa}</span> : <span className={helperText}>Se valida automáticamente.</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Destino <span className="text-rose-500">*</span></span>
            <input name="destino" value={formData.destino} onChange={handleInputChange} placeholder="Lugar de destino" className={fieldBase} />
            {errores.destino && <span className={errorText}>{errores.destino}</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Responsable <span className="text-rose-500">*</span></span>
            <input name="responsable" value={formData.responsable} onChange={handleInputChange} placeholder="Nombre del responsable" className={fieldBase} />
            {errores.responsable && <span className={errorText}>{errores.responsable}</span>}
          </label>

          <label className="block">
            <span className={labelBase}>Asistente de Seguridad <span className="text-rose-500">*</span></span>
            <input name="asistente" value={formData.asistente} onChange={handleInputChange} placeholder="Nombre del asistente" className={fieldBase} />
            {errores.asistente && <span className={errorText}>{errores.asistente}</span>}
          </label>

          <label className="block sm:col-span-2">
            <span className={labelBase}>Observaciones <span className="normal-case font-normal text-slate-500">(Opcional)</span></span>
            <textarea name="observaciones" value={formData.observaciones} onChange={handleInputChange} placeholder="Ingrese observaciones adicionales..." rows="4" className={fieldBase + ' h-auto py-3'} />
          </label>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-3">
            <span className={labelBase}>Evidencias <span className="normal-case font-normal text-slate-500">(Opcional - solo JPG/PNG)</span></span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label htmlFor="camara" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent bg-gradient-to-r from-orange-500 to-rose-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95">
              <span>📷</span>
              Tomar Foto
            </label>
            <input id="camara" type="file" accept="image/jpeg,image/png" capture="environment" multiple onChange={handleImagenesChange} className="hidden" />

            <label htmlFor="archivos" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              <span>🖼️</span>
              Seleccionar Archivos
            </label>
            <input id="archivos" type="file" accept="image/jpeg,image/png" multiple onChange={handleImagenesChange} className="hidden" />
          </div>

          {previews.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Imágenes adjuntas ({previews.length})</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {previews.map((p, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <button type="button" onClick={() => eliminarImagen(i)} className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow">
                      ✕
                    </button>
                    <img src={p.url} alt={p.name} className="h-28 w-full object-cover" />
                    <div className="border-t border-slate-100 px-2 py-1">
                      <span className="block truncate text-[11px] text-slate-600">{p.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button type="submit" className={`${actionBase} bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 focus:ring-emerald-300`}>
            REGISTRAR CARGUE
          </button>
          <button type="button" onClick={resetear} className={`${actionBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200`}>
            LIMPIAR FORMULARIO
          </button>
        </div>
      </form>
    </div>
  );
}
