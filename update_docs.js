const fs = require('fs');
const dbPath = 'd:/SISTEMA/schrtyc_ecosistema/SCHRTyC/backend/src/data/configuracion_db.json';
let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const docsStr = JSON.stringify(data.sistema.documentos).replace(/'/g, "''");

const query = `UPDATE configuracion SET datos = JSON_SET(datos, '$.sistema.documentos', '${docsStr}') WHERE id = 1;`;
fs.writeFileSync('d:/SISTEMA/schrtyc_ecosistema/update_docs.sql', query);
