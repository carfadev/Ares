import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getSedes, getBodegasBySede } from '../data/sedes';
import Lottie from 'lottie-react';
import forkliftAnimation from '../assets/lotties/Forklift.json';
import truckAnimation from '../assets/lotties/truck.json';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db, auth, NOVEDADES_COLLECTION } from '../lib/firebase';
import { notifyError, notifySuccess } from '../lib/toast';
import { subirEvidencias } from '../lib/evidencias';
import useStore from '../lib/store';
import { obtenerSede } from './SedeSelectionModal';
import { useEvidencias } from '../hooks/useEvidencias';
import { clientConfig } from '../../client.config';

const operationThemes = {
  CARGUE: {
    accent: 'from-orange-500 via-orange-600 to-amber-500',
    accentSoft: 'bg-orange-50 text-orange-700 ring-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    button: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    ),
    title: 'Cargue',
    /* description: 'Complete la información requerida.' */
  },
  DESCARGUE: {
    accent: 'from-sky-500 via-blue-600 to-indigo-500',
    accentSoft: 'bg-sky-50 text-sky-700 ring-sky-100',
    badge: 'bg-sky-100 text-sky-700',
    button: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 5 7 7-7 7" />
        <path d="M5 12h14" />
      </svg>
    ),
    title: 'Descargue',
    /* description: 'Complete la información requerida.' */
  },
  HORA_FINAL: {
    accent: 'from-emerald-500 via-teal-600 to-cyan-600',
    accentSoft: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    title: 'Hora final',
    description: 'Cierra una operación activa por placa.',
  },
  DEFAULT: {
    accent: 'from-slate-600 via-slate-700 to-slate-800',
    accentSoft: 'bg-slate-50 text-slate-700 ring-slate-100',
    badge: 'bg-slate-100 text-slate-700',
    button: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12h6" />
      </svg>
    ),
    title: 'Seleccione el tipo de operación',
    /* description: 'Complete la información requerida.' */
  }
};

export default function OperacionesForm() {
  const sedeSeleccionada = useStore((s) => s.user?.sede) || obtenerSede();

  const [formData, setFormData] = useState({
    tipoOperacion: '', bodega: '', cliente: '', muelle: '', conductor: '', numeroCC: '', placa: '', destino: '', responsable: '', asistente: '', observaciones: '', traeNovedad: false, tipoNovedad: ''
  });
  const [lastCheckedPlaca, setLastCheckedPlaca] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [operacionDetectada, setOperacionDetectada] = useState(null);
  const [modoCierre, setModoCierre] = useState(false);
  const [operacionCierre, setOperacionCierre] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [statusText, setStatusText] = useState('');
  const cierreSectionRef = useRef(null);
  
  const [erroresCierre, setErroresCierre] = useState({});
  const [textoEdicion, setTextoEdicion] = useState('');
  const [originalObservaciones, setOriginalObservaciones] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bodegasDisponibles = useMemo(() => sedeSeleccionada ? getBodegasBySede(sedeSeleccionada) : [], [sedeSeleccionada]);
  const { imagenes, previews, handleImagenesChange, eliminarImagen, resetImagenes } = useEvidencias();
  const [errores, setErrores] = useState({});

  const validarPlaca = (placa) => /^[A-Z]{3}[0-9]{3}$/.test(placa);

  const normalizarPlaca = (valor = '') => valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

  const fechaBogotaTexto = (fecha) => fecha.toLocaleString('es-CO', { timeZone: 'America/Bogota' });

  const esHoraFinal = formData.tipoOperacion === 'HORA_FINAL';

  const obtenerMilisegundosEntrada = (data) => {
    if (data?.createdAt?.toMillis) return data.createdAt.toMillis();
    if (data?.horaEntradaISO) return new Date(data.horaEntradaISO).getTime();
    if (data?.horaInicio) return new Date(data.horaInicio).getTime();
    return NaN;
  };

  const handlePlacaChange = (e) => {
    let value = normalizarPlaca(e.target.value);
    if (value.length === 6 && !validarPlaca(value)) {
      setErrores(prev => ({ ...prev, placa: 'Formato inválido (ej: ABC123)' }));
    } else {
      setErrores(prev => ({ ...prev, placa: '' }));
    }
    setFormData(prev => ({ ...prev, placa: value }));
    // Si la placa es completa y valida, detectar operación activa y ofrecer confirmar cierre
    if (value.length === 6 && validarPlaca(value) && value !== lastCheckedPlaca) {
      setLastCheckedPlaca(value);
      (async () => {
        try {
          setGuardando(true);
          
          if (!sedeSeleccionada) {
            setErrores(prev => ({ ...prev, placa: 'Debes seleccionar una sede primero.' }));
            setGuardando(false);
            return;
          }

          const consulta = query(
            collection(db, 'cargues_descargues'),
            where('placa', '==', value),
            where('sede', '==', sedeSeleccionada),
            where('salidaRegistrada', '==', false)
          );
          const snap = await getDocs(consulta);

          const activos = snap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

          if (activos.length) {
            // Mostrar modal para confirmar cierre de la operación activa más reciente
            const operacionActiva = activos.sort((a, b) => {
              const aMs = obtenerMilisegundosEntrada(a);
              const bMs = obtenerMilisegundosEntrada(b);
              return (Number.isNaN(bMs) ? 0 : bMs) - (Number.isNaN(aMs) ? 0 : aMs);
            })[0];
            // Sólo mantener cliente y placa en la operación detectada (mostrar cliente en modal)
            setOperacionDetectada(operacionActiva);
            setShowConfirmModal(true);
          }
        } catch (err) {
          console.error('Error detectando operación por placa', err);
          notifyError(err?.message || 'Error comprobando la placa.');
        } finally {
          setGuardando(false);
        }
      })();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validarFormulario = () => {
    const nErr = {};
    if (formData.traeNovedad && !formData.tipoNovedad) nErr.tipoNovedad = 'Requerido';
    // Evidencia fotográfica obligatoria para cualquier tipo de envío
    if (!imagenes.length) nErr.evidencia = modoCierre ? 'Debes adjuntar una evidencia de cierre.' : 'Debes adjuntar al menos una evidencia fotográfica.';
    if (!formData.tipoOperacion) {
      nErr.tipoOperacion = 'Requerido';
    } else if (esHoraFinal) {
      if (!formData.placa || !validarPlaca(formData.placa)) nErr.placa = 'Placa inválida';
    } else {
      if (!formData.bodega) nErr.bodega = 'Requerido';
      if (!formData.cliente || !formData.cliente.trim()) nErr.cliente = 'Requerido';
      if (!formData.muelle || parseInt(formData.muelle, 10) < 1) nErr.muelle = 'Requerido';
      if (!formData.conductor || !formData.conductor.trim()) nErr.conductor = 'Requerido';
      if (!formData.numeroCC || !/^[0-9]+$/.test(formData.numeroCC)) nErr.numeroCC = 'Número inválido';
      if (!formData.destino || !formData.destino.trim()) nErr.destino = 'Requerido';
      if (!formData.responsable || !formData.responsable.trim()) nErr.responsable = 'Requerido';
      if (!formData.asistente || !formData.asistente.trim()) nErr.asistente = 'Requerido';
      if (!formData.placa || !validarPlaca(formData.placa)) nErr.placa = 'Placa inválida';
    }
    setErrores(nErr);
    return Object.keys(nErr).length === 0;
  };

  const resetear = () => {
    setFormData({ tipoOperacion: '', bodega: '', cliente: '', muelle: '', conductor: '', numeroCC: '', placa: '', destino: '', responsable: '', asistente: '', observaciones: '' });
    resetImagenes(); setErrores({});
    setModoCierre(false);
    setOperacionCierre(null);
    setShowConfirmModal(false);
    setOperacionDetectada(null);
    setErroresCierre({});
    setLastCheckedPlaca('');
    setTextoEdicion('');
    setOriginalObservaciones(null);
    const cam = document.getElementById('camara'); const arc = document.getElementById('archivos'); if (cam) cam.value=''; if (arc) arc.value='';
  };

  // Se usan las mismas funciones `handleImagenesChange` / `eliminarImagen` para evidencias.

  const cerrarOperacionPorPlaca = async (placa, userId, userEmail, cierreExtra = {}, sede = sedeSeleccionada) => {
    const consulta = query(
      collection(db, 'cargues_descargues'),
      where('placa', '==', placa),
      where('sede', '==', sede),
      where('salidaRegistrada', '==', false)
    );
    const snap = await getDocs(consulta);

    if (snap.empty) {
      throw new Error('No hay operación activa para esta placa.');
    }

    const salida = new Date();
    let masReciente = null;
    let maxMs = -1;
    const updates = [];

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const entradaMs = obtenerMilisegundosEntrada(data);
      const duracionMinutos = Number.isNaN(entradaMs)
        ? null
        : Math.max(0, Math.round((salida.getTime() - entradaMs) / 60000));

      updates.push(updateDoc(doc(db, 'cargues_descargues', docSnap.id), {
        estado: 'FINALIZADO',
        salidaRegistrada: true,
        horaSalidaISO: salida.toISOString(),
        horaSalidaTexto: fechaBogotaTexto(salida),
        duracionMinutos,
        ...cierreExtra,
        closedBy: userEmail,
        finishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));

      if (!Number.isNaN(entradaMs) && entradaMs > maxMs) {
        maxMs = entradaMs;
        masReciente = { id: docSnap.id, placa: data.placa, duracionMinutos };
      }
    });

    await Promise.all(updates);

    if (!masReciente) {
      masReciente = { id: snap.docs[0].id, placa: snap.docs[0].data().placa, duracionMinutos: null };
    }

    return { placa: masReciente.placa, duracionMinutos: masReciente.duracionMinutos, operacionId: masReciente.id };
  };

  const handleConfirmCerrar = async () => {
    if (!operacionDetectada) return;
    setShowConfirmModal(false);
    setModoCierre(true);
    setOperacionCierre(operacionDetectada);
    setFormData({
      tipoOperacion: operacionDetectada.tipoOperacion || '',
      sede: operacionDetectada.sede || '',
      bodega: operacionDetectada.bodega || '',
      cliente: operacionDetectada.cliente || '',
      muelle: operacionDetectada.muelle || '',
      conductor: operacionDetectada.conductor || '',
      numeroCC: operacionDetectada.numeroCC || '',
      placa: operacionDetectada.placa || '',
      destino: operacionDetectada.destino || '',
      responsable: operacionDetectada.responsable || '',
      asistente: operacionDetectada.asistente || '',
      observaciones: operacionDetectada.observaciones || '',
    });
    setErroresCierre({});
    // Guardar la observación original para mostrarla como referencia y dejar el textarea vacío para la observación de cierre
    setOriginalObservaciones(operacionDetectada.observaciones || formData.observaciones || '');
    setTextoEdicion('');
    requestAnimationFrame(() => {
      cierreSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const obs = cierreSectionRef.current?.querySelector('textarea');
      if (obs && typeof obs.focus === 'function') obs.focus();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) { notifyError('Corrija los errores'); return; }
    setGuardando(true);
    setStatusText('Comprimiendo imágenes...');

    try {
      const userId = auth.currentUser?.uid;
      const userEmail = auth.currentUser?.email || '';

      let evidenciasSubidas = [];
      if (imagenes.length > 0) {
        setStatusText('Subiendo imágenes a la nube...');
        evidenciasSubidas = await subirEvidencias(imagenes, userId, 'operaciones');
      }

      setStatusText('Guardando registro en Firestore...');

      if (modoCierre) {
        const cierreExtra = {
          observaciones: originalObservaciones || null,
          observacionesCierre: textoEdicion?.trim() || null,
          evidencias: evidenciasSubidas,
          novedad: formData.traeNovedad ? { tipo: formData.tipoNovedad, detalle: textoEdicion?.trim() || null, fecha: fechaBogotaTexto(new Date()) } : null,
          fechaCierreTexto: fechaBogotaTexto(new Date()),
        };
        const resultado = await cerrarOperacionPorPlaca(operacionCierre?.placa || formData.placa, userId, userEmail, cierreExtra);
        notifySuccess(`${operacionCierre?.tipoOperacion || 'Operación'} finalizado para ${resultado.placa}. Duración: ${resultado.duracionMinutos ?? 'N/A'} minutos.`);

        if (formData.traeNovedad) {
          try {
            await addDoc(collection(db, NOVEDADES_COLLECTION), {
              tipo: formData.tipoNovedad,
              descripcion: textoEdicion?.trim() || '',
              sede: sedeSeleccionada,
              bodega: formData.bodega || null,
              operacionId: resultado.operacionId || null,
              placa: resultado.placa,
              userId,
              userEmail,
              evidencias: evidenciasSubidas,
              createdAt: serverTimestamp(),
              createdBy: userEmail,
            });
          } catch (err) {
            console.error('Error registrando novedad asociada al cierre', err);
            notifyError('Operación cerrada, pero no se pudo registrar la novedad.');
          }
        }
      } else {
        const ahora = new Date();
        const registro = {
          userId,
          userEmail,
          sede: sedeSeleccionada,
          ...formData,
          muelle: formData.muelle ? parseInt(formData.muelle, 10) : null,
          estado: 'EN_PROCESO',
          salidaRegistrada: false,
          horaEntradaISO: ahora.toISOString(),
          horaEntradaTexto: fechaBogotaTexto(ahora),
          horaSalidaISO: null,
          horaSalidaTexto: null,
          duracionMinutos: null,
          novedadCierre: null,
          novedad: formData.traeNovedad ? { tipo: formData.tipoNovedad, detalle: formData.observaciones?.trim() || null, fecha: fechaBogotaTexto(ahora) } : null,
          horaInicio: ahora.toISOString(),
          evidencias: evidenciasSubidas,
          observaciones: textoEdicion?.trim() || null,
          fechaCreacion: fechaBogotaTexto(ahora),
          createdAt: serverTimestamp(),
          createdBy: userEmail,
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'cargues_descargues'), registro);
        notifySuccess('Reporte enviado con éxito');
      }
      resetear();
    } catch (error) {
      console.error('Error guardando en Firestore', error);
      notifyError(error?.code === 'permission-denied'
        ? 'Firestore bloqueó la escritura. Tus reglas actuales no permiten guardar sin autenticación.'
        : error?.message || 'No se pudo guardar el registro en Firestore.');
    } finally {
      setGuardando(false);
      setStatusText('');
    }
  };

  const fieldBase = 'mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wide text-slate-700';
  const helperText = 'mt-1 text-[11px] text-slate-500';
  const errorText = 'mt-1 text-[11px] font-medium text-rose-600';
  const actionBase = 'inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
  const operationTheme = operationThemes[formData.tipoOperacion] || operationThemes.DEFAULT;
  const submitLabel = modoCierre ? 'FINALIZAR OPERACIÓN' : esHoraFinal ? 'REGISTRAR HORA FINAL' : formData.tipoOperacion === 'DESCARGUE' ? 'REGISTRAR DESCARGUE' : formData.tipoOperacion === 'CARGUE' ? 'REGISTRAR CARGUE' : 'REGISTRAR OPERACIÓN';
  const submitDisabled = guardando || imagenes.length === 0;

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
      <div className="border-b border-slate-100 bg-white px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-4">
          {!formData.tipoOperacion ? (
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {isClient ? <Lottie animationData={truckAnimation} loop style={{ width: 64, height: 64 }} /> : null}
            </div>
          ) : (formData.tipoOperacion === 'CARGUE' || formData.tipoOperacion === 'DESCARGUE') ? (
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {isClient ? (
                <Lottie
                  animationData={forkliftAnimation}
                  loop
                  style={formData.tipoOperacion === 'DESCARGUE' ? { width: 64, height: 64, transform: 'scaleX(-1)', transformOrigin: 'center' } : { width: 64, height: 64 }}
                />
              ) : null}
            </div>
          ) : (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${operationTheme.badge}`}>
              {operationTheme.icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Registro Operativo</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{operationTheme.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{operationTheme.description}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <fieldset disabled={modoCierre} className={modoCierre ? 'opacity-80' : ''}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <label className="block sm:col-span-2">
            <span className={labelBase}>Placa <span className="text-rose-500">*</span> <span className="ml-1 normal-case font-normal text-slate-500">(3 letras + 3 números)</span></span>
            <input name="placa" value={formData.placa} onChange={handlePlacaChange} placeholder="ABC123" maxLength="6" className={fieldBase + ' uppercase font-semibold tracking-[0.18em]'} />
            {formData.placa && validarPlaca(formData.placa) ? <span className="mt-1 text-[11px] font-medium text-emerald-600">✓ Placa válida</span> : errores.placa ? <span className={errorText}>{errores.placa}</span> : <span className={helperText}>Se valida automáticamente.</span>}
          </label>

          <label className="block sm:col-span-2">
            <span className={labelBase}>Tipo de Operación <span className="text-rose-500">*</span></span>
            <select  name="tipoOperacion" value={formData.tipoOperacion} onChange={handleInputChange} className={`${fieldBase} ${operationTheme.accentSoft} ring-1 ring-inset`}>
              <option value="">Seleccione una opción</option>
              <option value="CARGUE">CARGUE</option>
              <option value="DESCARGUE">DESCARGUE</option>
            </select>
            {errores.tipoOperacion ? <span className={errorText}>{errores.tipoOperacion}</span> : <span className={helperText}>Seleccione el tipo de operación.</span>}
          </label>

          <div className="sm:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <label className="block">
                <span className={labelBase}>Bodega <span className="text-rose-500">*</span></span>
                <select name="bodega" value={formData.bodega} onChange={handleInputChange} className={fieldBase}>
                  <option value="">Seleccione una bodega</option>
                  {bodegasDisponibles.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errores.bodega ? <span className={errorText}>{errores.bodega}</span> : <span className={helperText}>Bodegas de la sede: {sedeSeleccionada}</span>}
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

              {/* Placa ya está arriba (placa-first). */}

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

              {/* Observaciones movido fuera del fieldset para reutilizarlo en modo cierre */}
            </div>
            
          </div>
        </div>
        </fieldset>
        <div ref={cierreSectionRef} className="mt-6">
          {modoCierre && operacionCierre ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cierre de operación</p>
              <p className="mt-1 text-sm text-slate-700">Cliente: <span className="font-semibold text-slate-900">{formData.cliente || 'Sin dato'}</span> · Placa: <span className="font-semibold text-slate-900">{formData.placa}</span></p>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input id="traeNovedad" type="checkbox" checked={!!formData.traeNovedad} onChange={(e) => setFormData(prev => ({ ...prev, traeNovedad: e.target.checked }))} className="h-4 w-4" />
                  <label htmlFor="traeNovedad" className={labelBase + ' normal-case'}>Trae novedad</label>
                </div>
                {formData.traeNovedad ? (
                  <div className="relative w-52 sm:w-64">
                    <select name="tipoNovedad" value={formData.tipoNovedad || ''} onChange={handleInputChange} className={fieldBase + ' w-full appearance-none pr-10'}>
                      <option value="">Tipo de novedad</option>
                      <option value="DEVOLUCION">Devolución</option>
                      <option value="AVERIA">Avería</option>
                      <option value="DIFERENCIA DE PESO">Diferencia  de Peso</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" focusable="false">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                ) : null}
              </div>
              {errores.tipoNovedad ? <p className={errorText}>{errores.tipoNovedad}</p> : null}
              <div className="mt-3">
                <span className={labelBase}>Observaciones <span className="normal-case font-normal text-slate-500">{modoCierre ? '(Usar para observaciones de cierre)' : '(Opcional)'}</span></span>
              </div>
            </div>
            {modoCierre && originalObservaciones ? (
              <div className="mb-3 rounded-md border border-slate-100 bg-white p-3 text-sm text-slate-700">
                <p className="font-semibold text-xs text-slate-500">Observaciones iniciales</p>
                <p className="whitespace-pre-wrap mt-1 text-sm">{originalObservaciones}</p>
              </div>
            ) : null}
            <textarea name="observaciones" value={textoEdicion} onChange={(e) => setTextoEdicion(e.target.value)} placeholder={modoCierre ? 'Ingrese observaciones de cierre o detalle de la novedad...' : 'Ingrese observaciones adicionales...'} rows="4" className={fieldBase + ' h-auto py-3'} />

              <div className="mt-4">
              <div className="mb-3">
                <span className={labelBase}>Evidencias <span className="normal-case font-normal text-slate-500">{modoCierre ? '(Obligatorio)' : '(Obligatorio)'}</span></span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label htmlFor="camara" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition shadow-sm" style={{background: clientConfig.gradients.secundario}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera-icon lucide-camera" aria-hidden="true" focusable="false">
                    <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <span className="ml-2">Registrar Evidencia</span>
                </label>
                {/* <label htmlFor="archivos" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition shadow-sm" style={{background: 'linear-gradient(90deg, #0C3C6B 0%, #092f53 100%)'}}>
                  <span>🖼️</span>
                  Seleccionar Archivos
                </label> */}
                <input id="camara" type="file" accept="image/jpeg,image/png" capture="environment" multiple onChange={handleImagenesChange} className="hidden" />

                {/* <label htmlFor="archivos" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                  <span>🖼️</span>
                  Seleccionar Archivos
                </label> */}
                <input id="archivos" type="file" accept="image/jpeg,image/png" multiple onChange={handleImagenesChange} className="hidden" />
              </div>

              {previews.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Imágenes adjuntas ({previews.length})</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {previews.map((p, i) => (
                      <div key={i} className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <button type="button" onClick={() => eliminarImagen(i)} className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 shadow cursor-pointer">
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

              {errores.evidencia ? <p className={errorText}>{errores.evidencia}</p> : null}
            </div>
          </div>
        </div>

        {showConfirmModal && operacionDetectada ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Confirmar cierre</h3>
              <p className="mt-2 text-sm text-slate-700">¿Desea finalizar la operación del vehículo <strong>{operacionDetectada.placa}</strong>?</p>
              {operacionDetectada.horaEntradaTexto ? <p className="mt-1 text-xs text-slate-500">Inicio: {operacionDetectada.horaEntradaTexto}</p> : null}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setShowConfirmModal(false); setOperacionDetectada(null); setLastCheckedPlaca(''); }} className={`${actionBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200`}>Cancelar</button>
                <button type="button" onClick={handleConfirmCerrar} disabled={guardando} className={`${actionBase} ${operationTheme.button} text-white`}>{guardando ? 'PROCESANDO...' : 'Continuar'}</button>
              </div>
            </div>
          </div>
        ) : null}

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          {imagenes.length === 0 ? <p className="mt-1 text-[11px] font-medium text-red-600 sm:order-first sm:mb-2">Debes adjuntar al menos una imagen para poder enviar el reporte.</p> : null}
          {guardando && statusText ? <p className="text-xs text-slate-500 animate-pulse sm:order-first">{statusText}</p> : null}
          <button type="submit" disabled={submitDisabled} className={`${actionBase} h-12 text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60`} style={{background: clientConfig.gradients.primario, boxShadow: '0 10px 30px rgba(249,126,5,0.12)'}}>
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
