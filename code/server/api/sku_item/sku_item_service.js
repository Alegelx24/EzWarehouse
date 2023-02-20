const sku_dao = require("../sku/sku_dao");

class SkuItemService {
  dao;

  constructor(dao) {
    this.dao = dao;
  }

  getAllSkuItems = async () => {
    const sku_items = await this.dao.getAllSkuItems();
    if (!sku_items) {
      throw 500;
    }
    let sku_items_DTO = sku_items.map((sku_item) => ({
      RFID: sku_item.RFID,
      SKUId: sku_item.SKUId,
      Available: sku_item.available,
      DateOfStock: sku_item.DateOfStock,
    }));
    return sku_items_DTO;
  };

  getSkuItemsBySkuId = async (skuId) => {
    const sku = await sku_dao.getSkuById(skuId);
    if (sku === undefined) {
      throw 404;
    }
    const sku_items = await this.dao.getSkuItemsBySkuId(skuId);
    if (sku_items) {
      let sku_items_DTO = sku_items.map((sku_item) => ({
        RFID: sku_item.RFID,
        SKUId: sku_item.SKUId,
        DateOfStock: sku_item.DateOfStock,
      }));
      return sku_items_DTO;
    } else {
      throw 500;
    }
  };

  getSkuItemByRFID = async (rfid) => {
    const sku_item = await this.dao.getSkuItemByRFID(rfid);
    if (sku_item) {
      let sku_item_DTO = {
        RFID: sku_item.RFID,
        SKUId: sku_item.SKUId,
        Available: sku_item.available,
        DateOfStock: sku_item.DateOfStock,
      };
      return sku_item_DTO;
    } else {
      throw 404;
    }
  };

  newSkuItem = async (RFID, SKUId, DateOfStock) => {
    const sku = await sku_dao.getSkuById(SKUId);
    if (!sku) {
      throw 404;
    }
    const sku_item = await this.dao.newSkuItem(RFID, SKUId, DateOfStock);
    if (sku_item === undefined) {
      throw 503;
    } else {
      return 201;
    }
  };

  updateSkuItem = async (rfid, newRFID, newAvailable, newDateOfStock) => {
    const currentSkuItem = await this.dao.getSkuItemByRFID(rfid);
    if (!currentSkuItem) {
      throw 404;
    }

    try {
      await this.dao.getSkuItemByRFID(newRFID);
    } catch (err) {
      if (err === 422) {
        throw 422;
      }
    }

    if (newAvailable != 0 && newAvailable != 1) {
      throw 422;
    }

    const updatedSkuItem = await this.dao.updateSkuItem(
      rfid,
      newRFID,
      newAvailable,
      newDateOfStock
    );
    if (updatedSkuItem == 200) {
      return 200;
    } else {
      throw 503;
    }
  };

  deleteSkuItem = async (rfid) => {
    //Delete SkuItem
    try {
      const sku_item = await this.dao.getSkuItemByRFID(rfid);
    } catch (err) {
      if (err == 404) {
        throw 422;
      } else {
        throw err;
      }
    }
    const res = await this.dao.deleteSkuItem(rfid);
    if (res == 204) {
      return 204;
    } else {
      throw 503;
    }
  };
}

module.exports = SkuItemService;
