import { useState, useCallback } from 'react';
import { notifyError } from '../lib/toast';

interface Preview {
  name: string;
  url: string;
}

interface UseEvidenciasReturn {
  imagenes: File[];
  previews: Preview[];
  handleImagenesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  eliminarImagen: (index: number) => void;
  resetImagenes: () => void;
  total: number;
  maxLimit: number;
}

export function useEvidencias(maxLimit: number = Infinity): UseEvidenciasReturn {
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);

  const handleImagenesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => ['image/jpeg', 'image/png'].includes(f.type));
    if (valid.length === 0) return;

    setImagenes((prev) => {
      const disponibles = maxLimit - prev.length;
      if (disponibles <= 0) {
        notifyError(`Máximo ${maxLimit} imágenes por reporte.`);
        return prev;
      }
      const aceptadas = valid.slice(0, disponibles);
      if (aceptadas.length < valid.length) {
        notifyError(`Solo se permiten ${maxLimit} imágenes. Se agregaron ${aceptadas.length}.`);
      }
      aceptadas.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => setPreviews((current) => [...current, { name: file.name, url: reader.result as string }]);
        reader.readAsDataURL(file);
      });
      return [...prev, ...aceptadas];
    });
  }, [maxLimit]);

  const eliminarImagen = useCallback((index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetImagenes = useCallback(() => {
    setImagenes([]);
    setPreviews([]);
  }, []);

  return { imagenes, previews, handleImagenesChange, eliminarImagen, resetImagenes, total: imagenes.length, maxLimit };
}
