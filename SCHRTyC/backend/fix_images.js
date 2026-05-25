const fs = require('fs');
const path = require('path');
const http = require('http');

const legacyUrl = 'http://radiotvycine.chiapas.gob.mx';
const programasList = [
  { img: 'assets/img/backgrounds/1.jpg', filename: 'legacy_1779700552229_fsdth.jpg' },
  { img: 'assets/img/backgrounds/19.jpg', filename: 'legacy_1779700552731_49hs9.jpg' },
  { img: 'assets/img/backgrounds/3.jpg', filename: 'legacy_1779700552890_2r34q.jpg' },
  { img: 'assets/img/backgrounds/4.jpg', filename: 'legacy_1779700552998_ohlz0.jpg' },
  { img: 'assets/img/backgrounds/5.jpg', filename: 'legacy_1779700553105_hgcvu.jpg' },
  { img: 'assets/img/backgrounds/6.jpg', filename: 'legacy_1779700553208_ld6cz.jpg' },
  { img: 'assets/img/backgrounds/7.jpg', filename: 'legacy_1779700553323_m9j1b.jpg' },
  { img: 'assets/img/backgrounds/8.jpg', filename: 'legacy_1779700553425_v3zma.jpg' },
  { img: 'assets/img/backgrounds/20.jpg', filename: 'legacy_1779700553522_qsyf3.jpg' },
];

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  try {
    const uploadDir = path.join(__dirname, 'uploads', 'programas');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (let prog of programasList) {
      const imgUrl = `${legacyUrl}/${prog.img}`;
      const dest = path.join(uploadDir, prog.filename);
      
      console.log(`Descargando ${imgUrl} como ${prog.filename}...`);
      try {
        await downloadImage(imgUrl, dest);
        console.log(`✓ Descargado: ${prog.filename}`);
      } catch (e) {
        console.error(`Error con ${prog.filename}:`, e.message);
      }
    }
    console.log('¡Todas las imágenes arregladas!');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

run();
