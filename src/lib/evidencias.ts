import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

function generarId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
  userId: string,
  carpeta: string = 'general'
): Promise<EvidenciaSubida> {
  const id = generarId();
  const nombre = `${id}.jpg`;
  const path = `evidencias/${userId}/${carpeta}/${nombre}`;

  let blob: Blob;
  try {
    blob = await conTimeout(comprimirImagen(file), 15000);
  } catch {
    throw new Error(`No se pudo procesar la imagen: ${file.name}`);
  }

  const storageRef = ref(storage, path);

  console.log('[Storage] Intentando subir a bucket:', storage.app.options.storageBucket);
  console.log('[Storage] Path:', path);

  const metadata = {
    contentType: 'image/jpeg',
    customMetadata: {
      userId,
      nombreOriginal: file.name,
    },
  };

  try {
    await conTimeout(uploadBytes(storageRef, blob, metadata), 30000);
  } catch (err: any) {
    console.error('[Storage] Error detallado:', err);
    if (err?.code === 'storage/unauthorized') {
      throw new Error('Storage: no tienes permisos para subir archivos. Verifica las reglas de Storage.');
    }
    if (err?.code === 'storage/object-not-found') {
      throw new Error(`Storage: el bucket "${storage.app.options.storageBucket}" no existe o no coincide. Verifica el nombre en Firebase Console.`);
    }
    throw new Error(`Error al subir imagen a Storage (bucket: ${storage.app.options.storageBucket}): ${err?.message || 'desconocido'}`);
  }

  let url: string;
  try {
    url = await conTimeout(getDownloadURL(storageRef), 10000);
  } catch {
    throw new Error('No se pudo obtener la URL de descarga de la imagen.');
  }

  return {
    id,
    url,
    path,
    nombre: file.name,
    tamano: blob.size,
    tipo: 'image/jpeg',
    createdAt: new Date().toISOString(),
  };
}

export async function subirEvidencias(
  files: File[],
  userId: string,
  carpeta: string = 'general'
): Promise<EvidenciaSubida[]> {
  const resultados: EvidenciaSubida[] = [];
  for (const file of files) {
    const evidencia = await subirEvidencia(file, userId, carpeta);
    resultados.push(evidencia);
  }
  return resultados;
}
