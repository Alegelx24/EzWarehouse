const ItemService = require("../../api/item/item_service");
const sku_dao = require("../../api/sku/sku_dao");
const item_dao = require("../../api/item/item_dao");
const DatabaseHelper = require("../../database/DatabaseHelper");
const item_service = new ItemService(item_dao);


describe("TestDescriptor Service Test", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await item_dao.deleteItemData();
    await sku_dao.deleteSkuData();
  });
  beforeEach(async () => {
    await item_dao.deleteItemData();
    await sku_dao.deleteSkuData();
  });

  testGetItem(1, "this is a test", 10, 1, 1);
  testNewItem(1, "this is a test", 10, 1, 1);
  testDeleteItem();
  testUpdateItem(5, "new description", 11);

});

async function testGetItem(id, description, price, skuID, supplierID) {
  await test("New Item and Get Item by Id", async () => {
    let res = await item_service.getSpecificItem(2, supplierID);
    expect(res).toEqual(404);

    await item_dao.newItem(id, description, price, skuID, supplierID);

    res = await item_service.getSpecificItem(id, supplierID);
    
    expect(res).toEqual({
        id: id,
        description: description,
        price: price ,
        SKUId : skuID,
        supplierId : supplierID
    })
})
}

async function testNewItem(id, description, price, skuID, supplierID) {
  await test("New Item", async () => {
    let res = await item_service.newItem(id,description, price, skuID, supplierID);
    expect(res).toEqual(404);

    let skuid = await sku_dao.newSKU("First SKU", 100, 50, "First SKU Note", 10.99, 50);

    await item_service.newItem(id,description, price, skuid, supplierID);

    res = await item_service.getSpecificItem(id, supplierID);
    expect(res).toEqual({
        id: id,
        description: description,
        price: price ,
        SKUId : skuid,
        supplierId : supplierID
    })
    
})
}

async function testDeleteItem() {
  test("Delete item", async () => {
    await item_dao.newItem(3, "this is a test", 10, 1, 1);
 
    await item_service.deleteItem(3, 1)
    try {
      await item_service.getSpecificItem(3);
    } catch (err) {
      expect(err).toStrictEqual(404);
    }
  });
 }

 async function testUpdateItem(id, newDescription, newPrice) {
  await test("Update item", async () => {
    await item_dao.newItem(3, "this is a test", 10, 1, 1);
    

    const item = await item_service.updateItem(id,1 , newDescription, newPrice);
    expect(item).toEqual(404);
        
    await item_dao.newItem(id, "this is a test", 10, 1, 1);

    await item_service.updateItem(id, 1, newDescription, newPrice);
    let res = await item_service.getSpecificItem(id, 1);
    expect(res).toEqual({
        id: id,
        description: newDescription,
        price: newPrice,
        SKUId : 1,
        supplierId : 1

    });
  });
}

