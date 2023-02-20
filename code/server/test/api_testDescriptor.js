const chai = require("chai");
const testDescriptor_dao = require("../api/testDescriptor/testDescriptor_dao");
const sku_dao = require("../api/sku/sku_dao")
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

describe("TestDescriptor - POST /api/testDescriptor", function () {
  this.beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
    await sku_dao.deleteSkuData();
  });

  testPostTestDescriptor("Test 1", "this is a test", null, 201);
  testPostTestDescriptor("Test 1", 1, null, 422);
  testPostTestDescriptor("Test 1", "this is a test", 1, 404);
});

describe("TestDescriptor- GET /api/testDescriptors", function () {
  this.beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
    await sku_dao.deleteSkuData();
  });
  testGetAllTestDescriptor();
});

describe("TestDescriptor - GET /api/testDescriptors/:id",  function () {
  this.beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
    await sku_dao.deleteSkuData();
  });
  
  testGetTestDescriptorById(null, 200);
  testGetTestDescriptorById(1, 404);
  testGetTestDescriptorById("test", 422);
});

describe("TestDescriptor - PUT /api/testDescriptor/:id",  function () {
  this.beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
    await sku_dao.deleteSkuData();
  });
  testUpdateTestDescriptor("new Test","new description", 1, 200);
  testUpdateTestDescriptor(2,"new description", 1, 422);
});

describe("TestDescriptor - DELETE /api/testDescriptor/:id", function () {
  this.beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
  });

  testDeleteTestDescriptor(null, 204);
  testDeleteTestDescriptor("id", 422);
});


function testPostTestDescriptor(name, procedureDescription, idSKU, expectedHTTPStatus) {
  it("Insert a testDescriptor", function (done) {
    if(idSKU === null){
    sku_dao.newSKU("a new sku", 100, 50, "first SKU", 10.99, 5)
    .then((res) => {
      agent
        .post("/api/testDescriptor")
        .send({
          name: name,
          procedureDescription: procedureDescription,
          idSKU: res
        })
        .then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
    })
    }else{
      const body = {
        name: name,
        procedureDescription: procedureDescription,
        idSKU: idSKU
      };
      agent
        .post("/api/testDescriptor")
        .send(body)
        .then(function (res) {
          res.should.have.status(expectedHTTPStatus);
          done();
        });
    }
  });
}

function testGetAllTestDescriptor() {
  it("Get all testDescriptor", function (done) {
    agent.get("/api/testDescriptors").then(function (res) {
      res.should.have.status(200);
      done();
    });
  });
}

function testGetTestDescriptorById(id, expectedHTTPStatus) {
  it("Get testDescriptor by id", function (done) {
    if(id === null){
      testDescriptor_dao.newTestDescriptor("Test 1", "this is a test", 1)
        .then((res) => {
          agent.get("/api/testDescriptors/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        })
    }
    agent.get("/api/testDescriptors/" + id).then(function (res) {
      res.should.have.status(expectedHTTPStatus);
      done();
    });
  });
}

function testUpdateTestDescriptor(
    newName,
    newProcedureDescription,
    newIdSKU,
    expectedHTTPStatus
) {
  it("Update a testDescriptor", async function () {
    const id = await testDescriptor_dao.newTestDescriptor("test 1","this is a test", 1);

    const body = {
        newName: newName,
        newProcedureDescription: newProcedureDescription,
        newIdSKU: newIdSKU
    };
    agent
      .put("/api/testDescriptors/" + id)
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testDeleteTestDescriptor(id, expectedHTTPStatus) {
  it("Delete a testDescriptor", function (done) {
    if (id === null) {
        testDescriptor_dao.newTestDescriptor("test 1","this is a test", 1)
        .then((res) =>{
          agent.delete("/api/testDescriptor/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        })
    } else {
      agent.delete("/api/testDescriptor/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}

