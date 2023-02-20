'use strict';
const sqlite = require("sqlite3");

const db = new sqlite.Database('database.sqlite', (err) => {
    if (err) throw err;
});

exports.newReturnOrder = (return_order_id, restock_order_id) => {
    return new Promise((resolve, reject) => {
        const sql_query = "INSERT INTO ReturnOrderRestock(returnOrderID, restockOrderID) VALUES(?,?)";
        db.run(sql_query, [return_order_id, restock_order_id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    })
}

exports.getReturnOrders = () => {
    return new Promise((resolve, reject) => {
        const sql_query = "SELECT * FROM ReturnOrderRestock";
        db.all(sql_query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            if (rows !== undefined) {
                const return_orders = rows.map((row) => ({
                    id: row.returnOrderID,
                    restockOrderId: row.restockOrderID
                }));
                resolve(return_orders);
            }
            else reject(undefined);
        })
    })
}

exports.getReturnOrderById = (id) => {
    return new Promise((resolve, reject) => {
        const sql_query = "SELECT * FROM ReturnOrderRestock WHERE returnOrderID=?";
        db.get(sql_query, [id], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            if (result !== undefined) {
                resolve({
                    id: result.returnOrderID,
                    restockOrderId: result.restockOrderID
                });
            }
            else reject(undefined);
        });

    })

}

exports.deleteReturnOrder = (id) => {
    return new Promise((resolve, reject) => {
        const sql_query = "DELETE FROM 'ReturnOrderRestock' WHERE returnOrderID=?";
        db.run(sql_query, [id], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        })
    });
}

exports.deleteAll = () => {
    return new Promise((resolve, reject) => {
        const sql_query = "DELETE FROM 'ReturnOrderRestock'";
        db.run(sql_query, [], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        })
    });
}