
const UsersService = require ("../api/user/users_service");
const user_dao = require("../api/user/user_dao");
const users_service = new UsersService (user_dao);

sqlite = require("sqlite3");

class DatabaseHelper {
  constructor() {
    this.db = new sqlite.Database("database.sqlite", (err) => {
      if (err) throw err;
    });
    this.tableHelper();
    this.db.get("PRAGMA foreign_keys = ON");
  }

  async tableHelper() {
    await this.createPosition();
    await this.createSku();
    await this.createSupplier();
    await this.createCustomer();
    await this.createUser();
    await this.createOrder();
    await this.createReturnOrderRestock();
    await this.createItem();
    await this.createProductOrder();
    await this.createSkuItem();
    await this.createTestDescriptor();
    await this.createTestResult();

    let res = await users_service.newUser("Customer", "Customer", "user1@ezwh.com", "customer", "testpassword");
    res = await users_service.newUser("QualityEmployee", "QalityEmployee", "qualityEmployee1@ezwh.com", "qualityEmployee", "testpassword");
    res = await users_service.newUser("Clerk", "Clerk", "clerk1@ezwh.com", "clerk", "testpassword");
    res = await users_service.newUser("DeliveryEmployee", "DeliveryEmployee", "deliveryEmployee1@ezwh.com", "deliveryEmployee", "testpassword");
    res = await users_service.newUser("Supplier", "Supplier", "supplier1@ezwh.com", "supplier", "testpassword");
    res = await users_service.newAdmin("Manager", "Manager", "manager1@ezwh.com", "testpassword");
  }

  async createSku() {
    //TABLE SKU
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "SKU" (
          "id"	INTEGER,
          "description"	TEXT,
          "weight"	INTEGER,
          "volume"	INTEGER,
          "price"	INTEGER,
          "notes"	TEXT,
          "availableQuantity"	INTEGER,
          "positionID" INTEGER,
          PRIMARY KEY("id" AUTOINCREMENT)
          FOREIGN KEY("positionID") REFERENCES "Position"("id") ON UPDATE CASCADE ON DELETE SET NULL
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table SKU not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createSupplier() {
    //TABLE Supplier
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "Supplier" (
          "id"	INTEGER,
          "name"	TEXT,
          "surname"	TEXT,
          "email"	TEXT,
          PRIMARY KEY("id" AUTOINCREMENT)
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table Supplier not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createPosition() {
    //TABLE Position
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "Position" (
          "id"	NUMBER,
          "aisle"	INTEGER,
          "row"	INTEGER,
          "col"	INTEGER,
          "maxWeight"	INTEGER,
          "maxVolume"	INTEGER,
          "occupiedWeight" FLOAT,
          "occupiedVolume" FLOAT,
          PRIMARY KEY("id")
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table Position not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createCustomer() {
    //TABLE Customer
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "Customer" (
          "id"	INTEGER,
          "name"	TEXT,
          "surname"	TEXT,
          PRIMARY KEY("id" AUTOINCREMENT)
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table Customer not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createUser() {
    //TABLE User
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "User" (
          "id"	INTEGER,
          "name"	TEXT,
          "surname"	TEXT,
          "email"	TEXT,
          "password"	TEXT,
          "type"	TEXT,
          PRIMARY KEY("id" AUTOINCREMENT)
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table User not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createOrder() {
    //TABLE Order
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "Order" (
          "id"	INTEGER,
          "orderType"	TEXT,
          "issueDate"	TEXT,
          "returnDate"	TEXT,
          "state"	TEXT,
          "customerID"	INTEGER,
          "supplierID"	INTEGER,
          "transportNote"	TEXT,
          PRIMARY KEY("id" AUTOINCREMENT),
          FOREIGN KEY("customerID") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
          FOREIGN KEY("supplierID") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE RESTRICT
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table Order not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createReturnOrderRestock() {
    //TABLE ReturnOrderRestock
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "ReturnOrderRestock" (
          "returnOrderID"	INTEGER,
          "restockOrderID"	INTEGER,
          PRIMARY KEY("returnOrderID","restockOrderID"),
          FOREIGN KEY("returnOrderID") REFERENCES "Order"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
          FOREIGN KEY("restockOrderID") REFERENCES "Order"("id") ON UPDATE CASCADE ON DELETE RESTRICT
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table ReturnOrderRestock not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createItem() {
    //TABLE Item
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "Item" (
          "id"	INTEGER,
          "description"	TEXT,
          "price"	INTEGER,
          "SKUId"	INTEGER,
          "supplierId"	INTEGER,
          PRIMARY KEY("id"),
          FOREIGN KEY("supplierId") REFERENCES "User"("id") ON UPDATE CASCADE,
          FOREIGN KEY("SKUId") REFERENCES "SKU"("id") ON UPDATE CASCADE ON DELETE RESTRICT
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table Item not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createProductOrder() {
    //TABLE ProductOrder
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "ProductOrder" (
          "id"	INTEGER,
          "description"	TEXT,
          "quantity" INTEGER,
          "skuID"	INTEGER,
          "price"	NUMERIC,
          "rfid"	TEXT,
          "orderID"	INTEGER,
          "itemID" INTEGER,
          PRIMARY KEY("id" AUTOINCREMENT),
          FOREIGN KEY("skuID") REFERENCES "SKU"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
          FOREIGN KEY("orderID") REFERENCES "Order"("id") ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY("rfid") REFERENCES "SkuItem"("rfid") ON UPDATE CASCADE ON DELETE RESTRICT,
          FOREIGN KEY("itemID") REFERENCES "Item"("id") ON UPDATE CASCADE ON DELETE RESTRICT
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table ProductOrder not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createSkuItem() {
    //TABLE SkuItem
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "SkuItem" (
          "rfid"	TEXT,
          "skuID"	INTEGER,
          "available"	INTEGER,
          "dateOfStock"	DATE,
          "orderId" INTEGER,
          "itemId" INTEGER,
          PRIMARY KEY("rfid"),
          FOREIGN KEY("skuID") REFERENCES "SKU"("id") ON UPDATE CASCADE ON DELETE SET NULL,
          FOREIGN KEY("orderId") REFERENCES "Order"("id") ON UPDATE CASCADE ON DELETE SET NULL,
          FOREIGN KEY("itemId") REFERENCES "Item"("id") ON UPDATE CASCADE ON DELETE SET NULL
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table SkuItem not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createTestDescriptor() {
    //TABLE TestDescriptor
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "TestDescriptor" (
          "id"	INTEGER,
          "name"	TEXT,
          "procedureDescription"	TEXT,
          "idSKU"	INTEGER,
          PRIMARY KEY("id"),
          FOREIGN KEY("idSKU") REFERENCES "SKU"("id") ON UPDATE CASCADE ON DELETE SET NULL
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table TestDescriptor not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  async createTestResult() {
    //TABLE TestResult
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS "TestResult" (
          "id"	INTEGER,
          "idTestDescriptor"	INTEGER,
          "rfid"	TEXT,
          "Date"	TEXT,
          "Result"	BOOLEAN,
          PRIMARY KEY("id"),
          FOREIGN KEY("rfid") REFERENCES "SkuItem"("rfid") ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY("idTestDescriptor") REFERENCES "TestDescriptor"("id") ON UPDATE CASCADE ON DELETE SET NULL
        );
      `;

      this.db.run(sql, (err) => {
        if (err) {
          console.error("Table TestResult not created.");
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  getDb() {
    return this.db;
  }
}

module.exports = DatabaseHelper;
