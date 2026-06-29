// Datos de sedes y bodegas (módulo único y reutilizable)
export const sedesConfig = {
  'ZONA FRANCA': {
    nombre: 'ZONA FRANCA',
    bodegas: [
      { nombre: 'BODEGA 2', cliente: '' },
      { nombre: 'BODEGA 4', cliente: '' },
      { nombre: 'BODEGA 5', cliente: '' },
      { nombre: 'BODEGA 6', cliente: '' }
    ]
  },
  'CELTA': {
    nombre: 'CELTA',
    bodegas: [
      { nombre: 'BODEGA 29', cliente: '' },
      { nombre: 'BODEGA 31/502', cliente: '' },
      { nombre: 'BODEGA 61', cliente: '' },
      { nombre: 'BODEGA 78', cliente: '' },
      { nombre: 'BODEGA 79', cliente: 'GWS' },
      { nombre: 'BODEGA 98', cliente: '' },
      { nombre: 'BODEGA 116', cliente: 'BAT' }
    ]
  },
  'INTEXZONA': {
    nombre: 'INTEXZONA',
    bodegas: [
      { nombre: 'BODEGA 13', cliente: '' },
      { nombre: 'BODEGA 40', cliente: '' },
      { nombre: 'BODEGA 95A', cliente: '' }
    ]
  },
  'RECODO': {
    nombre: 'RECODO',
    bodegas: [
      { nombre: 'RECODO LIFTIT', cliente: 'OXXO' }
    ]
  },
  'RIV': {
    nombre: 'RIV',
    bodegas: [
      { nombre: 'BODEGA 2i', cliente: '' },
      { nombre: 'BODEGA 5i', cliente: '' },
      { nombre: 'BODEGA 13i', cliente: '' }
    ]
  },
  'YUMBO CORTIJO': {
    nombre: 'YUMBO CORTIJO',
    bodegas: [
      { nombre: 'YUMBO CORTIJO', cliente: '' }
    ]
  },
  'TLC PISA': {
    nombre: 'TLC PISA',
    bodegas: [
      { nombre: 'TLC PISA', cliente: '' }
    ]
  },
  'LA ESTRELLA': {
    nombre: 'LA ESTRELLA',
    bodegas: [
      { nombre: 'LA ESTRELLA', cliente: 'GWS' }
    ]
  },
  'CARTAGENA': {
    nombre: 'CARTAGENA',
    bodegas: [
      { nombre: 'CARTAGENA', cliente: '' }
    ]
  },
  'SAN CAYETANO': {
    nombre: 'SAN CAYETANO',
    bodegas: [
      { nombre: 'BODEGA 5', cliente: 'BAT' }
    ]
  }
};

export const getSedes = () => Object.keys(sedesConfig);

export const getBodegasBySede = (sede) =>
  sedesConfig[sede]?.bodegas?.map((b) => b.nombre) || [];

export const getClienteByBodega = (sede, bodegaNombre) => {
  const bodega = sedesConfig[sede]?.bodegas?.find((b) => b.nombre === bodegaNombre);
  return bodega?.cliente || '';
};
