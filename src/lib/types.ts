import { Timestamp } from 'firebase/firestore';

export type UserRole = 'vigilante' | 'operador' | 'supervisor' | 'admin';

export type TipoOperacion = 'CARGUE' | 'DESCARGUE' | 'HORA_FINAL';
export type EstadoOperacion = 'EN_PROCESO' | 'FINALIZADO';

export type TipoApertura = 'REJA' | 'CUARTO';

export type TipoNovedad =
  | 'ACCIDENTE_TRABAJO'
  | 'AVERIA'
  | 'RUPUTRA'
  | 'INCIDENTE_SEGURIDAD'
  | 'DANO_EQUIPO'
  | 'OTRO';

export interface Evidencia {
  id: string;
  url: string;
  path: string;
  nombre: string;
  tamano: number;
  tipo: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  role: UserRole;
  sede?: string;
  activo: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Operacion {
  userId: string;
  userEmail: string;
  sede: string;
  tipoOperacion: string;
  placa: string;
  bodega: string;
  cliente: string;
  muelle: number | null;
  conductor: string;
  numeroCC: string;
  destino: string;
  responsable: string;
  asistente: string;
  observaciones: string | null;
  traeNovedad: boolean;
  tipoNovedad: string;
  estado: EstadoOperacion;
  salidaRegistrada: boolean;
  horaEntradaISO: string;
  horaEntradaTexto: string;
  horaInicio: string;
  horaSalidaISO: string | null;
  horaSalidaTexto: string | null;
  duracionMinutos: number | null;
  novedadCierre: null;
  novedad: { tipo: string; detalle: string | null; fecha: string } | null;
  evidencias: Evidencia[];
  observacionesCierre?: string | null;
  fechaCierreTexto?: string;
  closedBy?: string;
  finishedAt?: Timestamp;
  fechaCreacion: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Apertura {
  tipoApertura: TipoApertura;
  sede: string;
  bodega: string;
  userId: string;
  userEmail: string;
  evidencias: Evidencia[];
  descripcion?: string;
  createdAt: string;
  createdBy: string;
}

export interface Novedad {
  tipo: TipoNovedad;
  descripcion: string;
  sede: string;
  bodega?: string;
  operacionId?: string;
  placa?: string;
  userId: string;
  userEmail: string;
  evidencias: Evidencia[];
  createdAt: string;
  createdBy: string;
}

export interface UserSedeSelection {
  sede: string;
  updatedAt: string;
}
