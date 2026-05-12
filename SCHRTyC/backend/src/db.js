const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    const connection = await pool.getConnection();
    
    // Tabla de prueba inicial
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        texto TEXT NOT NULL,
        ruta_imagen VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Noticias
    await connection.query(`
      CREATE TABLE IF NOT EXISTS noticias (
        id BIGINT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        fecha DATE,
        autor VARCHAR(100),
        publicada BOOLEAN DEFAULT FALSE,
        destacada BOOLEAN DEFAULT FALSE,
        descripcion TEXT,
        imagen VARCHAR(255),
        contenido TEXT,
        imagenes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Estaciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS estaciones (
        id INT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        tipo VARCHAR(50),
        frecuencia VARCHAR(50),
        streamUrl VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        imagen VARCHAR(255),
        descripcion TEXT
      )
    `);

    // Tabla Galeria
    await connection.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id BIGINT PRIMARY KEY,
        titulo VARCHAR(255),
        url VARCHAR(255),
        fecha DATE,
        autor VARCHAR(255),
        tecnica VARCHAR(255),
        formato VARCHAR(255),
        ciudad VARCHAR(255),
        año VARCHAR(50),
        descripcion TEXT,
        imagen VARCHAR(255),
        telefono VARCHAR(50),
        fecha_registro DATE
      )
    `);

    // Tabla Galeria Filtros
    await connection.query(`
      CREATE TABLE IF NOT EXISTS galeria_filtros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE
      )
    `);

    // Tabla Programas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS programas (
        id INT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        conductor VARCHAR(255),
        horario VARCHAR(255),
        descripcion TEXT,
        descripcionLarga TEXT,
        imagen VARCHAR(255),
        tipo VARCHAR(50),
        estacion VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        embeds JSON
      )
    `);

    // Tabla Programacion
    await connection.query(`
      CREATE TABLE IF NOT EXISTS programacion (
        id INT PRIMARY KEY,
        hora_inicio VARCHAR(10),
        hora_fin VARCHAR(10),
        dia VARCHAR(20),
        nombre VARCHAR(255),
        conductor VARCHAR(255),
        estacion VARCHAR(255),
        descripcion TEXT,
        tipo VARCHAR(50)
      )
    `);

    // Tabla Paginas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS paginas (
        slug VARCHAR(100) PRIMARY KEY,
        titulo VARCHAR(255),
        herobadge VARCHAR(255),
        herodescripcion TEXT,
        seccionlabel VARCHAR(255),
        secciontitulo VARCHAR(255),
        contenido TEXT,
        imagenportada VARCHAR(255),
        multimedia TEXT,
        tramites JSON,
        integrantes JSON,
        ultimaactualizacion DATE
      )
    `);

    // Tabla Configuracion
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INT PRIMARY KEY,
        identidad JSON,
        contacto JSON,
        redes JSON,
        seo JSON,
        sistema JSON
      )
    `);

    console.log('Tablas verificadas/creadas con éxito.');
    
    // Intentar seeding
    await seedDB(connection);

    connection.release();
  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    process.exit(1);
  }
}

async function seedDB(connection) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) return;

  const tablesToSeed = [
    { table: 'noticias', file: 'noticias_db.json' },
    { table: 'estaciones', file: 'estaciones_db.json' },
    { table: 'galeria', file: 'galeria_db.json' },
    { table: 'programas', file: 'programas_db.json' },
    { table: 'programacion', file: 'programacion_db.json' },
    { table: 'paginas', file: 'paginas_db.json', isObject: true },
    { table: 'configuracion', file: 'configuracion_db.json', isSingle: true },
    { table: 'galeria_filtros', file: 'galeria_filtros.json', isSimpleArray: true }
  ];

  for (const item of tablesToSeed) {
    const filePath = path.join(dataDir, item.file);
    if (fs.existsSync(filePath)) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${item.table}`);
        if (rows[0].count === 0) {
          console.log(`Seedeando tabla ${item.table}...`);
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

          if (item.isSingle) {
            await connection.query(`INSERT INTO ${item.table} (id, identidad, contacto, redes, seo, sistema) VALUES (?, ?, ?, ?, ?, ?)`, 
              [1, JSON.stringify(content.identidad), JSON.stringify(content.contacto), JSON.stringify(content.redes), JSON.stringify(content.seo), JSON.stringify(content.sistema)]);
          } else if (item.isObject) {
            for (const slug in content) {
              const p = content[slug];
              await connection.query(`INSERT INTO ${item.table} (slug, titulo, herobadge, herodescripcion, seccionlabel, secciontitulo, contenido, imagenportada, multimedia, tramites, integrantes, ultimaactualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [slug, p.titulo, p.herobadge, p.herodescripcion, p.seccionlabel, p.secciontitulo, p.contenido, p.imagenportada, p.multimedia, 
                 typeof p.tramites === 'string' ? p.tramites : JSON.stringify(p.tramites), 
                 typeof p.integrantes === 'string' ? p.integrantes : JSON.stringify(p.integrantes), 
                 p.ultimaactualizacion]);
            }
          } else if (item.isSimpleArray) {
            for (const val of content) {
              await connection.query(`INSERT INTO ${item.table} (nombre) VALUES (?)`, [val]);
            }
          } else {
            for (const row of content) {
              const keys = Object.keys(row);
              const values = Object.values(row).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
              const placeholders = keys.map(() => '?').join(', ');
              await connection.query(`INSERT INTO ${item.table} (${keys.join(', ')}) VALUES (${placeholders})`, values);
            }
          }
        }
      } catch (err) {
        console.error(`Error seedeando ${item.table}:`, err.message);
      }
    }
  }
}

module.exports = { pool, initDB };

