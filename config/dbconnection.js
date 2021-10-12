const mysql = require('mysql2/promise');
const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'exchange',
  multipleStatements: true,
}

const pool = mysql.createPool(config);

module.exports = { pool, config };
