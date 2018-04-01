var mysql = require("mysql");
const dbConfig = {
  user:'test',
  password:'aA~8812!',
  host:'localhost',
  port:'3306',
  database:'kd'
};
function connect(table){
  return require("../db/index.js")(Object.assign({
    table:table
  },dbConfig));
}

module.exports = connect;