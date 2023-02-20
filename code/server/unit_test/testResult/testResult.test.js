const testResult_dao = require('../../api/testResult/testResult_dao');
const DatabaseHelper = require("../../database/DatabaseHelper");
const rfid = "12345678901234567890123456789115";

/*
const emptyTable = async () => {
    const trs = await testResult_dao.getTestResults(rfid);
    if (trs.length > 0) {
      trs.forEach((t) => {
        testResult_dao.deleteTestResult(rfid, t.id);
      });
    }
  };
*/
  
  describe("Test TestResult DAO", () => {
    beforeAll(async () => {
      new DatabaseHelper();
      testResult_dao.deleteTestResultData();
    });
    beforeEach(async () => {
      testResult_dao.deleteTestResultData();
    });

    test("Empty TestResult Table for different rfid", async () => {
      const rfid1 = "22345678901234567890123456789016";
      let res = await testResult_dao.getTestResults(rfid1);
      expect(res.length).toStrictEqual(0);
    });

    testGetTestResults(rfid);
    testGetSpecificTR(rfid);
    testNewTestResult(rfid, 4, "2021/10/10", true);
    testUpdateTestResult(rfid, 5, "2021/11/10", false);
    testDeleteTestResult(rfid);
  });

  async function testGetTestResults(rfid) {
    await test("Test Get all TestResult by RFID", async () => {
      let res = await testResult_dao.getTestResults(rfid);
      expect(res.length).toStrictEqual(0);

      await testResult_dao.newTestResult(rfid, 1, "2021/10/10", true);

      res = await testResult_dao.getTestResults(rfid);
      expect(res.length).toStrictEqual(1);

      await testResult_dao.newTestResult(rfid, 2, "2021/10/10", false);

      res = await testResult_dao.getTestResults(rfid);
      expect(res.length).toStrictEqual(2);
    });
  }

  async function testGetSpecificTR(rfid) {
    await test("Test Get TestResult By Id", async () => {
      await testResult_dao.newTestResult(rfid, 3, "2021/10/10", true);

      let result = await testResult_dao.getTestResults(rfid);

      let id = result[0].id;
      const res = await testResult_dao.getSpecificTR(rfid, id);
      expect(res.id).toStrictEqual(id);
      expect(res.idTestDescriptor).toStrictEqual(3);
      expect(res.Date).toStrictEqual("2021/10/10");
      expect(res.Result).toStrictEqual(true);
    });
  }

  async function testNewTestResult(rfid, testDescriptorId, date, result) {
    await test("Test New TestResult", async () => {
      await testResult_dao.newTestResult(rfid, testDescriptorId, date, result);

      let res = await testResult_dao.getTestResults(rfid);
      expect(res.length).toStrictEqual(1);

      let result0 = await testResult_dao.getTestResults(rfid);

      let id = result0[0].id;
      res = await testResult_dao.getSpecificTR(rfid, id);

      expect(res.id).toStrictEqual(id);
      expect(res.idTestDescriptor).toStrictEqual(4);
      expect(res.Date).toStrictEqual("2021/10/10");
      expect(res.Result).toStrictEqual(true);
    });
  }

  async function testUpdateTestResult(
    rfid,
    newTestDescriptorId,
    newDate,
    newResult
  ) {
    await test("Test Update TestResult", async () => {
      await testResult_dao.newTestResult(rfid, 3, "2021/10/10", true);

      let result = await testResult_dao.getTestResults(rfid);
      let id = result[0].id;

      await testResult_dao.updateTestResult(
        rfid,
        id,
        newTestDescriptorId,
        newDate,
        newResult
      );

      let res = await testResult_dao.getTestResults(rfid);
      expect(res.length).toStrictEqual(1);

      res = await testResult_dao.getSpecificTR(rfid, id);

      expect(res.id).toStrictEqual(id);
      expect(res.idTestDescriptor).toStrictEqual(newTestDescriptorId);
      expect(res.Date).toStrictEqual(newDate);
      expect(res.Result).toStrictEqual(false);
    });
  }
  
  async function testDeleteTestResult(rfid) {
    await test("Test Delete TestResult", async () => {
        await testResult_dao.newTestResult(rfid, 6, "2021/10/10", true);
  
        let res = await testResult_dao.getTestResults(rfid);
        expect(res.length).toStrictEqual(1);
    
        let result = await testResult_dao.getTestResults(rfid);
        let id = result[0].id;
        
  
        res = await testResult_dao.deleteTestResult(rfid, id);
  
        res = await testResult_dao.getTestResults(rfid);
        expect(res.length).toStrictEqual(0);
  
        res = await testResult_dao.getSpecificTR(rfid, id);
        expect(res).toStrictEqual(undefined);
    });
  }