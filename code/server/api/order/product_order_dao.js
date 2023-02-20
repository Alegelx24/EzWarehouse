sqlite = require("sqlite3");

// open the database
const db = new sqlite.Database("database.sqlite", (err) => {
  if (err) throw err;
});

exports.newProductInternalOrder = (products, internalOrderID) => {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < products.length; i++) {
      const sql =
        "INSERT INTO ProductOrder(description, quantity, skuID, price, rfid, orderID) VALUES( ?, ?, ?, ?, NULL, ?)";
      db.run(
        sql,
        [
          products[i].description,
          products[i].qty,
          products[i].SKUId,
          products[i].price,
          internalOrderID,
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    }
  });
};

exports.newProductRestockOrder = (products, orderId) => {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < products.length; i++) {
      const sql =
        "INSERT INTO ProductOrder(description, quantity, skuID, price, rfid, orderID, itemID) VALUES( ?, ?, ?, ?, NULL, ?, ?)";
      db.run(
        sql,
        [
          products[i].description,
          products[i].qty,
          products[i].SKUId,
          products[i].price,
          orderId,
          products[i].itemId,
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    }
  });
};

exports.getRFID = (id, product) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "SELECT rfid FROM ProductOrder WHERE orderID = ? AND skuID = ?";
    db.get(sqlQuery, [id, product.SkuID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else {
        if (rows) resolve(rows.rfid);
        else resolve(undefined);
      }
    });
  });
};

exports.updateListOrder = (id, product) => {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "UPDATE ProductOrder SET rfid = ? WHERE orderID = ? AND skuID = ?";
    db.run(sqlQuery, [product.RFID, id, product.SkuID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      } else resolve(rows);
    });
  });
};

exports.getProductOrderGivenOrderIdAndSkuId = (id, skuId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM ProductOrder WHERE orderID= ? AND skuId = ?";
    db.get(sql, [id, skuId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const ProductOrder = {
        SKUId: rows.skuID,
        description: rows.description,
        qty: rows.quantity,
        price: rows.price,
      };
      resolve(ProductOrder);
    });
  });
};

exports.getProductOrderGivenOrderId = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT PO.skuID, PO.description, PO.price, PO.quantity, PO.rfid, PO.itemID FROM ProductOrder AS PO WHERE orderID = ? ";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const ProductOrders = rows.map((r) => ({
        SKUId: r.skuID,
        itemId: r.itemID, // item id
        description: r.description,
        price: r.price,
        qty: r.quantity,
        rfid: r.rfid,
      }));
      for (var i = 0; i < ProductOrders.length; i++) {
        if (ProductOrders[i].rfid == null || ProductOrders[i].rfid == undefined)
          delete ProductOrders[i].rfid;
      }
      resolve(ProductOrders);
    });
  });
};

exports.getProductInternalOrderGivenOrderId = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT PO.skuID, PO.description, PO.price, PO.quantity, PO.rfid FROM ProductOrder AS PO WHERE orderID = ? ";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const ProductOrders = rows.map((r) => ({
        SKUId: r.skuID,
        description: r.description,
        price: r.price,
        qty: r.quantity,
        rfid: r.rfid,
      }));
      for (var i = 0; i < ProductOrders.length; i++) {
        if (ProductOrders[i].rfid == null || ProductOrders[i].rfid == undefined)
          delete ProductOrders[i].rfid;
      }
      resolve(ProductOrders);
    });
  });
};

exports.getSkuItems = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT skuID, rfid FROM ProductOrder WHERE orderID= ?";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const skuItems = rows.map((r) => ({
        if(rfid) {
          skuId: r.skuID;
        },
        if(rfid) {
          rfid: r.rfid;
        },
      }));
      resolve(skuItems);
    });
  });
};

exports.getProductReturnOrdersGivenOrderId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM ProductOrder WHERE orderID=?";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const product_orders = rows.map((row) => ({
        SKUId: row.skuID,
        itemId: row.itemID,
        description: row.description,
        price: row.price,
        RFID: row.rfid,
      }));
      resolve(product_orders);
    });
  });
};

exports.newProductOrder = (product, id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO ProductOrder( description, itemID, quantity, skuID, price, rfid, orderID) VALUES( ?, ?, ?, ?, ?, ?, ?)";
    db.run(
      sql,
      [
        product.description,
        product.itemId,
        product.qty,
        product.SKUId,
        product.price,
        product.RFID,
        id
      ],
      function (err) {
        if (err) {
          reject(err);
        }
        resolve(this.lastID);
      }
    );
  });
};

exports.deleteProductOrderByOrderId = (id) => {
  return new Promise((resolve, reject) => {
    const sql_query = "DELETE FROM 'ProductOrder' WHERE orderID=?";
    db.run(sql_query, [id], (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

exports.deleteProductOrderData = () => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM 'ProductOrder'";
    db.run(sql, [], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};
