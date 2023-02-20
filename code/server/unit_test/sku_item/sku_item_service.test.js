const SkuItemService = require("../../api/sku_item/sku_item_service");
const sku_item_dao = require("../../api/sku_item/sku_item_dao");
const sku_dao = require("../../api/sku/sku_dao");
const DatabaseHelper = require("../../database/DatabaseHelper");
const sku_item_service = new SkuItemService(sku_item_dao);

describe("Sku Item Service Test", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });

  beforeEach(async () => {
    await sku_item_dao.deleteSkuItemData();
    await sku_dao.deleteSkuData();
  });

  testNewGetSkuItem("12345678901234567890123456789001", "2021/11/29 12:30");
  testUpdateSkuItem(
    "12345678901234567890123456789011",
    "12345678901234567890123456789111",
    1,
    "2022/03/20 12:30"
  );
  testDeleteSkuItem("12345678901234567890123456789111");
});

async function testNewGetSkuItem(RFID, DateOfStock) {
  test("New SKU Item and Get Sku Item By Id", async () => {
    const new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);
    await sku_item_service.newSkuItem(RFID, new_sku, DateOfStock);
    let res = await sku_item_service.getSkuItemByRFID(RFID);
    expect(res).toEqual({
      RFID: RFID,
      SKUId: new_sku,
      Available: 0,
      DateOfStock: DateOfStock,
    });
  });
}

async function testUpdateSkuItem(rfid, newRFID, newAvailable, newDateOfStock) {
  test("Update SKU Item", async () => {
    const new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);
    await sku_item_service.newSkuItem(rfid, new_sku, "2021/11/29 12:30");
    await sku_item_service.updateSkuItem(
      rfid,
      newRFID,
      newAvailable,
      newDateOfStock
    );
    let res = await sku_item_service.getSkuItemByRFID(newRFID);
    expect(res).toEqual({
      RFID: newRFID,
      SKUId: new_sku,
      Available: newAvailable,
      DateOfStock: newDateOfStock,
    });
  });
}

async function testDeleteSkuItem(rfid) {
  test("Delete SKU Item", async () => {
    const new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);
    await sku_item_service.newSkuItem(rfid, new_sku, "2021/11/29 12:30");
    await sku_item_service.deleteSkuItem(rfid);
    try {
      await sku_item_service.getSkuItemByRFID(rfid);
    } catch (err) {
      expect(err).toStrictEqual(404);
    }
  });
}
