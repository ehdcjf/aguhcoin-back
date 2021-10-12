const dbinit=()=>{
  const mysql = require('mysql2')
  const fs = require('fs');
  const sql = fs.readFileSync("./dbinit.sql").toString();
  let {config} = require('./config/dbconnection')
  delete config.database;
  const con = mysql.createConnection(config);
  
  con.connect(function(err) {
    if (err) throw err;
    
    const result = con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Database created");
    });
  });
}


module.exports={
  dbinit,
}