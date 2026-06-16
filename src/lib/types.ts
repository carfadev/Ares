export type UserRole = 'vigilante' | 'operador' | 'supervisor' | 'admin';

export type TipoOperacion = 'CARGUE' | 'DESCARGUE' | 'HORA_FINAL';
export type EstadoOperacion = 'ACTIVA' | 'CERRADA';

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
  placa: string;
  tipo: TipoOperacion;
  sede: string;
  bodega: string;
  userId: string;
  userEmail: string;
  estado: EstadoOperacion;
  evidencias: Evidencia[];
  novedad?: string;
  horaEntrada: string;
  horaEntradaISO: string;
  horaSalida?: string;
  horaSalidaISO?: string;
  duracionSegundos?: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  closedAt?: string;
  closedBy?: string;
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
