const testDescriptor_dao = require('../../api/testDescriptor/testDescriptor_dao');
const DatabaseHelper = require("../../database/DatabaseHelper");

/*
const emptyTable = async () => {
    const tds = await testDescriptor_dao.getTestDescriptors();
    if (tds.length > 0) {
      tds.forEach((t) => {
        testDescriptor_dao.deleteTestDescriptor(t.id);
      });
    }
  };
*/
  
  describe("Test TestDescriptor DAO", () => {
    beforeAll(async() => {
      new DatabaseHelper();
      await testDescriptor_dao.deleteTestDescriptorData();
    });
    beforeEach(async() => {
      await testDescriptor_dao.deleteTestDescriptorData();
    });
  
    test("Empty TestDescriptor Table", async () => {
      let res = await testDescriptor_dao.getTestDescriptors();
      expect(res.length).toStrictEqual(0);
    });
  
    testGetTestDescriptors();
    testGetSpecificTD();
    testNewTestDescriptor("Test 4", "This is a test", 1);
    testUpdateTestDescriptor("Test 6", "This is a new test", 2);
    testDeleteTestDescriptor();
  });
  
  async function testGetTestDescriptors() {
    await test("Test Get all TestDescriptor", async () => {
        let res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(0);
    
        await testDescriptor_dao.newTestDescriptor("Test 1", "This is a test", 1)
    
        res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(1);
    
        await testDescriptor_dao.newTestDescriptor("Test 2", "This is a test", 1);
    
        res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(2);
    });
  }
  
  async function testGetSpecificTD() {
    await test("Test Get TestDescriptor By Id", async () => {
        const id = await testDescriptor_dao.newTestDescriptor("Test 3", "This is a test", 1);
      
        const res = await testDescriptor_dao.getSpecificTD(id);

        expect(res.name).toStrictEqual("Test 3");
        expect(res.procedureDescription).toStrictEqual("This is a test");
        expect(res.idSKU).toStrictEqual(1);
    });
  }
  
  async function testNewTestDescriptor(name, procedureDescription, skuID) {
    await test("Test New TestDescriptor", async () => {
        const id = await testDescriptor_dao.newTestDescriptor(name, procedureDescription, skuID);
    
        let res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(1);
        
        res = await testDescriptor_dao.getSpecificTD(id);

        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedureDescription);
        expect(res.idSKU).toStrictEqual(skuID);
    });
  }
  
  async function testUpdateTestDescriptor(newName, newProcedureDescription, newSkuID) {
    await test("Test Update TestDescriptor", async () => {
        const id = await testDescriptor_dao.newTestDescriptor("Test 5", "This is a test", 1);
            
        await testDescriptor_dao.updateTestDescriptor(id, newName, newProcedureDescription, newSkuID);
    
        let res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(1);
    
        res = await testDescriptor_dao.getSpecificTD(id);
    
        expect(res.name).toStrictEqual(newName);
        expect(res.procedureDescription).toStrictEqual(newProcedureDescription);
        expect(res.idSKU).toStrictEqual(newSkuID);
    });
  }
  
  async function testDeleteTestDescriptor() {
    await test("Test Delete TestDescriptor", async () => {
        const id = await testDescriptor_dao.newTestDescriptor("Test 7", "This is a test", 1);
  
        let res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(1);
           
  
        res = await testDescriptor_dao.deleteTestDescriptor(id);
  
        res = await testDescriptor_dao.getTestDescriptors();
        expect(res.length).toStrictEqual(0);
  
        res = await testDescriptor_dao.getSpecificTD(id);
        expect(res).toStrictEqual(undefined);
    });
  }
   
