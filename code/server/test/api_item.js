const chai = require("chai");
const item_dao = require("../api/item/item_dao");
const sku_dao = require("../api/sku/sku_dao")
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("Item - POST /api/item", function () {
  this.beforeEach(async () => {
    await item_dao.deleteItemData();
    await sku_dao.deleteSkuData();
  });

  testPostItem(1, "this is a test", 10, null, 1, 201);
  testPostItem(2, "this is a test", -10, null, 2, 422);
  testPostItem(3, "this is a test", 10, 1, 3, 404);
});

describe("Item - GET /api/items",  function () {
  this.beforeEach(async () => {
    await item_dao.deleteItemData();
    await sku_dao.deleteSkuData();
  });
  testGetAllItem();
});

describe("Item - GET /api/items/:id/:supplierId",  function () {
  this.beforeEach(async () => {
    await item_dao.deleteItemData();
    await sku_dao.deleteSkuData();
  });

  testGetItemById(null,1 , 200);
  testGetItemById(1,1 , 404);
  testGetItemById("test",1 , 422);
});

describe("Item - PUT /api/item/:id/:supplierId", function () {
  this.beforeEach(async () => {
    await item_dao.deleteItemData();
    await sku_dao.deleteSkuData();
  });
//  await item_dao.newItem(10,"this is a test", 10, 1, 1);

  testUpdateItem(null,1,"new description", 10.99, 200);
  testUpdateItem(null,1,"new description", -10, 422);
});

describe("Item - DELETE /api/items/:id/:supplierId", function () {
  this.beforeEach(async () => {
    await item_dao.deleteItemData();
  });

  testDeleteItem(null,1, 204);
  testDeleteItem("id",1, 422);
});


function testPostItem(id, description, price, SKUId, supplierId, expectedHTTPStatus) {
  it("Insert a item", function (done) {
      if(SKUId === null){
        sku_dao.newSKU("First SKU", 100, 50, "First SKU Note", 10.99, 50)
        .then((res) => {
            agent
            .post("/api/item")
            .send({
                id: id,
                description: description,
                price: price,
                SKUId: res,
                supplierId: supplierId
            })
            .then(function (res) {
              res.should.have.status(expectedHTTPStatus);
              done();
            });  
        })
      }else{
        const body = {
            id: id,
            description: description,
            price: price,
            SKUId: SKUId,
            supplierId: supplierId
        };
        agent
          .post("/api/item")
          .send(body)
          .then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
      }
  });
}

function testGetAllItem() {
  it("Get all item", function (done) {
    agent.get("/api/items").then(function (res) {
      res.should.have.status(200);
      done();
    });
  });
}

function testGetItemById(id,supplierId , expectedHTTPStatus) {
  it("Get item by id", function (done) {
    if(id === null){
        item_dao.newItem(10,"this is a test", 10, supplierId, 1)
        .then((res) => {
            agent.get("/api/items/" + res + "/" + supplierId).then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
              });
        })
    }else{
        agent.get("/api/items/" + id + "/" + supplierId).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
        });
    }
  });
}

function testUpdateItem(
    id,
    supplierId,
    newDescription,
    newPrice,
    expectedHTTPStatus
) {
  it("Update a item", async function () {
    if(id === null){
        item_dao.newItem(10,"this is a test", 10, supplierId, 1)
        .then((res) => {
            agent
            .put("/api/item/" + res + "/" + supplierId)
            .send({
                newDescription: newDescription,
                newPrice: newPrice
            })
            .then(function (res) {
              res.should.have.status(expectedHTTPStatus);
              done();
            });
        })
    }else{
        const body = {
            newDescription: newDescription,
            newPrice: newPrice
        };
        agent
          .put("/api/item/" + id + "/" + supplierId)
          .send(body)
          .then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
    }
  });
}

function testDeleteItem(id, supplierId, expectedHTTPStatus) {
  it("Delete an item", function (done) {
    if (id === null) {
        item_dao.newItem(10,"this is a test", 10, supplierId, 1)
        .then((res) =>{
          agent.delete("/api/items/" + res + "/" + supplierId).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        })
    } else {
      agent.delete("/api/items/" + id + "/" + supplierId).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

