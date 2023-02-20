'use strict';
const sqlite = require('sqlite3');
const product_order_dao = require('./product_order_dao');

// open the database
const db = new sqlite.Database('database.sqlite', (err) => {
    if (err) throw err;
});

exports.newInternalOrder = (issueDate, customerId) => {
    return new Promise((resolve, reject) => {
        const sql = ` INSERT INTO 'ORDER'(ORDERTYPE, ISSUEDATE, RETURNDATE, STATE, CUSTOMERID, SUPPLIERID, TRANSPORTNOTE)
            VALUES ("INTERNAL",?,NULL,"ISSUED",?,NULL,NULL) `;
        db.run(sql, [issueDate, customerId], function (err) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.getAllInternalOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM 'Order' WHERE orderType = ?`
        db.all(sql, ["INTERNAL"], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const internalOrders = rows.map((r) => ({
                id: r.id,
                issueDate: r.issueDate,
                customerId: r.customerID,
                state: r.state,
            }));
            resolve(internalOrders);
        });
    });
}

exports.getIssuedInternalOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM 'Order' WHERE orderType = ? AND state = ?`;
        const params = ["INTERNAL", "ISSUED"];
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const internalOrders = rows.map((r) => ({
                id: r.id,
                issueDate: r.issueDate,
                customerId: r.customerID,
                state: r.state,
            }));
            resolve(internalOrders);
        });
    });
}

exports.getAcceptedInternalOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM  'Order' WHERE orderType = ? AND state = ? ";
        const params = ["INTERNAL", "ACCEPTED"];
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const internalOrders = rows.map((r) => ({
                id: r.id,
                issueDate: r.issueDate,
                state: r.state,
                customerId: r.customerID,
            }));
            resolve(internalOrders);
        });
    });
}

exports.getInternalOrder = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM 'Order' WHERE id=? AND orderType = ?";
        db.get(sql, [id, "INTERNAL"], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            if (rows == undefined) {
                resolve(undefined);
            } else {
                const internalOrder = {
                    id: rows.id,
                    issueDate: rows.issueDate,
                    state: rows.state,
                    customerId: rows.customerID,
                };
                resolve(internalOrder);
            }
        });
    });
};

exports.updateStateOrder = (id, state) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE 'Order' SET state=? WHERE id = ?";
        db.run(sql, [state, id], function (err) {
            if (err) {
                reject(err);
                resolve(undefined);
            }
            resolve(id);
        });
    });
};

exports.deleteOrder = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM 'Order' WHERE id = ?";
        db.run(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}


//---------------------    RESTOCK ORDER DB ACCESS FUNCTION ---------------------------//

exports.newRestockOrder = (issueDate, supplierId) => {
    return new Promise((resolve, reject) => {
        const sql = ` INSERT INTO 'ORDER'(ORDERTYPE, ISSUEDATE, RETURNDATE, STATE, CUSTOMERID, SUPPLIERID, TRANSPORTNOTE)
            VALUES ("RESTOCK",?,NULL,"ISSUED",NULL,?,NULL) `;
        db.run(sql, [issueDate, supplierId], function (err) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.getAllRestockOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM 'Order' WHERE orderType = ?`
        db.all(sql, ["RESTOCK"], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const restockOrders = rows.map((r) => ({
                id: r.id,
                issueDate: r.issueDate,
                supplierId: r.supplierID,
                state: r.state,
                transportNote: r.transportNote,
            }));
            resolve(restockOrders);
        });
    });
}

exports.getIssuedRestockOrders = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM 'Order' WHERE orderType = ? AND state = ?`;
        const params = ["RESTOCK", "ISSUED"];
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const restockOrders = rows.map((r) => ({
                id: r.id,
                issueDate: r.issueDate,
                supplierId: r.supplierID,
                state: r.state,
            }));
            resolve(restockOrders);
        });
    });
}

exports.getRestockOrderById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM 'Order' WHERE id=? AND orderType = ?";
        db.get(sql, [id, "RESTOCK"], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            if (rows == undefined) {
                resolve(undefined);
            } else {
                const restockOrder = {
                    id: rows.id,
                    issueDate: rows.issueDate,
                    state: rows.state,
                    supplierId: rows.supplierID,
                    transportNote: JSON.parse(rows.transportNote),
                };
                resolve(restockOrder);
            }
        });
    });
};

exports.addTransportNoteToOrder = (id, transportNote) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE 'Order' SET transportNote=? WHERE id = ?";
        db.run(sql, [transportNote, id], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

exports.deleteOrderData = () => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM 'Order'";
        db.run(sql, [], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(true);
        })
    })
};

exports.getOrderById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM 'Order' WHERE id=?";
        db.get(sql, [id], (err, rows) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            if (rows == undefined) {
                resolve(undefined);
            } else {
                const restockOrder = {
                    id: rows.id,
                    issueDate: rows.issueDate,
                    returnDate: rows.returnDate,
                    state: rows.state,
                    supplierId: rows.supplierID,
                    transportNote: JSON.parse(rows.transportNote),
                };
                resolve(restockOrder);
            }
        });
    });
};

exports.newReturnOrder = (return_date) => {
    return new Promise((resolve, reject) => {
        const sql = ` INSERT INTO 'ORDER'(orderType, issueDate, returnDate, state, customerID, supplierID, transportNote)
            VALUES ("RETURN", NULL, ?, NULL, NULL, NULL, NULL) `;
        db.run(sql, [return_date], function (err) {
            if (err) {
                reject(err);
                return;
            } else {
                resolve(this.lastID);
            }
        });
    });
}



