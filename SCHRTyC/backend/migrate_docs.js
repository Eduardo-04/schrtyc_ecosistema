const db = require('./src/db')

const eticaContent = `▶ Documentos Oficiales
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/cod_hon_eti_chis.pdf | Código de Honestidad y Ética
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/cod_cond.pdf | Código de Conducta
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/cero_tol.pdf | Cero Tolerancia a Hostigamiento/Acoso Sexual
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/Acta-de-instalacion-comite-de-etica-y-prevencion.pdf | Acta de Instalación del Comité
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/informe_2022.pdf | Informe de Actividades 2022
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/informe_2023.pdf | Informe de Actividades 2023
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/acta_instalacion_25.pdf | Acta de Instalación 2025
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/convocatoria_2025.pdf | Convocatoria Comité de Ética 2025
https://forms.gle/ohhwnBogfokaQbgj7 | Cuestionario de Evaluación (GForms)
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/formato.pdf | Formato de Quejas y Denuncias
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/directorio.pdf | Directorio del Comité de Ética
https://forms.gle/txHfSa9mAkm44r2h6 | Encuesta Código de Honestidad (GForms)
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/lenguaje_incluyente.pdf | Guía de Lenguaje Incluyente
http://radiotvycine.chiapas.gob.mx/assets/docs/etica/ppashsas.pdf | Protocolo Hostigamiento y Acoso`

const transContent = `▶ Presupuesto del SCHRTyC
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/PrGe25.pdf | Presupuesto General 2025 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/PrGeDe25.pdf | Presupuesto General Desglosado 2025 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/PrOpEsRaTv25.pdf | Presupuesto Operativo Radio y TV 2025 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/PrGe24.pdf | Presupuesto General 2024 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/PrGeDe24.pdf | Presupuesto General Desglosado 2024 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/PrOpEsRaTv24.pdf | Presupuesto Operativo Radio y TV 2024 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/Presupuesto-General-SCHRTyC-2023.pdf | Presupuesto General 2023 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/Presupuesto-General-Desglosado-SCHRTyC-2023.pdf | Presupuesto General Desglosado 2023 (PDF)
http://radiotvycine.chiapas.gob.mx/assets/docs/transparencia/Presupuesto-Operativo-de-la-Estacion-de-Radio-y-TV-2023.pdf | Presupuesto Operativo Radio y TV 2023 (PDF)

▶ Licitaciones
http://radiotvycine.chiapas.gob.mx/assets/docs/licitaciones/BASES_IR_PALENQUE.pdf | Licitación IR/21210770-003/2023
http://radiotvycine.chiapas.gob.mx/assets/docs/licitaciones/BASES_IR_Radio.pdf | Licitación IR/21210770-004/2023
http://radiotvycine.chiapas.gob.mx/assets/docs/licitaciones/BASES_IR_52101.pdf | Licitación IR/21210770-005/2023

▶ SEVAC
http://radiotvycine.chiapas.gob.mx/sevac2025.html | Información 2025
http://radiotvycine.chiapas.gob.mx/sevac2024.html | Información 2024
http://radiotvycine.chiapas.gob.mx/sevac2023.html | Información 2023
http://radiotvycine.chiapas.gob.mx/sevac2022.html | Información 2022
http://radiotvycine.chiapas.gob.mx/sevac2021.html | Información 2021

▶ Documentos CONAC
http://radiotvycine.chiapas.gob.mx/conac2026.html | Información 2026
http://radiotvycine.chiapas.gob.mx/conac2025.html | Información 2025
http://radiotvycine.chiapas.gob.mx/conac2024.html | Información 2024
http://radiotvycine.chiapas.gob.mx/conac2023.html | Información 2023

▶ Plataformas de Transparencia
https://www.plataformadetransparencia.org.mx/inicio | Plataforma Nacional (SIPOT)
http://radiotvycine.transparencia.chiapas.gob.mx/ | Sistema Estatal (SIGOT)

▶ Sistema Institucional de Archivos (SIA)
http://radiotvycine.chiapas.gob.mx/assets/docs/SIA/acuerdo_general.pdf | Acuerdo General
http://radiotvycine.chiapas.gob.mx/assets/docs/SIA/pada25.pdf | Programa Anual de Desarrollo Archivístico 2025
http://radiotvycine.chiapas.gob.mx/assets/docs/SIA/prog_2026.pdf | Programa Anual de Desarrollo Archivístico 2026
http://radiotvycine.chiapas.gob.mx/assets/docs/SIA/reglas.pdf | Reglas de operación del grupo interdisciplinario`

const partContent = `▶ Convocatorias
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Convocatoria_24.pdf | Convocatoria CCRT 2024
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Segunda-convocatoria_consejo_2022.pdf | Convocatoria Secretario(a) Técnico(a) (Ago 2022)
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/convocatoria_consejo_2022_MAYO.pdf | Convocatoria Secretario(a) Técnico(a) (May 2022)
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/CONVOCATORIA-PARA-RENOVAR-EL-CONSEJO-CIUDADANO-DE-RADIO-Y-TELEVISION.pdf | Convocatoria Renovación CCRT (Ago 2021)
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/CONVOCATORIA-2019-FEBRERO.pdf | Tercera Convocatoria (Feb 2019)
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Segunda-Convocatoria-Consejo-Ciudadano.pdf | Segunda Convocatoria (Ene 2019)
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/CONVOCATORIA-CONSEJO-CIUDADANO.pdf | Primer Convocatoria (Dic 2018)

▶ Elección del Consejo Ciudadano
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/actaElecSecTecCCRT22.pdf | Acta de Elección Secretario(a) Técnico(a) 2022
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/proSelSecreCCRT22.pdf | Proceso de Selección Secretario(a) Técnico(a) 2022

▶ Normatividad
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Reglamento-del-Consejo-Ciudadano-del-SCHRTyC.pdf | Reglamento del Consejo Ciudadano

▶ Actas de las Sesiones
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Acta-Consejo-Ciudadano-2021-DICIEMBRE-.pdf | Sesión 23 de Diciembre 2021
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Sesion-del-Consejo-Ciudadano-de-Radio-y-Televisio%CC%81n-2-de-Abril-de-2020.pdf | Sesión 2 de Abril 2020
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Sesion-del-Consejo-Ciudadano-de-Radio-y-Televisio%CC%81n-15-de-Enero-2020.pdf | Sesión 15 de Enero 2020
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Sesio%CC%81n-del-Consejo-Ciudadano-de-Radio-y-Televisio%CC%81n-9-de-diciembre-2019.pdf | Sesión 9 de Diciembre 2019
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Sesio%CC%81n-del-Consejo-Ciudadano-de-Radio-y-Televisio%CC%81n-11-Septiembre-2019.pdf | Sesión 11 de Septiembre 2019
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Sesio%CC%81n-del-Consejo-Ciudadano-de-Radio-y-Televisio%CC%81n-23-de-Abril-de-2019.pdf | Sesión 23 de Abril 2019

▶ Documentos Propuestos por el CCRT
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Criterios-Independencia-Editorial-SHCRTyC.pdf | Criterios para Garantizar la Independencia Editorial
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/Participacio%CC%81nCiudadana.pdf | Criterios para Garantizar la Participación Ciudadana
http://radiotvycine.chiapas.gob.mx/assets/docs/consejo/ReglasDeExpresion.pdf | Reglas para Garantizar la Expresión de Diversidades

▶ Defensoría de las Audiencias
http://radiotvycine.chiapas.gob.mx/assets/docs/defensoria/CODIGO-DE-ETICA-DEL-SCHRTYC.pdf | Código de Ética del SCHRTyC`

async function run() {
  try {
    const conn = await db.pool.getConnection()
    
    // Update Etica
    await conn.query('UPDATE paginas SET multimedia = ? WHERE slug = ?', [eticaContent, 'etica'])
    
    // Update Transparencia
    await conn.query('UPDATE paginas SET multimedia = ? WHERE slug = ?', [transContent, 'transparencia'])
    
    // Update Participacion
    await conn.query('UPDATE paginas SET multimedia = ? WHERE slug = ?', [partContent, 'participacion'])

    console.log('Migración de documentos completa.')
    conn.release()
    process.exit(0)
  } catch (err) {
    console.error('Error migrando:', err)
    process.exit(1)
  }
}

run()
