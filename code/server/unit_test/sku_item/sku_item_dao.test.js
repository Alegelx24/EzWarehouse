const DatabaseHelper = require("../../database/DatabaseHelper");
const sku_item_dao = require("../../api/sku_item/sku_item_dao");

describe("Test SKU Item DAO", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await sku_item_dao.deleteSkuItemData();
  });

  beforeEach(async () => await sku_item_dao.deleteSkuItemData());

  afterAll(async () => {
    await sku_item_dao.deleteSkuItemData();
  });

  test("Empty SKU Item Table", async () => {
    let res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(0);
  });

  testGetAllSkuItems();
  testGetSkuItemsBySkuId(3);
  testGetSkuItemByRFID("1234567890123456789012345671234");
  testNewSkuItem("1234567890123456789012345671234", 10, "2022/05/20 12:30");
  testNewSkuItem("1234567890123456789012345671235", 10);
  testUpdateSkuItem("1234567890123456789012345670011", 1, "2022/05/20 12:30");
  testUpdateOrderIdSkuItem(12, 10, "1234567890123456789012345670011");
  testDeleteSkuItem("1234567890123456789012345671234");
});

function testGetAllSkuItems() {
  test("Test Get All SKU Items", async () => {
    let res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(0);

    let new_sku_item = await sku_item_dao.newSkuItem(
      "12345678901234567890123456789015",
      1,
      "2021/11/29 12:30"
    );

    res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(1);

    new_sku_item = await sku_item_dao.newSkuItem(
      "12345678901234567890123456789016",
      1,
      "2021/11/29 12:30"
    );

    res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(2);
  });
}

function testGetSkuItemsBySkuId(skuID) {
  test("Test Get SKU Item By SKU Id", async () => {
    await sku_item_dao.newSkuItem(
      "12345678901234567890123456789015",
      skuID,
      "2021/11/29 12:30"
    );
    await sku_item_dao.updateSkuItem(
      "12345678901234567890123456789015",
      "12345678901234567890123456789015",
      1,
      "2021/11/29 12:30"
    );
    const res = await sku_item_dao.getSkuItemsBySkuId(skuID);
    expect(res.length).toStrictEqual(1);
    expect(res[0].RFID).toStrictEqual("12345678901234567890123456789015");
    expect(res[0].SKUId).toStrictEqual(skuID);
    expect(res[0].available).toStrictEqual(1);
    expect(res[0].DateOfStock).toStrictEqual("2021/11/29 12:30");
    expect(res[0].orderId).toStrictEqual(null);
  });
}

function testGetSkuItemByRFID(RFID) {
  test("Test Get SKU Item By RFID", async () => {
    await sku_item_dao.newSkuItem(RFID, 1, "2021/11/29 12:30");
    const res = await sku_item_dao.getSkuItemByRFID(RFID);
    expect(res.RFID).toStrictEqual(RFID);
    expect(res.SKUId).toStrictEqual(1);
    expect(res.available).toStrictEqual(0);
    expect(res.DateOfStock).toStrictEqual("2021/11/29 12:30");
    expect(res.orderId).toStrictEqual(null);
  });
}

function testNewSkuItem(RFID, SKUId, DateOfStock = null) {
  test("Test New SKU Item", async () => {
    await sku_item_dao.newSkuItem(RFID, SKUId, DateOfStock);

    let res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(1);

    res = await sku_item_dao.getSkuItemByRFID(RFID);

    expect(res.RFID).toStrictEqual(RFID);
    expect(res.SKUId).toStrictEqual(SKUId);
    expect(res.available).toStrictEqual(0);
    expect(res.DateOfStock).toStrictEqual(DateOfStock);
    expect(res.orderId).toStrictEqual(null);
  });
}

function testUpdateSkuItem(newRFID, newAvailable, newDateOfStock) {
  test("Test Update SKU Item", async () => {
    await sku_item_dao.newSkuItem(
      "12345678901234567890123456789015",
      2,
      "2021/11/29 12:30"
    );

    await sku_item_dao.updateSkuItem(
      "12345678901234567890123456789015",
      newRFID,
      newAvailable,
      newDateOfStock
    );

    let res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(1);

    res = await sku_item_dao.getSkuItemByRFID(newRFID);

    expect(res.RFID).toStrictEqual(newRFID);
    expect(res.SKUId).toStrictEqual(2);
    expect(res.available).toStrictEqual(newAvailable);
    expect(res.DateOfStock).toStrictEqual(newDateOfStock);
    expect(res.orderId).toStrictEqual(null);
  });
}

function testUpdateOrderIdSkuItem(orderId, itemId, RFID) {
  test("Test Update OrderID SKU Item", async () => {
    await sku_item_dao.newSkuItem(RFID, 2, "2021/11/29 12:30");

    await sku_item_dao.updateOrderIdSkuItem(orderId, itemId, RFID);

    let res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(1);

    res = await sku_item_dao.getSkuItemByRFID(RFID);

    expect(res.RFID).toStrictEqual(RFID);
    expect(res.SKUId).toStrictEqual(2);
    expect(res.available).toStrictEqual(0);
    expect(res.DateOfStock).toStrictEqual("2021/11/29 12:30");
    expect(res.orderId).toStrictEqual(orderId);
    expect(res.itemId).toStrictEqual(itemId);
  });
}

function testDeleteSkuItem(RFID) {
  test("Test Delete SKU Item", async () => {
    await sku_item_dao.newSkuItem(RFID, 2, "2021/11/29 12:30");

    let res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(1);

    res = await sku_item_dao.deleteSkuItem(RFID);

    res = await sku_item_dao.getAllSkuItems();
    expect(res.length).toStrictEqual(0);

    try {
      res = await sku_item_dao.getSkuItemByRFID(RFID);
    } catch (err) {
      expect(err).toStrictEqual(404);
    }
  });
}
