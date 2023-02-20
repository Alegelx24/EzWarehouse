const chai = require("chai");
const testResult_dao = require("../api/testResult/testResult_dao");
const skuItem_dao = require("../api/sku_item/sku_item_dao");
const testDescriptor_dao = require("../api/testDescriptor/testDescriptor_dao");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
var agent = chai.request.agent(app);

const rfidTR = "12345678901234567890123456789113";

describe("TestResult - POST /api/skuitems/testResult", function () {
  this.beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
    await skuItem_dao.deleteSkuItemData();
    await testResult_dao.deleteTestResultData();
  });
    
  testPostTestResult(rfidTR, null, "2021/10/10", true, 201);
  testPostTestResult(rfidTR, "test", "2021/10/10", true, 422);
  testPostTestResult(rfidTR, 1, "2021/10/10", true, 404);
});


describe("TestResult- GET /api/skuitems/:rfid/testResults", function () {
    this.beforeEach(async () => {
        await testDescriptor_dao.deleteTestDescriptorData();
        await skuItem_dao.deleteSkuItemData();
        await testResult_dao.deleteTestResultData();
      });

    testGetAllTestResult(rfidTR, 200);
    testGetAllTestResult(1, 422);
});

describe("TestResult - GET /api/skuitems/:rfid/testResults/:id", function () {
    this.beforeEach(async () => {
        await testDescriptor_dao.deleteTestDescriptorData();
        await skuItem_dao.deleteSkuItemData();
        await testResult_dao.deleteTestResultData();
      });
     
  testGetTestResultById(rfidTR, null, 200); 
  testGetTestResultById(rfidTR, "test", 422); 
  testGetTestResultById(rfidTR, 1, 404);
});

describe("TestResult - PUT /api/skuitems/:rfid/testResult/:id", function () {
    this.beforeEach(async () => {
        await testDescriptor_dao.deleteTestDescriptorData();
        await skuItem_dao.deleteSkuItemData();
        await testResult_dao.deleteTestResultData();
      });

  testUpdateTestResult(rfidTR,"2020/10/11", false, 200);
  testUpdateTestResult(2,"2020/10/11", false, 422);
});

describe("TestResult - DELETE /api/skuitems/:rfid/testResult/:id", function () {
  this.beforeEach(async () => {
    await testResult_dao.deleteTestResultData();
  });

  testDeleteTestResult(rfidTR, null, 204);
  testDeleteTestResult(rfidTR,"id", 422);
});


function testPostTestResult(rfid, idTestDescriptor, date, result, expectedHTTPStatus) {
  it("Insert a testResult", function (done) {
    if(idTestDescriptor === null){
        skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30")
        .then(()=>{
            testDescriptor_dao.newTestDescriptor("test 1","this is a test", 1)
            .then((res) =>{
                agent
                .post("/api/skuitems/testResult")
                .send({
                    rfid: rfid,
                    idTestDescriptor: res,
                    Date: date,
                    Result: result
                })
                .then(function (res) {
                  res.should.have.status(expectedHTTPStatus);
                  done();
                });
            })
        })
    }else{
        const body = {
            rfid: rfid,
            idTestDescriptor: idTestDescriptor,
            Date: date,
            Result: result
        };
        skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30")
        .then(() => {
            agent
            .post("/api/skuitems/testResult")
            .send(body)
            .then(function (res) {
              res.should.have.status(expectedHTTPStatus);
              done();
            });
        })
    }
  });
}

function testGetAllTestResult(rfid, expectedHTTPStatus) {
  it("Get all testResult by rfid", function (done) {
    skuItem_dao.newSkuItem(rfidTR, 1, "2022/10/10 11:30")
    .then(() =>{
        agent.get("/api/skuitems/" + rfid + "/testResults").then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
    })
  });
}

function testGetTestResultById(rfid, id, expectedHTTPStatus) {
  it("Get testResult by rfid and id", function (done) {
      if(id === null){
          skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30")
          .then(()=>{
            testResult_dao.newTestResult(rfid, 1, "2021/10/10", true)
            .then((res)=>{
                agent.get("/api/skuitems/" + rfid + "/testResults/" + res).then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                  });
            })
          })
      }else{
          skuItem_dao.newSkuItem(rfid, 1,"2022/10/10 11:30" )
          .then(()=>{
            agent.get("/api/skuitems/" + rfid + "/testResults/" + id).then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
              });
          })
      }
  });
}

function testUpdateTestResult(
    rfid,
    newDate,
    newResult,
    expectedHTTPStatus
) {
  it("Update a testResult", async function () {
    await testResult_dao.newTestResult(rfid, 1, "2021/10/10", true);
    let result = await testResult_dao.getTestResults(rfid);
    let tr_id = result[0].id;  
    

    const td_id = await testDescriptor_dao.newTestDescriptor("Test 1", "this is a test", 1);

    const body = {
        newTestDescriptorId: td_id,
        newDate: newDate,
        newResult: newResult
    };
    agent
      .put("/api/skuitems/" + rfid + "/testResult/" + tr_id)
      .send(body)
      .then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
  });
}

function testDeleteTestResult(rfid, id, expectedHTTPStatus) {
  it("Delete a testResult", function (done) {
    if (id === null) {
      testResult_dao.newTestResult(rfid, 1, "2021/10/10", true)
        .then((res) =>{
          agent.delete("/api/skuitems/" + rfid + "/testResult/" + res).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
          });
        })
    } else {
      agent.delete("/api/skuitems/" + rfidTR + "/testResult/" + id).then(function (res) {
        res.should.have.status(expectedHTTPStatus);
        done();
      });
    }
  });
}
