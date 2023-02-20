const TestResultService = require("../../api/testResult/testResult_service");
const testResult_dao = require("../../api/testResult/testResult_dao");
const skuItem_dao = require("../../api/sku_item/sku_item_dao");
const testDescriptor_dao = require("../../api/testDescriptor/testDescriptor_dao");
const DatabaseHelper = require("../../database/DatabaseHelper");
const testResult_service = new TestResultService(testResult_dao);

const rfid = "12345678901234567890123456789113";

describe("TestResult Service Test", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await testResult_dao.deleteTestResultData();
    await testDescriptor_dao.deleteTestDescriptorData();
    await skuItem_dao.deleteSkuItemData();
  });
  beforeEach(async () => {
    await testResult_dao.deleteTestResultData();
    await testDescriptor_dao.deleteTestDescriptorData();
    await skuItem_dao.deleteSkuItemData();
  });

  testGetTestResult();
  testUpdateTestResult(2,"2021/10/11", false);
  testNewTestResult(2,"2021/10/11", false);
  testDeleteTestResult("2021/10/11", false);

});

async function testGetTestResult() {
  await test("New TestResult and Get TestResult by Id", async () => {
      await testResult_dao.newTestResult(rfid, 1, "2021/10/10", true);
      await skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30");
      
      let res = await testResult_service.getTestResults(rfid);
      let id0 = res[0].id;

      let tr = await testResult_service.getSpecificTR(rfid, id0);

      expect(tr).toEqual({
        id: id0,
        idTestDescriptor: 1,
        Date: "2021/10/10",
        Result: true,
      });

      expect(res[0]).toEqual({
        id: id0,
        idTestDescriptor: 1,
        Date: "2021/10/10",
        Result: true,
      });
  });
  
}


async function testUpdateTestResult(newTestDescriptorId, newDate, newResult) {
  await test("Update TestDescriptor", async () => {
    try{
      await testResult_dao.newTestResult(rfid, 1, "2021/10/10", true);
      await skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30");
      
      let res = await testResult_service.getTestResults(rfid);
      let id0 = res[0].id;
  
      
      let td = await testResult_service.updateTestResult(rfid, id0,newTestDescriptorId, newDate, newResult);
      expect(td).toStrictEqual(404);
    
      
      await testDescriptor_dao.newTestDescriptor("Test 1", "this is a test", 1);
      res = await testDescriptor_dao.getTestDescriptors();
      let id1 = res[0].id;
  
      td = await testResult_service.updateTestResult(rfid, id0, id1, newDate, newResult);

      res = await testResult_service.getSpecificTR(rfid, id0);
  
      expect(res).toEqual({
        id: id0,
        idTestDescriptor: id1,
        Date: newDate,
        Result: false
      });
    }
    catch (err) {
      expect(err).toStrictEqual(404);
    }
  });
}


async function testNewTestResult(testDescriptorId, date, result) {
  await test("New TestResult", async () => {
    try{
      let td = await testResult_service.newTestResult(rfid, testDescriptorId, date, result);
      expect(td).toEqual(404); // manca skuitem e td

      await skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30");
      td = await testResult_service.newTestResult(rfid, testDescriptorId, date, result);
      expect(td).toEqual(404); // manca td

      await testDescriptor_dao.newTestDescriptor("Test 1", "this is a test", 1);
      let res = await testDescriptor_dao.getTestDescriptors();
      let id1 = res[0].id;

      let td0 = await testResult_service.newTestResult("12345678901234567890123456789000", id1, date, result);
      expect(td0).toEqual(404);//manca skuitem

      await testResult_service.newTestResult(rfid, id1, date, result);
      res = await testResult_service.getTestResults(rfid);
      let id0 = res[0].id;

      td = await testResult_service.getSpecificTR(rfid, id0);

      expect(td).toEqual({
        id: id0,
        idTestDescriptor: id1,
        Date: date,
        Result: false
      })   

    }catch(err){
      expect(err).toStrictEqual(404);
    }
  });
}
async function testDeleteTestResult(
   date, result
) {
  test("Delete TestResult", async () => {
    await skuItem_dao.newSkuItem(rfid, 1, "2022/10/10 11:30");
    await testDescriptor_dao.newTestDescriptor("Test 1", "this is a test", 1);
    let res = await testDescriptor_dao.getTestDescriptors();
    let id1 = res[0].id;

    await testResult_service.newTestResult(rfid, id1, date, result);
    res = await testResult_service.getTestResults(rfid);
    let id_tr = res[0].id;
    await testResult_service.deleteTestResult(rfid, id_tr)
    try {
      await testResult_service.getSpecificTR(rfid, id_tr);
    } catch (err) {
      expect(err).toStrictEqual(404);
    }
  });
}

