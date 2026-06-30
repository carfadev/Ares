import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { comprimirImagen } from './compresion';

export interface EvidenciaSubida {
  id: string;
  url: string;
  path: string;
  nombre: string;
  tamano: number;
  tipo: string;
  createdAt: string;
}

function conTimeout<T>(promesa: Promise<T>, ms: number = 30000): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`La operación tardó más de ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function subirEvidencia(
  file: File,
  tipo: string,
  idRegistro: string,
  userId: string,
  indice: number = 1
): Promise<EvidenciaSubida> {
  const nombre = `evidencia_${indice}_${Date.now()}.webp`;
  const path = `evidencias/${tipo}/${idRegistro}/${nombre}`;

  let blob: Blob;
  try {
    blob = await conTimeout(comprimirImagen(file), 15000);
  } catch {
    throw new Error(`No se pudo procesar la imagen: ${file.name}`);
  }

  const storageRef = ref(storage, path);

  const metadata = {
    contentType: 'image/webp',
    customMetadata: {
      userId,
      nombreOriginal: file.name,
    },
  };

  try {
    await conTimeout(uploadBytes(storageRef, blob, metadata), 30000);
  } catch (err: any) {
    if (err?.code === 'storage/unauthorized') {
      throw new Error('Storage: no tienes permisos para subir archivos. Verifica las reglas de Storage.');
    }
    if (err?.code === 'storage/object-not-found') {
      throw new Error(`Storage: el bucket "${storage.app.options.storageBucket}" no existe o no coincide.`);
    }
    throw new Error(`Error al subir imagen a Storage: ${err?.message || 'desconocido'}`);
  }

  let url: string;
  try {
    url = await conTimeout(getDownloadURL(storageRef), 10000);
  } catch {
    throw new Error('No se pudo obtener la URL de descarga de la imagen.');
  }

  return {
    id: nombre.replace('.webp', ''),
    url,
    path,
    nombre: file.name,
    tamano: blob.size,
    tipo: 'image/webp',
    createdAt: new Date().toISOString(),
  };
}

export async function subirEvidencias(
  files: File[],
  tipo: string,
  idRegistro: string,
  userId: string,
  onProgress?: (completadas: number, total: number) => void
): Promise<EvidenciaSubida[]> {
  const resultados: EvidenciaSubida[] = [];

  const promises = files.map(async (file, i) => {
    const evidencia = await subirEvidencia(file, tipo, idRegistro, userId, i + 1);
    resultados[i] = evidencia;
    onProgress?.(resultados.filter(Boolean).length, files.length);
    return evidencia;
  });

  try {
    return await Promise.all(promises);
  } catch (err) {
    for (const ev of resultados) {
      if (ev) {
        try { await deleteObject(ref(storage, ev.path)); } catch {}
      }
    }
    throw err;
  }
}

export async function eliminarEvidencia(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function eliminarEvidencias(evidencias: EvidenciaSubida[]): Promise<void> {
  await Promise.all(
    evidencias.map(ev =>
      deleteObject(ref(storage, ev.path)).catch(() => {})
    )
  );
}
