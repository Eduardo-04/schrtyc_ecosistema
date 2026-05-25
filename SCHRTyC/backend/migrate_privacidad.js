const db = require('../src/db')

const AVISOS_HARDCODEADOS = [
  { titulo: 'Recursos Humanos: Aviso de privacidad', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_1_rh.pdf' },
  { titulo: 'Recursos Materiales: Contratación y pago', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_2_rm.pdf' },
  { titulo: 'Recursos Materiales: Mobiliario y equipo', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_3_rm.pdf' },
  { titulo: 'Recursos Materiales: Resguardo vehicular', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_4_rm.pdf' },
  { titulo: 'Recursos Materiales: Contratación (Simplificado)', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_5_rm.pdf' },
  { titulo: 'Recursos Materiales: Mobiliario (Simplificado)', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_6_rm.pdf' },
  { titulo: 'Recursos Materiales: Vehicular (Simplificado)', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_7_rm.pdf' },
  { titulo: 'Unidad de Transparencia: Integrado', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_8_utint.pdf' },
  { titulo: 'Unidad de Transparencia: Simplificado', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_9_utsim.pdf' },
  { titulo: 'Documento de seguridad de datos', src: 'http://radiotvycine.chiapas.gob.mx/assets/docs/privacidad/1_10_ds.pdf' }
]

async function migrar() {
  try {
    let pool = db.pool
    const links = AVISOS_HARDCODEADOS.map(doc => `${doc.src} | ${doc.titulo}`).join('\n')

    const [rows] = await pool.query('SELECT multimedia FROM paginas WHERE slug = ?', ['aviso-privacidad'])
    let current = rows.length > 0 ? rows[0].multimedia || '' : ''
    
    // Only migrate if it hasn't been migrated yet (simple check)
    if (!current.includes('1_1_rh.pdf')) {
        let nuevo = current ? `${links}\n${current}` : links
        await pool.query('UPDATE paginas SET multimedia = ? WHERE slug = ?', [nuevo, 'aviso-privacidad'])
        console.log("Migración de Privacidad completada.")
    } else {
        console.log("Los enlaces de Privacidad ya existían en la base de datos.")
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

migrar()
