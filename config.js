//MySQL connect
const mysql = require('mysql');
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "eyj1010*",
  database: "nodejs"
});
con.connect();
module.exports = con;