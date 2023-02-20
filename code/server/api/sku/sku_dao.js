'use strict';
/* Data Access Object (DAO) module for accessing SKU data */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('database.sqlite', (err) => {
    if(err) throw err;
});

exports.getAllSku = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        SKU.id, 
        SKU.description, 
        SKU.weight, 
        SKU.volume, 
        SKU.price, 
        SKU.notes, 
        SKU.availableQuantity, 
        SKU.positionID
      FROM SKU;`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else {
        const skus = rows.map((row) => ({
          id: row.id,
          description: row.description,
          weight: row.weight,
          volume: row.volume,
          notes: row.notes,
          availableQuantity: row.availableQuantity,
          price: row.price,
          position: row.positionID,
        }));
        resolve(skus);
      }
    });
  })
}

exports.getSkuById = (skuID) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        *
      FROM SKU
      WHERE SKU.id = ?;`;
    db.get(sql, [skuID], (err, row) => {
      if (err) {
        reject(err);
        return;
      } else {
        if(row === undefined){
          resolve(undefined);
          return;
        }
        const sku = {
          id: row.id,
          description: row.description,
          weight: row.weight,
          volume: row.volume,
          notes: row.notes,
          availableQuantity: row.availableQuantity,
          price: row.price,
          position: row.positionID,
        };
        resolve(sku);
      }
    });
  })
}

exports.newSKU = function (
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO SKU(description, weight, volume, notes, price, availableQuantity, positionID)
      VALUES (?,?,?,?,?,?,NULL);
    `;
    db.run(
      sql,
      [description, weight, volume, notes, price, availableQuantity],
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

exports.updateSKU = (id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SKU SET description = ?, weight = ?, volume = ?, notes = ?, price = ?, availableQuantity = ? WHERE id = ?;
    `;
    db.run(sql, [newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, id], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(200);
      }
    });
  })
}

exports.updatePositionData = (positionId, newAvailableQuantity, newWeight, newVolume, oldAvailableQuantity, oldWeight, oldVolume, oldPositionValues) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Position SET occupiedWeight = ?, occupiedVolume = ?WHERE id = ?;
    `;
    const newOccupiedWeight = oldPositionValues.occupiedWeight - oldWeight * oldAvailableQuantity + newWeight * newAvailableQuantity;
    const newOccupiedVolume = oldPositionValues.occupiedVolume - oldVolume * oldAvailableQuantity + newVolume * newAvailableQuantity;
    if(newOccupiedWeight > oldPositionValues.maxWeight || newOccupiedVolume > oldPositionValues.maxVolume) {
      resolve(422);
      return;
    }
    db.run(sql, [newOccupiedWeight, newOccupiedVolume, positionId], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(200);
      }
    });
  })
}

exports.deleteSku = (skuID) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM SKU WHERE id = ?;
    `;
    db.run(sql, [skuID], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(204);
      }
    });
  });
};

exports.putPosition = (skuID, positionID) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SKU SET positionID = ? WHERE id = ?;
    `;
    db.run(sql, [positionID, skuID], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(200);
      }
    }); 
  })
}

exports.deleteSkuData = () => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM SKU";
    db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      sql = "UPDATE sqlite_sequence SET seq = 0 WHERE name = 'SKU';";
      db.run(sql, [], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  });
};
