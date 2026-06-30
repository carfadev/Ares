const sharp = require('sharp');
const src = 'public/images/ares1.png';
Promise.all([
  sharp(src).resize(32, 32).toFile('public/icons/favicon-32.png'),
  sharp(src).resize(192, 192).toFile('public/icons/icon-192.png'),
  sharp(src).resize(512, 512).toFile('public/icons/icon-512.png'),
  sharp(src).resize(180, 180).toFile('public/icons/apple-touch-icon.png'),
]).then(() => console.log('OK')).catch(e => console.error(e));
