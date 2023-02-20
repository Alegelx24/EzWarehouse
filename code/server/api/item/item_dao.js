'use strict';
const sqlite = require('sqlite3');

//open the database
const db = new sqlite.Database('database.sqlite', (err) => {
    if(err) throw err;
});

//POST
exports.newItem = function(id, description, price, skuID, supplierID) {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO ITEM (ID, DESCRIPTION, PRICE, SUPPLIERID, SKUID) VALUES(?,?,?,?,?)";
        db.run(sql, [id, description, price, supplierID, skuID], function(err) {
            if(err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

//GET 1
exports.getItems = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM ITEM";
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
exports.getSpecificItem = (id, supplierId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM ITEM WHERE ITEM.id == ? AND supplierId == ?";
        db.get(sql, [id, supplierId], (err, rows) => {
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

  exports.getSoldItem = (id, supplierId) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM ITEM WHERE ITEM.id == ? AND supplierId == ?";
      db.all(sql, [id, supplierId], (err, rows) => {
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

  
  exports.getSoldItemS = (skuID, supplierId) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM ITEM WHERE ITEM.SKUId == ? AND supplierId == ?";
      db.all(sql, [skuID, supplierId], (err, rows) => {
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
exports.updateItem = (id ,supplierId ,newDescription, newPrice) => {
    return new Promise ((resolve, reject) => {
      const sql = "UPDATE ITEM SET DESCRIPTION = ?, PRICE = ? WHERE ITEM.id == ? AND supplierId == ?";
      db.run(sql, [newDescription, newPrice ,id, supplierId], (err, rows) => {
        if (err){
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

//DELETE

exports.deleteItem = (id, supplierId) => {
    return new Promise ((resolve, reject) => {
      const sql = "DELETE FROM ITEM WHERE ITEM.id == ? AND supplierId == ?";
      db.run(sql, [id, supplierId], (err, rows) => {
        if (err){
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

//delete per test
exports.deleteItemData = () => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM ITEM";
    db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};