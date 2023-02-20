const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

const restock_order_dao = require("../api/order/order_dao");
const item_dao = require("../api/item/item_dao");

const issueDate1 = "2021/11/29 09:32";
const supplierId1 = 1;
const item1 = [
  {
    id: 10,
    description: "a item",
    price: 10.99,
    skuID: 12,
    supplierId: supplierId1,
  },
  {
    id: 18,
    description: "a item",
    price: 11.99,
    skuID: 180,
    supplierId: supplierId1,
  },
];
const newState1 = "ISSUED";
const products1 = [
  { SKUId: 12, itemId: 10, description: "a product", price: 10.99, qty: 30 },
  {
    SKUId: 180,
    itemId: 18,
    description: "another product",
    price: 11.99,
    qty: 20,
  },
];

const issueDate2 = "2021/11/29 09:32";
const supplierId2 = 2;
const item2 = [
  {
    id: 10,
    description: "a item",
    price: 10.99,
    skuID: 12,
    supplierId: supplierId2,
  },
  {
    id: 18,
    description: "a item",
    price: 11.99,
    skuID: 180,
    supplierId: supplierId2,
  },
];
const products2 = [
  { SKUId: 12, itemId: 10, description: "a product", price: 10.99, qty: 30 },
  {
    SKUId: 180,
    itemId: 18,
    description: "another product",
    price: 11.99,
    qty: 20,
  },
];

const issueDateErr = 123;
const supplierIdErr = "ciao";
const itemErr = [
  {
    id: 10,
    description: "a item",
    price: 10.99,
    skuID: 12,
    supplierId: supplierId1,
  },
  {
    id: 18,
    description: "a item",
    price: 11.99,
    skuID: 180,
    supplierId: supplierId1,
  },
];
const productsErr = [
  { SKUId: 12, itemId: 10, description: "a product", price: 10.99, qty: 3 },
  {
    SKUId: 180,
    itemId: 10,
    description: "another product",
    price: 11.99,
    qty: 3,
  },
];
const newStateErr = 12;
const transportNote = { transportNote: { deliveryDate: "2022/12/25" } };
const skuItems = [
  { SKUId: 12, rfid: "12345678901234567890123456789016" },
  { SKUId: 12, rfid: "12345678901234567890123456789017" },
];

describe("RestockOrder -/api/restockOrder/...", function () {
  this.beforeEach(async () => {
    item1.forEach(async (item) => {
      await item_dao.newItem(
        item.id,
        item.description,
        item.price,
        item.skuID,
        item.supplierId
      );
    });
    item2.forEach(async (item) => {
      await item_dao.newItem(
        item.id,
        item.description,
        item.price,
        item.skuID,
        item.supplierId
      );
    });
    itemErr.forEach(async (item) => {
      await item_dao.newItem(
        item.id,
        item.description,
        item.price,
        item.skuID,
        item.supplierId
      );
    });
  });
  testPostRestockOrder(issueDate1, products1, supplierId1, 201);
  testPostRestockOrder(issueDateErr, productsErr, supplierIdErr, 422);

  testGetAllRestockOrders(
    issueDate1,
    products1,
    supplierId1,
    issueDate2,
    products2,
    supplierId2,
    200
  );
  testGetAllRestockIssuedOrders(
    issueDate1,
    products1,
    supplierId1,
    issueDate2,
    products2,
    supplierId2,
    200
  );

  testGetRestockOrderById(null, 200);
  testGetRestockOrderById(122, 404);
  testGetRestockOrderById("pippo", 422);

  testUpdateStateOrder("DELIVERY", 200);
  testUpdateStateOrder("PROVA", 422);
  testUpdateStateOrder(12, 422);

  testAddSkuItemToRestockOrder(null, skuItems, 200);
  testAddSkuItemToRestockOrder(1232, skuItems, 404);
  testAddSkuItemToRestockOrderInvalidState(null, skuItems, 422);

  testAddTransportNote(null, transportNote, 200);
  testAddTransportNote(1234, transportNote, 404);
  testAddTransportNoteInvalidState(transportNote, 422);

  testDeleteOrder(null, 204);
  testDeleteOrder("pippo", 422);
});

function testPostRestockOrder(
  issueDate,
  products,
  supplierId,
  expectedHTTPStatus
) {
  it("Insert a new restock order ", function (done) {
    const body = {
      issueDate: issueDate,
      products: products,
      supplierId: supplierId,
    };
    agent
      .post("/api/restockOrder")
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

async function testGetAllRestockOrders(
  issueDate1,
  products1,
  supplierId1,
  issueDate2,
  products2,
  supplierId2,
  expectedHTTPStatus
) {
    await item_dao.newItem(item1[0].id, item1[0].description, item1[0].price, item1[0].skuID, item1[0].supplierId);
  it("getting all restock orders from the system", function (done) {
    let order1 = {
      issueDate: issueDate1,
      products: products1,
      supplierId: supplierId1,
    };
    let order2 = {
      issueDate: issueDate2,
      products: products2,
      supplierId: supplierId2,
    };
    agent
      .post("/api/item")
      .send(item1[0])
      .send(item1[1]).then(function (res) {
        agent.post("/api/restockOrder").send(order1).send(order2)
        .then(function (res) {
            res.should.have.status(201);
            agent.get("/api/restockOrders").then(function (r) {
              r.should.have.status(expectedHTTPStatus);
              done();
            });
          })
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

async function testGetAllRestockIssuedOrders(
  issueDate1,
  products1,
  supplierId1,
  issueDate2,
  products2,
  supplierId2,
  expectedHTTPStatus
) {
 await item_dao.newItem(item1[0].id, item1[0].description, item1[0].price, item1[0].skuID, item1[0].supplierId);
  it("getting all restock orders in state issued from the system", function (done) {
    let order1 = {
      issueDate: issueDate1,
      products: products1,
      supplierId: supplierId1,
    };
    let order2 = {
      issueDate: issueDate2,
      products: products2,
      supplierId: supplierId2,
    };
    agent
      .post("/api/restockOrder")
      .send(order1)
      .send(order2)
      .then(function (res) {
        res.should.have.status(201);
        agent.get("/api/restockOrdersIssued").then(function (r) {
          r.should.have.status(expectedHTTPStatus);
          r.body[0].state.should.equal("ISSUED");
          r.body[0].supplierId.should.equal(supplierId1);
          r.body[1].state.should.equal("ISSUED");
          done();
        });
      });
  });
}

function testGetRestockOrderById(id, expectedHTTPStatus) {
  it("Get order by id", function (done) {
    if (id === null) {
      restock_order_dao
        .newRestockOrder(issueDate1, products1, supplierId1)
        .then((res) => {
          agent.get("/api/restockOrders/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        });
    } else {
      agent.get("/api/restockOrders/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

function testUpdateStateOrder(newState, expectedHTTPStatus) {
  it("Update the state of an order", function (done) {
    restock_order_dao
      .newRestockOrder(issueDate1, products1, supplierId1)
      .then((res) => {
        const body = {
          newState: newState,
        };
        agent
          .put("/api/restockOrder/" + res)
          .send(body)
          .then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
      });
  });
}

function testAddTransportNote(id, transportNote, expectedHTTPStatus) {
  if (id == null) {
    it("add transport note to a restock order", function (done) {
      restock_order_dao
        .newRestockOrder(issueDate1, products1, supplierId1)
        .then((res) => restock_order_dao.updateStateOrder(res, "DELIVERY"))
        .then((res) => {
          const body = {
            transportNote: transportNote,
          };
          agent
            .put("/api/restockOrder/" + res + "/transportNote")
            .send(body)
            .then(function (res) {
              res.should.have.status(expectedHTTPStatus);
              done();
            });
        });
    });
  } else {
    agent.get("/api/restockOrders/" + id).then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  }
}

function testAddTransportNoteInvalidState(transportNote, expectedHTTPStatus) {
  it("add transport note to a restock order with invalid order state", function (done) {
    restock_order_dao
      .newRestockOrder(issueDate1, products1, supplierId1)
      .then((res) => {
        const body = {
          transportNote: transportNote,
        };
        agent
          .put("/api/restockOrder/" + res + "/transportNote")
          .send(body)
          .then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
      });
  });
}

function testAddSkuItemToRestockOrder(id, skuItems, expectedHTTPStatus) {
  it("add list of sku items to a restock order", function (done) {
    if (id == null) {
      restock_order_dao
        .newRestockOrder(issueDate1, products1, supplierId1)
        .then((res) => restock_order_dao.updateStateOrder(res, "DELIVERED"))
        .then((res) => {
          const body = {
            skuItems: skuItems,
          };
          agent
            .put("/api/restockOrder/" + res + "/skuItems")
            .send(body)
            .then(function (res) {
              res.should.have.status(expectedHTTPStatus);
              done();
            });
        });
    } else {
      agent.get("/api/restockOrders/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

function testAddSkuItemToRestockOrderInvalidState(
  id,
  skuItems,
  expectedHTTPStatus
) {
  it("add list of sku items to a restock order", function (done) {
    if (id == null) {
      restock_order_dao
        .newRestockOrder(issueDate1, products1, supplierId1)
        .then((res) => {
          const body = {
            skuItems: skuItems,
          };
          agent
            .put("/api/restockOrder/" + res + "/skuItems")
            .send(body)
            .then(function (res) {
              res.should.have.status(expectedHTTPStatus);
              done();
            });
        });
    } else {
      agent.get("/api/restockOrders/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

function testDeleteOrder(orderId, expectedHTTPStatus) {
  it("Delete a restock order", function (done) {
    if (orderId === null) {
      restock_order_dao
        .newRestockOrder(issueDate1, products1, supplierId1)
        .then((res) => {
          agent.delete("/api/restockOrder/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        });
    } else {
      agent.delete("/api/restockOrder/" + orderId).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}
