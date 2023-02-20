const item_dao = require('../../api/item/item_dao');
const DatabaseHelper = require("../../database/DatabaseHelper");

/*
const emptyTable = async () => {
    const item = await item_dao.getItems();
    if (item.length > 0) {
      item.forEach((i) => {
        item_dao.deleteItem(i.id);
      });
    }
  };
  */
  
  describe("Test Item DAO", () => {
    beforeAll(async() => {
      new DatabaseHelper();
      item_dao.deleteItemData();
    });
    beforeEach(async() => {
      item_dao.deleteItemData();
    });
  
    test("Empty Item Table", async () => {
      let res = await item_dao.getItems();
      expect(res.length).toStrictEqual(0);
    });
  
    testGetItems();
    testGetSpecificItem();
    testNewItem(1,"This is a test", 10.99, 1, 1);
    testUpdateItem("This is a new test", 11.99);
    testDeleteItem();
  });
  
  async function testGetItems() {
    await test("Test Get all Items", async () => {
        let res = await item_dao.getItems();
        expect(res.length).toStrictEqual(0);
    
        await item_dao.newItem(1,"This is a test", 10.99, 1, 1)
    
        res = await item_dao.getItems();
        expect(res.length).toStrictEqual(1);
    
        await item_dao.newItem(2,"this is another test", 11.99, 2, 2);
    
        res = await item_dao.getItems();
        expect(res.length).toStrictEqual(2);
    });
  }
  
  async function testGetSpecificItem() {
    await test("Test Get Item By Id", async () => {
        await item_dao.newItem(1,"This is a test", 10.99, 1, 1)
        
        const res = await item_dao.getSpecificItem(1,1);

        //expect(res.id).toStrictEqual(1);
        expect(res.description).toStrictEqual("This is a test");
        expect(res.price).toStrictEqual(10.99);
        expect(res.supplierId).toStrictEqual(1);
        expect(res.SKUId).toStrictEqual(1);
    });
  }
  
  async function testNewItem(id, description, price, skuID, supplierID) {
    await test("Test New Item", async () => {
        await item_dao.newItem(id, description, price, skuID, supplierID)
    
        let res = await item_dao.getItems();
        expect(res.length).toStrictEqual(1);
        
        res = await item_dao.getSpecificItem(id, supplierID);

        //expect(res.id).toStrictEqual(id);
        expect(res.description).toStrictEqual(description);
        expect(res.price).toStrictEqual(price);
        expect(res.supplierId).toStrictEqual(supplierID);
        expect(res.SKUId).toStrictEqual(skuID);
    });
  }
  
  async function testUpdateItem(newDescription, newPrice) {
    await test("Test Update Item", async () => {
        await item_dao.newItem(1,"This is a test", 10.99, 1, 1)
    
        await item_dao.updateItem(1, 1, newDescription, newPrice);
    
        let res = await item_dao.getItems();
        expect(res.length).toStrictEqual(1);
    
        res = await item_dao.getSpecificItem(1, 1);
    
        expect(res.description).toStrictEqual(newDescription);
        expect(res.price).toStrictEqual(newPrice);
    });
  }
  
  async function testDeleteItem() {
    await test("Test Delete Item", async () => {
        await item_dao.newItem(1,"This is a test", 10.99, 1, 1)
  
        let res = await item_dao.getItems();
        expect(res.length).toStrictEqual(1);
    
        res = await item_dao.deleteItem(1, 1);
  
        res = await item_dao.getItems();
        expect(res.length).toStrictEqual(0);
  
        res = await item_dao.getSpecificItem(1, 1);
        expect(res).toStrictEqual(undefined);
    });
  }
   