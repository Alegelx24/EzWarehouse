const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const internal_order_dao = require("../api/order/order_dao");

const app = require("../server");
var agent = chai.request.agent(app);

const issueDate1 = "2021/11/29 09:32";
const products1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }];
const customerId1 = 1;
const issueDate2 = "2021/11/29 09:32";
const products2 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }];
const customerId2 = 2;
const issueDateErr = 123;
const productsErr = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }];
const customerIdErr = "ciao";
const newStateErr = 12;


describe("InternalOrder - /api/internalOrders/...", function () {

  testPostInternalOrder(issueDate1, products1, customerId1, 201);
  testPostInternalOrder(issueDateErr, productsErr, customerIdErr, 422);

  testGetAllInternalOrders(issueDate1, products1, customerId1, issueDate2, products2, customerId2, 200);
  testGetAllInternalIssuedOrders(issueDate1, products1, customerId1, issueDate2, products2, customerId2, 200);
  testGetAllInternalAcceptedOrders(issueDate1, products1, customerId1, issueDate2, products2, customerId2, 200);

  testGetInternalOrder(null, 200);
  testGetInternalOrder(120, 404);
  testGetInternalOrder("ciao", 422);

  testUpdateStateOrder("ACCEPTED", 200);
  testUpdateStateOrder("PROVA", 422);
  testUpdateStateOrder(12, 422);

  testDeleteOrder(null, 204);
  testDeleteOrder("pippo", 422);

});

function testPostInternalOrder(issueDate, products, customerId, expectedHTTPStatus) {
  it("Insert a new internal order ", function (done) {
    const body = {
      issueDate: issueDate,
      products: products,
      customerId: customerId
    };
    agent
      .post("/api/internalOrders")
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testGetAllInternalOrders(issueDate1, products1, customerId1, issueDate2, products2, customerId2, expectedHTTPStatus) {
  it('getting all internal orders from the system', function (done) {
    let order1 = { issueDate: issueDate1, products: products1, customerId: customerId1 };
    let order2 = { issueDate: issueDate2, products: products2, customerId: customerId2 };
    agent.post('/api/internalOrders')
      .send(order1).send(order2)
      .then(function (res) {
        res.should.have.status(201);
        agent.get('/api/internalOrders')
          .then(function (r) {
            r.should.have.status(expectedHTTPStatus);
            r.body[0].state.should.equal("ISSUED");
            r.body[0].customerId.should.equal(customerId1);
            r.body[0].issueDate.should.equal(issueDate1);
            r.body[1].state.should.equal("ISSUED");
            r.body[1].issueDate.should.equal(issueDate2);
            done();
          });
      });
  });
}

function testGetAllInternalIssuedOrders(issueDate1, products1, customerId1, issueDate2, products2, customerId2, expectedHTTPStatus) {
  it('getting all internal orders in issued state from the system', function (done) {
    let order1 = { issueDate: issueDate1, products: products1, customerId: customerId1 };
    let order2 = { issueDate: issueDate2, products: products2, customerId: customerId2 };
    agent.post('/api/internalOrders')
      .send(order1).send(order2)
      .then(function (res) {
        res.should.have.status(201);
        agent.get('/api/internalOrdersIssued')
          .then(function (r) {
            r.should.have.status(expectedHTTPStatus);
            r.body[0].state.should.equal("ISSUED");
            r.body[0].customerId.should.equal(customerId1);
            r.body[0].issueDate.should.equal(issueDate1);
            r.body[1].state.should.equal("ISSUED");
            r.body[1].issueDate.should.equal(issueDate2);
            done();
          });
      });
  });
}

function testGetAllInternalAcceptedOrders(issueDate1, products1, customerId1, issueDate2, products2, customerId2, expectedHTTPStatus) {
  it('getting all internal orders in accepted state from the system', function (done) {
    let order1 = { issueDate: issueDate1, products: products1, customerId: customerId1 };
    let order2 = { issueDate: issueDate2, products: products2, customerId: customerId2 };
    agent.post('/api/internalOrders')
      .send(order1).send(order2)
      .then(function (res) {
        res.should.have.status(201);
        agent.get('/api/internalOrdersAccepted')
          .then(function (r) {
            r.should.have.status(expectedHTTPStatus);
            done();
          });
      });
  });
}

function testGetInternalOrder(id, expectedHTTPStatus) {
  it("Get order by id", function (done) {
    if (id === null) {
      internal_order_dao
        .newInternalOrder(issueDate1, products1, customerId1)
        .then((res) => {
          agent.get("/api/internalOrders/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        });
    } else {
      agent.get("/api/internalOrders/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

function testUpdateStateOrder(newState, expectedHTTPStatus) {
  it("Update the state of an order", function (done) {
    internal_order_dao.newInternalOrder(issueDate1, products1, customerId1).then((res) => {
      const body = {
        newState: newState,
      };
      agent
        .put("/api/internalOrders/" + res)
        .send(body)
        .then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
    });
  });
}


function testDeleteOrder(orderId, expectedHTTPStatus) {
  it("Delete an internal order", function (done) {
    if (orderId === null) {
      internal_order_dao
        .newInternalOrder(issueDate1, products1, customerId1)
        .then((res) => {
          agent.delete("/api/internalOrders/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        });
    } else {
      agent.delete("/api/internalOrders/" + orderId).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}


