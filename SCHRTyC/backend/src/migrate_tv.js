const fs = require('fs');
const path = require('path');
const http = require('http');

const legacyUrl = 'http://radiotvycine.chiapas.gob.mx';
const programasList = [
  { img: 'assets/img/backgrounds/1.jpg', name: 'Cocina', link: 'tv_cocina.html' },
  { img: 'assets/img/backgrounds/19.jpg', name: 'Programa Especial', link: '' },
  { img: 'assets/img/backgrounds/3.jpg', name: 'Entretenimiento', link: '' },
  { img: 'assets/img/backgrounds/4.jpg', name: 'Documental', link: '' },
  { img: 'assets/img/backgrounds/5.jpg', name: 'Mosaico', link: 'tv_mosaico.html' },
  { img: 'assets/img/backgrounds/6.jpg', name: 'Cultura', link: '' },
  { img: 'assets/img/backgrounds/7.jpg', name: 'Salud', link: 'tv_salud.html' },
  { img: 'assets/img/backgrounds/8.jpg', name: 'Ecosistemas', link: 'tv_ecosistemas.html' },
  { img: 'assets/img/backgrounds/20.jpg', name: 'Entrevistas', link: '' },
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
    const uploadDir = path.join(__dirname, '..', 'uploads', 'programas');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let sqlStr = "SELECT @max_id := IFNULL(MAX(id), 0) FROM programas;\n";
    
    for (let prog of programasList) {
      const imgUrl = `${legacyUrl}/${prog.img}`;
      const ext = path.extname(prog.img) || '.jpg';
      const filename = `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}${ext}`;
      const dest = path.join(uploadDir, filename);
      
      console.log(`Descargando ${imgUrl}...`);
      try {
        await downloadImage(imgUrl, dest);
        
        const relativePath = `/uploads/programas/${filename}`;
        const desc = `Programa recuperado del archivo histórico del Canal 10. ${prog.name}.`;
        
        sqlStr += `SET @max_id = @max_id + 1;\n`;
        sqlStr += `INSERT INTO programas (id, nombre, conductor, horario, descripcion, descripcionLarga, imagen, tipo, estacion, activo, embeds) VALUES (@max_id, '${prog.name}', 'Canal 10', 'Consultar Cartelera', '${desc}', '', '${relativePath}', 'TV', 'Canal 10', 1, '[]');\n`;
        
        console.log(`Descargado e insertado: ${prog.name}`);
      } catch (e) {
        console.error(`Error con ${prog.name}:`, e.message);
      }
    }
    fs.writeFileSync('insert_programas.sql', sqlStr);
    console.log('Migración completada! insert_programas.sql generado.');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

run();
