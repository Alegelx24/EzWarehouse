'use strict';
/* Data Access Object (DAO) module for accessing Position data */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('database.sqlite', (err) => {
    if(err) throw err;
});

exports.getAllPosition = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        *
      FROM Position;`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else {
        const positions = rows.map((row) => ({
          positionID: row.id,
          aisleID: row.aisle,
          row: row.row,
          col: row.col,
          maxWeight: row.maxWeight,
          maxVolume: row.maxVolume,
          occupiedWeight: row.occupiedWeight,
          occupiedVolume: row.occupiedVolume,
        }));
        resolve(positions);
      }
    });
  })
}

exports.getPositionById = (positionID) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM Position WHERE id = ?;`;
    db.get(sql, [positionID], function (err, row) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(row);
      }
    });
  });
};

exports.newPosition = (positionID, aisleID, row, col, maxWeight, maxVolume) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Position(id, aisle, row, col, maxWeight, maxVolume, occupiedWeight, occupiedVolume)
      VALUES (?,?,?,?,?,?,0,0);
    `;
    db.run(
      sql,
      [positionID, aisleID, row, col, maxWeight, maxVolume],
      function (err) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

exports.updatePosition = (
  positionID,
  newAisleID,
  newRow,
  newCol,
  newMaxWeight,
  newMaxVolume,
  newOccupiedWeight,
  newOccupiedVolume
) => {
  return new Promise((resolve, reject) => {
    const newPositionID = parseInt("" + newAisleID + newRow + newCol);
    const sql = `
      UPDATE Position SET id = ?, aisle = ?, row = ?, col = ?, maxWeight = ?, maxVolume = ?, occupiedWeight = ?, occupiedVolume = ? WHERE id = ?;
    `;
    db.run(
      sql,
      [
        newPositionID,
        newAisleID,
        newRow,
        newCol,
        newMaxWeight,
        newMaxVolume,
        newOccupiedWeight,
        newOccupiedVolume,
        positionID,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(newPositionID);
        }
      }
    );
  });
};

exports.updatePositionOccupation = (
  positionID,
  newOccupiedWeight,
  newOccupiedVolume
) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Position SET occupiedWeight = ?, occupiedVolume = ? WHERE id = ?;
    `;
    db.run(
      sql,
      [newOccupiedWeight, newOccupiedVolume, positionID],
      function (err) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(201);
        }
      }
    );
  });
};

exports.updatePositionID = (positionID, newPositionID) => {
  return new Promise((resolve, reject) => {
    const aisle = newPositionID.toString().substring(0, 4);
    const row = newPositionID.toString().substring(4, 8);
    const column = newPositionID.toString().substring(8, 12);

    const sql = `
      UPDATE Position SET id = ?, aisle = ?, row = ?, col = ? WHERE id = ?;
    `;
    db.run(
      sql,
      [newPositionID, aisle, row, column, positionID],
      function (err) {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(newPositionID);
        }
      }
    );
  });
};

exports.deletePosition = (positionID) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM Position WHERE id = ?;
    `;
    db.run(sql, [positionID], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(204);
      }
    });
  });
};

exports.deletePositionData = () => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM Position";
    db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};