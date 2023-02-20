"use strict";
/* Data Access Object (DAO) module for accessing Sku Item data */

const sqlite = require("sqlite3");

// open the database
const db = new sqlite.Database("database.sqlite", (err) => {
  if (err) throw err;
});

//get User by Id
exports.getAllSkuItems = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        *
      FROM SkuItem;`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else {
        const sku_items = rows.map((row) => ({
          RFID: row.rfid,
          SKUId: row.skuID,
          available: row.available,
          DateOfStock: row.dateOfStock,
          orderId: row.orderId,
          itemId: row.itemId,
        }));
        resolve(sku_items);
      }
    });
  });
};

exports.getSkuItemsOfRestockOrder = (orderId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        *
      FROM SkuItem 
      WHERE orderId = ?;`;
    db.all(sql, [orderId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else {
        const sku_items = rows.map((row) => ({
          SKUId: row.skuID,
          itemId: row.itemId,
          rfid: row.rfid,
        }));
        resolve(sku_items);
      }
    });
  });
};

exports.getSkuItemsBySkuId = (skuID) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        *
      FROM SkuItem
      WHERE skuID = ? 
      AND available = 1;`;
    db.all(sql, [skuID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else {
        if (rows === undefined) {
          resolve(undefined);
          return;
        }
        const sku_items = rows.map((row) => ({
          RFID: row.rfid,
          SKUId: row.skuID,
          available: row.available,
          DateOfStock: row.dateOfStock,
          orderId: row.orderId,
          itemId: row.itemId,
        }));
        resolve(sku_items);
      }
    });
  });
};

exports.getSkuItemByRFID = (rfid) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        *
      FROM SkuItem
      WHERE rfid = ?;`;
    db.get(sql, [rfid], (err, row) => {
      if (err) {
        reject(err);
        return;
      } else {
        if (row === undefined) {
          reject(404);
          return;
        }
        const sku_item = {
          RFID: row.rfid,
          SKUId: row.skuID,
          available: row.available,
          DateOfStock: row.dateOfStock,
          orderId: row.orderId,
          itemId: row.itemId,
        };
        resolve(sku_item);
      }
    });
  });
};

exports.newSkuItem = function (RFID, SKUId, DateOfStock = null) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO SkuItem(rfid, available, dateOfStock, orderId, skuID)
      VALUES (?,0,?,NULL,?);
    `;
    db.run(sql, [RFID, DateOfStock, SKUId], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(this.lastID);
      }
    });
  });
};

exports.updateSkuItem = (rfid, newRFID, newAvailable, newDateOfStock) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SkuItem SET rfid = ?, available = ?, dateOfStock = ? WHERE rfid = ?;
    `;
    db.run(sql, [newRFID, newAvailable, newDateOfStock, rfid], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(200);
      }
    });
  });
};

exports.updateOrderIdSkuItem = (orderId, itemId, rfid) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE SkuItem SET orderId = ?, itemID = ? WHERE rfid = ?;
    `;
    db.run(sql, [orderId, itemId, rfid], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(200);
      }
    });
  });
};

exports.deleteSkuItem = (rfid) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM SkuItem WHERE rfid = ?;
    `;
    db.run(sql, [rfid], function (err) {
      if (err) {
        reject(err);
        return;
      } else {
        resolve(204);
      }
    });
  });
};

exports.deleteSkuItemData = () => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM SkuItem";
    db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};
