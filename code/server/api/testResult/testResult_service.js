const skuItem_dao = require ("../sku_item/sku_item_dao");
const testDescriptor_dao = require("../testDescriptor/testDescriptor_dao");

class TestResultService {
  dao;

  constructor(dao) {
    this.dao = dao;
  }

  newTestResult = async (rfid, testDescriptorId, date, result) => {
    const td = await testDescriptor_dao.getSpecificTD(testDescriptorId);
    try {
      const skuItem = await skuItem_dao.getSkuItemByRFID(rfid);
    } catch (err) {
      if (err === 404) {
        return 404;
      }
    }

    if (td === undefined) {
      return 404;
    }
    await this.dao.newTestResult(rfid, testDescriptorId, date, result);
    return;
  };

  getTestResults = async (rfid) => {
    try {
      const skuItem = await skuItem_dao.getSkuItemByRFID(rfid);
    } catch (err) {
      if (err === 404) {
        return 404;
      }
    }

    const tr = await this.dao.getTestResults(rfid);

    return tr;
  };

  getSpecificTR = async (rfid, id) => {
    const skuItem = await skuItem_dao.getSkuItemByRFID(rfid);
    if (skuItem === 404) {
      return 404;
    }

    const tr0 = await this.dao.getTestResult(id);
    if (tr0 == undefined) {
      return 404;
    }
    const tr = await this.dao.getSpecificTR(rfid, id);
    return tr;
  };

  updateTestResult = async (
    rfid,
    id,
    newTestDescriptorId,
    newDate,
    newResult
  ) => {
    try {
      const skuItem = await skuItem_dao.getSkuItemByRFID(rfid);
    } catch (err) {
      if (err === 404) {
        return 404;
      }
    }

    const td = await testDescriptor_dao.getSpecificTD(newTestDescriptorId);
    if (td === undefined) {
      return 404;
    }

    const tr = await this.dao.getSpecificTR(rfid, id);
    if (tr === undefined) {
      return 404;
    }

    await this.dao.updateTestResult(
      rfid,
      id,
      newTestDescriptorId,
      newDate,
      newResult
    );
    return;
  };

  deleteTestResult = async (rfid, id) => {

    await this.dao.deleteTestResult(rfid, id);
    return;
  };
}

module.exports = TestResultService;
