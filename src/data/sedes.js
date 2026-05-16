// Datos de sedes y bodegas (módulo único y reutilizable)
export const sedesConfig = {
  'ZONA FRANCA': {
    nombre: 'ZONA FRANCA',
    bodegas: ['ZONA FRANCA 2', 'ZONA FRANCA 4', 'ZONA FRANCA 5', 'ZONA FRANCA 6']
  },
  'CELTA': {
    nombre: 'CELTA',
    bodegas: ['BODEGA 79', 'BODEGA 29', 'BODEGA 78', 'BODEGA 61', 'BODEGA 98/2', 'BODEGA 31/502', 'BODEGA 116']
  },
  'INTEXZONA': { nombre: 'INTEXZONA', bodegas: ['BODEGA 13', 'BODEGA 40', 'BODEGA 95A', 'BODEGA 95B'] },
  'RECODO': { nombre: 'RECODO', bodegas: ['RECODO'] },
  'RIV': { nombre: 'RIV', bodegas: ['BODEGA 5i', 'BODEGA 2i', 'BODEGA 13i'] },
  'YUMBO CORTIJO': { nombre: 'YUMBO CORTIJO', bodegas: ['YUMBO CORTIJO'] },
  'TLC PISA': { nombre: 'TLC PISA', bodegas: ['TLC PISA'] },
  'LA ESTRELLA MEDELLIN': { nombre: 'LA ESTRELLA MEDELLIN', bodegas: ['LA ESTRELLA MEDELLIN'] },
  'CARTAGENA': { nombre: 'CARTAGENA', bodegas: ['CARTAGENA'] },
  'SAN CAYETANO': { nombre: 'SAN CAYETANO', bodegas: ['BODEGA 5'] }
};

export const getSedes = () => Object.keys(sedesConfig);

export const getBodegasBySede = (sede) => sedesConfig[sede]?.bodegas || [];
