import { useState, useCallback } from 'react';

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
}

export function useEvidencias(): UseEvidenciasReturn {
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);

  const handleImagenesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => ['image/jpeg', 'image/png'].includes(f.type));
    if (valid.length === 0) return;

    setImagenes((prev) => [...prev, ...valid]);

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, { name: file.name, url: reader.result as string }]);
      reader.readAsDataURL(file);
    });
  }, []);

  const eliminarImagen = useCallback((index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetImagenes = useCallback(() => {
    setImagenes([]);
    setPreviews([]);
  }, []);

  return { imagenes, previews, handleImagenesChange, eliminarImagen, resetImagenes };
}
