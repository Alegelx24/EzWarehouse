'use strict';
const sqlite = require('sqlite3');

//open the database
const db = new sqlite.Database('database.sqlite', (err) => {
    if(err) throw err;
});

//POST
exports.newTestResult = function(rfid, testDescriptorId, date, result) {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO TESTRESULT(IDTESTDESCRIPTOR, RFID, DATE, RESULT) VALUES(?,?,?,?)";
      db.run(sql, [testDescriptorId, rfid, date, result], function(err) {
        if (err) {
            reject(err);
            return;
        }
        resolve(this.lastID);
      });
    });
  }

//GET 1
exports.getTestResults = (rfid) =>{
    return new Promise((resolve, reject) => {
        const sql = "SELECT ID, IDTESTDESCRIPTOR, DATE, RESULT FROM TESTRESULT WHERE TESTRESULT.rfid == ?";
        db.all(sql, [rfid], (err, rows) => {    
            if(err){
                reject(err);
                return;
            }
            rows.map((row) => {
                if (row.Result === 1) {
                    row.Result = true;
                }else if(row.Result === 0)
                    row.Result = false;
              }); 
            resolve(rows);
            return;
        });
    });
}



//GET 2

exports.getSpecificTR = (rfid, id) =>{
    return new Promise((resolve, reject) =>{
        const sql = "SELECT ID, IDTESTDESCRIPTOR, DATE, RESULT FROM TESTRESULT WHERE TESTRESULT.id == ? AND TESTRESULT.rfid == ?";
        db.get(sql, [id, rfid], (err, rows) => {  
            if(err){
                reject(err);
                return;
            }
            if(rows === undefined){
                resolve(undefined);
                return;
            }
            if (rows.Result === 1) {
                rows.Result = true;
            }else if(rows.Result === 0)
                rows.Result = false;
            resolve(rows);
            return;
        });
    });
}

exports.getTestResult = (id) =>{
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM TESTRESULT WHERE TESTRESULT.id == ?"
        db.get(sql, [id], (err, rows) =>{
            if(err){
                reject(err);
                return;
            }
            else{
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
exports.updateTestResult = (rfid, id, newTestDescriptorId, newDate, newResult) =>{
    return new Promise((resolve, reject) => {
        const sql = "UPDATE TESTRESULT SET IDTESTDESCRIPTOR = ?, DATE = ?, RESULT = ? WHERE TESTRESULT.id == ? AND TESTRESULT.rfid == ?";
        db.run(sql, [newTestDescriptorId, newDate, newResult, id, rfid], (err, rows) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}


//DELETE

exports.deleteTestResult = (rfid, id) =>{
    return new Promise ((resolve, reject) =>{
        const sql = "DELETE FROM TESTRESULT WHERE TESTRESULT.id == ? AND TESTRESULT.rfid == ?";
        db.run(sql, [id, rfid], (err, rows) =>{
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}

//delete per test
exports.deleteTestResultData = () => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM TESTRESULT";
      db.run(sql, [], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  };