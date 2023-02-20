global.assert = require("assert");

const sku_dao = require("../api/sku/sku_dao");
const position_dao = require("../api/position/position_dao");
const sku_item_dao = require("../api/sku_item/sku_item_dao");
const testDescriptor_dao = require("../api/testDescriptor/testDescriptor_dao");
const testResult_dao = require("../api/testResult/testResult_dao");
const item_dao = require("../api/item/item_dao");
const order_dao = require("../api/order/order_dao");
const product_order_dao = require("../api/order/product_order_dao");
const DatabaseHelper = require("../database/DatabaseHelper");

// setup
before(() => {
  new DatabaseHelper();
  sku_dao.deleteSkuData();
  sku_item_dao.deleteSkuItemData();
  position_dao.deletePositionData();
  testDescriptor_dao.deleteTestDescriptorData();
  testResult_dao.deleteTestResultData();
  item_dao.deleteItemData();
  order_dao.deleteOrderData();
  product_order_dao.deleteProductOrderData();
});

// teardown
after(() => {
  sku_dao.deleteSkuData();
  sku_item_dao.deleteSkuItemData();
  position_dao.deletePositionData();
  testDescriptor_dao.deleteTestDescriptorData();
  testResult_dao.deleteTestResultData();
  item_dao.deleteItemData();
  order_dao.deleteOrderData();
  product_order_dao.deleteProductOrderData();
});
