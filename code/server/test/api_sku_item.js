const chai = require("chai");
const sku_item_dao = require("../api/sku_item/sku_item_dao");
const sku_dao = require("../api/sku/sku_dao");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("SKU Item - POST /api/skuitem", function () {
  this.beforeAll(async () => {
    await sku_item_dao.deleteSkuItemData();
  });

  this.afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });

  testPostSkuItem(
    "12345678901234567890123456789015",
    null,
    "2021/11/29 12:30",
    201
  );
  testPostSkuItem(
    "12345678901234567890123456789016",
    9999,
    "2021/11/29 12:30",
    404
  );
  testPostSkuItem("wrong", null, "2021/11/29 12:30", 422);
});

describe("SKU Item - GET /api/skuitems", function () {
  this.beforeAll(async () => {
    await sku_item_dao.deleteSkuItemData();
  });
  this.afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });
  testGetSkuItems(200);
});

describe("SKU Item - GET /api/skuitems/sku/:id", function () {
  this.beforeAll(async () => {
    await sku_item_dao.deleteSkuItemData();
  });
  this.afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });
  testGetSkuItemsBySkuId(null, 200);
  testGetSkuItemsBySkuId(9999, 404);
  testGetSkuItemsBySkuId("wrong", 422);
});

describe("SKU Item - GET /api/skuitems/:rfid", function () {
  this.beforeAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    const skuid = await sku_dao.newSKU("test", 100, 100, "note", 10.99, 1);
    await sku_item_dao.newSkuItem(
      "12345678901234567890123456789015",
      skuid,
      "2021/11/29 12:30"
    );
  });
  this.afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });

  testGetSkuItemByRFID("12345678901234567890123456789015", 200);
  testGetSkuItemByRFID("12345678901234567890123456789016", 404);
  testGetSkuItemByRFID("wrong", 422);
});

describe("SKU Item - PUT /api/skuitems/:rfid", function () {
  this.beforeAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    const skuid = await sku_dao.newSKU("test", 100, 100, "note", 10.99, 1);
    await sku_item_dao.newSkuItem(
      "12345678901234567890123456789015",
      skuid,
      "2021/11/29 12:30"
    );
  });
  this.afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });

  testUpdateSkuItem(
    "12345678901234567890123456789015",
    "12345678901234567890123456789222",
    1,
    "2022/05/20 12:30",
    200
  );
  testUpdateSkuItem(
    "12312312312312312312312312312312",
    "12345678901234567890123456789222",
    1,
    "2022/05/20 12:30",
    404
  );
  testUpdateSkuItem(
    "wrong",
    "12345678901234567890123456789222",
    1,
    "2022/05/20 12:30",
    422
  );
});

describe("SKU Item - DELETE /api/skuitems/:rfid", function () {
  this.beforeAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    const skuid = await sku_dao.newSKU("test", 100, 100, "note", 10.99, 1);
    await sku_item_dao.newSkuItem(
      "12345678901234567890123456789222",
      skuid,
      "2021/11/29 12:30"
    );
  });
  this.afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });
  testDeleteSkuItem("12345678901234567890123456789222", 204);
  testDeleteSkuItem("12345678901234567890123456789001", 422);
  testDeleteSkuItem("wrong", 422);
});

function testPostSkuItem(RFID, SKUId, DateOfStock, expectedHTTPStatus) {
  it("Insert an sku item", function (done) {
    if (SKUId === null) {
      sku_dao.newSKU("test", 100, 100, "note", 12.99, 10).then((res) => {
        const body = {
          RFID: RFID,
          SKUId: res,
          DateOfStock: DateOfStock,
        };
        agent
          .post("/api/skuitem")
          .send(body)
          .then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
      });
    } else {
      const body = {
        RFID: RFID,
        SKUId: SKUId,
        DateOfStock: DateOfStock,
      };
      agent
        .post("/api/skuitem")
        .send(body)
        .then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
    }
  });
}

function testGetSkuItems(expectedHTTPStatus) {
  it("Get all sku items", function (done) {
    agent.get("/api/skuitems").then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  });
}

function testGetSkuItemsBySkuId(skuid, expectedHTTPStatus) {
  it("Get sku items by sku id", function (done) {
    if (skuid === null) {
      sku_dao.newSKU("test", 100, 100, "note", 12.99, 10).then((res) => {
        agent.get("/api/skuitems/sku/" + res).then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
      });
    } else {
      agent.get("/api/skuitems/sku/" + skuid).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

function testGetSkuItemByRFID(rfid, expectedHTTPStatus) {
  it("Get sku item by rfid", function (done) {
    agent.get("/api/skuitems/" + rfid).then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  });
}

function testUpdateSkuItem(
  rfid,
  newRFID,
  newAvailable,
  newDateOfStock,
  expectedHTTPStatus
) {
  it("Update an sku item", function (done) {
    const body = {
      newRFID: newRFID,
      newAvailable: newAvailable,
      newDateOfStock: newDateOfStock,
    };
    agent
      .put("/api/skuitems/" + rfid)
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testDeleteSkuItem(rfid, expectedHTTPStatus) {
  it("Delete an sku item", function (done) {
    agent.delete("/api/skuitems/" + rfid).then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  });
}
