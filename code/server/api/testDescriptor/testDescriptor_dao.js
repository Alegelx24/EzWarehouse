'use strict';
const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('database.sqlite', (err) => {
    if(err) throw err;
});

//POST
exports.newTestDescriptor = function (name, procedureDescription, skuID) {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO TESTDESCRIPTOR(NAME, PROCEDUREDESCRIPTION, IDSKU) VALUES(?,?,?)";
      db.run(sql, [name, procedureDescription, skuID], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  } 

//GET 1
  exports.getTestDescriptors = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM TESTDESCRIPTOR";
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }
//GET 2
  exports.getSpecificTD = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM TESTDESCRIPTOR WHERE TESTDESCRIPTOR.id == ?";
        db.get(sql, [id], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }else {
            if(rows === undefined){
              resolve(undefined);
              return;
            }
            resolve(rows);
            return;
          }
        });
      });      
  }
//PUT
exports.updateTestDescriptor = (id, newName, newProcedureDescription, newSkuID) => {
  return new Promise ((resolve, reject) => {
    const sql = "UPDATE TESTDESCRIPTOR SET NAME = ?, PROCEDUREDESCRIPTION = ?, IDSKU = ? WHERE TESTDESCRIPTOR.id == ?";
    db.run(sql, [newName, newProcedureDescription, newSkuID ,id], (err, rows) => {
      if (err){
        reject(err);
        return;
      }
      resolve();
    });
  });
}


//DELETE
exports.deleteTestDescriptor = (id) => {
  return new Promise ((resolve, reject) => {
    const sql = "DELETE FROM TESTDESCRIPTOR WHERE TESTDESCRIPTOR.id == ?";
    db.run(sql, [id], (err, rows) => {
      if (err){
        reject(err);
        return;
      }
      resolve();
    });
  });
}

//delete per test
exports.deleteTestDescriptorData = () => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM TESTDESCRIPTOR";
    db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};

