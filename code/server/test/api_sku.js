const chai = require("chai");
const sku_dao = require("../api/sku/sku_dao");
const chaiHttp = require("chai-http");

const PositionService = require("../api/position/position_service");
const position_dao = require("../api/position/position_dao");
const position_service = new PositionService(position_dao);

chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("SKU - POST /api/sku", function () {
  this.beforeAll(async () => {
    await sku_dao.deleteSkuData();
  });

  this.afterAll(async () => {
    await sku_dao.deleteSkuData();
  });

  testPostSku("a new sku", 100, 50, "first SKU", 10.99, 50, 201);
  testPostSku("a new sku", "test422", 50, "first SKU", 10.99, 50.5, 422);
});

describe("SKU - GET /api/skus", function () {
  testGetAllSku();
});

describe("SKU - GET /api/skus/:id", function () {
  this.beforeAll(async () => {
    await sku_dao.deleteSkuData();
  });

  this.afterAll(async () => {
    await sku_dao.deleteSkuData();
  });

  testGetSkuById(null, 200);
  testGetSkuById(123, 404);
  testGetSkuById("hi", 422);
});

describe("SKU - PUT /api/sku/:id", function () {
  this.beforeAll(async () => {
    await sku_dao.deleteSkuData();
  });

  this.afterAll(async () => {
    await sku_dao.deleteSkuData();
  });

  testUpdateSku("new description", 120, 30, "new notes", 12.99, 1, 200);
  testUpdateSku("new description", "120", 30, "new notes", 12.99, 10.1, 422);
  testUpdateSku("new description", 120, 30, "new notes", 12.99, 10, 404);
});

describe("SKU - PUT /api/sku/:id/position", function () {
  this.beforeAll(async () => {
    await sku_dao.deleteSkuData();
    await position_dao.deletePositionData();
    await position_service.newPosition(
      200020003000,
      2000,
      2000,
      3000,
      1000,
      1000
    );
    await position_service.newPosition(100022223000, 1000, 2222, 3000, 10, 10);
  });

  this.afterAll(async () => {
    await sku_dao.deleteSkuData();
    await position_dao.deletePositionData();
  });

  testUpdateSkuPosition(200020003000, 200);
  testUpdateSkuPosition(100022223000, 422);
});

describe("SKU - DELETE /api/sku/:id", function () {
  this.beforeAll(async () => {
    await sku_dao.deleteSkuData();
  });

  this.afterAll(async () => {
    await sku_dao.deleteSkuData();
  });

  testDeleteSku(null, 204);
  testDeleteSku(9999, 422);
});

function testPostSku(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity,
  expectedHTTPStatus
) {
  it("Insert an sku", function (done) {
    const body = {
      description: description,
      weight: weight,
      volume: volume,
      notes: notes,
      price: price,
      availableQuantity: availableQuantity,
    };
    agent
      .post("/api/sku")
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testGetAllSku() {
  it("Get all sku", function (done) {
    agent.get("/api/skus").then(function (res) {
      res.should.have.status(200);
      done();
    });
  });
}

function testGetSkuById(id, expectedHTTPStatus) {
  it("Get sku by id", function (done) {
    if (id === null) {
      sku_dao
        .newSKU("a new sku", 100, 50, "first SKU", 10.99, 5)
        .then((res) => {
          agent.get("/api/skus/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        });
    } else {
      agent.get("/api/skus/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

function testUpdateSku(
  newDescription,
  newWeight,
  newVolume,
  newNotes,
  newPrice,
  newAvailableQuantity,
  expectedHTTPStatus
) {
  it("Update an sku", function (done) {
    sku_dao.newSKU("a new sku", 100, 50, "first SKU", 10.99, 5).then((res) => {
      const body = {
        newDescription: newDescription,
        newWeight: newWeight,
        newVolume: newVolume,
        newNotes: newNotes,
        newPrice: newPrice,
        newAvailableQuantity: newAvailableQuantity,
      };
      agent
        .put("/api/sku/" + (expectedHTTPStatus != 404 ? res : "9999"))
        .send(body)
        .then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
    });
  });
}

function testUpdateSkuPosition(position, expectedHTTPStatus) {
  it("Update an sku position", function (done) {
    sku_dao.newSKU("a new sku", 100, 50, "first SKU", 10.99, 5).then((res) => {
      const body = {
        position: position,
      };
      agent
        .put("/api/sku/" + res + "/position")
        .send(body)
        .then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
    });
  });
}

function testDeleteSku(sku_id, expectedHTTPStatus) {
  it("Delete an sku", async function () {
    if (sku_id === null) {
      const new_sku = await sku_dao.newSKU(
        "a new sku",
        100,
        50,
        "first SKU",
        10.99,
        5
      );
      agent.delete("/api/skus/" + new_sku).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    } else {
      agent.delete("/api/skus/" + sku_id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}
