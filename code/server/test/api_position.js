const chai = require("chai");
const chaiHttp = require("chai-http");

const position_dao = require("../api/position/position_dao");

chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("Position - POST /api/position", function () {
  this.beforeAll(async () => {
    await position_dao.deletePositionData();
  });

  testPostPosition("100020003000", "1000", "2000", "3000", 1000, 1000, 201);
});

describe("Position - GET /api/positions", function () {
  testGetPosition(200);
});

describe("Position - PUT /api/position/:positionID", function () {
  this.beforeAll(async () => {
    await position_dao.deletePositionData();
  });

  testPostPosition("100020003000", "1000", "2000", "3000", 1000, 1000, 201);

  testUpdatePosition(
    "100020003000",
    "3000",
    "4000",
    "5000",
    5000,
    5000,
    150,
    150,
    200
  );

  testUpdatePosition(
    "888899991111",
    "3000",
    "4000",
    "5000",
    5000,
    5000,
    150,
    150,
    404
  );

  testUpdatePosition(
    "300040005000",
    "2000",
    "1000",
    "3000",
    5000,
    5000,
    "wrong data",
    "wrong data",
    422
  );
});

describe("Position - PUT /api/position/:positionID/changeID", function () {
  testUpdatePositionID("300040005000", "800090007000", 200);
  testUpdatePositionID("111122223333", "800090007000", 404);
  testUpdatePositionID("300040005000", "prova", 422);
});

describe("Position - DELETE /api/position/:positionID", function () {
  testDeletePosition("800090007000", 204);
  testDeletePosition("111122223333", 422);
});

function testPostPosition(
  positionID,
  aisleID,
  row,
  col,
  maxWeight,
  maxVolume,
  expectedHTTPStatus
) {
  it("Insert a position", function (done) {
    const body = {
      positionID: positionID,
      aisleID: aisleID,
      row: row,
      col: col,
      maxWeight: maxWeight,
      maxVolume: maxVolume,
    };
    agent
      .post("/api/position")
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testGetPosition(expectedHTTPStatus) {
  it("Get positions", function (done) {
    agent.get("/api/positions").then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  });
}

function testUpdatePosition(
  positionID,
  newAisleID,
  newRow,
  newCol,
  newMaxWeight,
  newMaxVolume,
  newOccupiedWeight,
  newOccupiedVolume,
  expectedHTTPStatus
) {
  it("Update position", function (done) {
    const body = {
      positionID: positionID,
      newAisleID: newAisleID,
      newRow: newRow,
      newCol: newCol,
      newMaxWeight: newMaxWeight,
      newMaxVolume: newMaxVolume,
      newOccupiedWeight: newOccupiedWeight,
      newOccupiedVolume: newOccupiedVolume,
    };
    agent
      .put("/api/position/" + positionID)
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testUpdatePositionID(positionID, newPositionID, expectedHTTPStatus) {
  it("Update position changeID", function (done) {
    const body = {
      newPositionID: newPositionID,
    };
    agent
      .put("/api/position/" + positionID + "/changeID")
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testDeletePosition(positionID, expectedHTTPStatus) {
  it("Delete position", function (done) {
    agent.delete("/api/position/" + positionID).then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  });
}