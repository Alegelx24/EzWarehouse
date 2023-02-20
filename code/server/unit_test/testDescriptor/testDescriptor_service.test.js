const TestDescriptorService = require("../../api/testDescriptor/testDescriptor_service");
const sku_dao = require("../../api/sku/sku_dao");
const testDescriptor_dao = require("../../api/testDescriptor/testDescriptor_dao");
const DatabaseHelper = require("../../database/DatabaseHelper");
const testDescriptor_service = new TestDescriptorService(testDescriptor_dao);


describe("TestDescriptor Service Test", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await testDescriptor_dao.deleteTestDescriptorData();
    await sku_dao.deleteSkuData();
  });
  beforeEach(async () => {
    await testDescriptor_dao.deleteTestDescriptorData();
    await sku_dao.deleteSkuData();
  });

  testGetTestDescriptor("Test 1", "this is a test", 1);
  testUpdateTestDescriptor("Test 1", "this is a test");
  testNewTestDescriptor("Test 1", "this is a test", 1);
  testDeleteTestDescriptor();
});

async function testGetTestDescriptor(name, procedureDescription, skuID) {
  await test("New TestDescriptor and Get TestDescriptor by Id", async () => {
    let res = await testDescriptor_service.getSpecificTD(1);
    expect(res).toEqual(404);
    
    await testDescriptor_dao.newTestDescriptor(name, procedureDescription, skuID);
   
    let result = await testDescriptor_dao.getTestDescriptors();
    let id0 = result[0].id;
    
    res = await testDescriptor_service.getSpecificTD(id0);

    expect(res).toEqual({
        id: id0,
        name: name,
        procedureDescription: procedureDescription,
        idSKU: skuID
    });
  });
}


async function testUpdateTestDescriptor(name, procedureDescription) {
  await test("Update TestDescriptor", async () => {
    await testDescriptor_dao.newTestDescriptor("Test 2", "this is another test", 2);
    
    let result = await testDescriptor_dao.getTestDescriptors();
    let id0 = result[0].id;

    const td = await testDescriptor_service.updateTestDescriptor(id0, name, procedureDescription, 3);
    expect(td).toEqual(404);
        
    const new_sku = await sku_dao.newSKU("First SKU", 100, 50, "First SKU Note", 10.99, 50);

    await testDescriptor_service.updateTestDescriptor(id0, name, procedureDescription, new_sku);
    let res = await testDescriptor_service.getSpecificTD(id0);
    expect(res).toEqual({
        id: id0,
        name: name,
        procedureDescription: procedureDescription,
        idSKU: new_sku
    });
  });
}

async function testNewTestDescriptor(name, procedureDescription) {
  await test("New TestDescriptor", async () => {
      //non c'è lo sku id
      const td = await testDescriptor_service.newTestDescriptor("Test 2", "this is another test", 2);
      expect(td).toEqual(404);

      //sku id esiste

      const new_sku = await sku_dao.newSKU("First SKU", 100, 50, "First SKU Note", 10.99, 50);
      const td1 = await testDescriptor_service.newTestDescriptor(name, procedureDescription, new_sku);
      expect(td1).toEqual();

      let result = await testDescriptor_dao.getTestDescriptors();
      let id0 = result[0].id;

      let res = await testDescriptor_service.getSpecificTD(id0);
      expect(res).toEqual({
        id: id0,
        name: name,
        procedureDescription: procedureDescription,
        idSKU: new_sku
    });
  });
}

async function testDeleteTestDescriptor() {
 test("Delete TestDescriptor", async () => {
   await testDescriptor_dao.newTestDescriptor("Test 1", "this is a test", 1);
   let res = await testDescriptor_dao.getTestDescriptors();
   let id1 = res[0].id;

   await testDescriptor_service.deleteTestDescriptor(id1);
   try {
     await testDescriptor_service.getSpecificTD(id1);
   } catch (err) {
     expect(err).toStrictEqual(404);
   }
 });
}
