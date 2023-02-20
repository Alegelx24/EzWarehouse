const product_order_dao = require('./product_order_dao');
const sku_item_dao = require('../sku_item/sku_item_dao');
const test_result_dao = require('../testResult/testResult_dao');
const item_dao = require('../item/item_dao');

const { json } = require('express');
class RestockOrderService {
  dao;

  constructor(dao) {
    this.dao = dao;
  }

  newRestockOrder = async (issueDate, products, supplierId) => {
    //MISSING CHECK OF 422 ERROR

    const restockOrder = await this.dao.newRestockOrder(issueDate, supplierId);
    const newProductList = await product_order_dao.newProductRestockOrder(
      products,
      restockOrder
    );
    let invalidBody = true;
    const itemsList = await item_dao.getItems();
    for (var i = 0; i < products.length; i++) {
      for (var j = 0; j < itemsList.length; j++) {
        if (
          products[i].itemId == itemsList[j].id &&
          products[i].SKUId == itemsList[j].SKUId &&
          supplierId == itemsList[j].supplierId
        )
          invalidBody = false;
      }
    }
    if (restockOrder === undefined) {
      return 503;
    }
    if (invalidBody == true) {
      return 422;
    } else {
      return 201;
    }
  };

  async getAllRestockOrders() {
    //OK
    const restockOrders = await this.dao.getAllRestockOrders();
    for (var i = 0; i < restockOrders.length; i++) {
      const productList = await product_order_dao.getProductOrderGivenOrderId(
        restockOrders[i].id
      );
      restockOrders[i].products = productList;
      let skuItemsList = {};
      if (
        restockOrders[i].state != "ISSUED" &&
        restockOrders[i].state != "DELIVERY"
      )
        skuItemsList = await sku_item_dao.getSkuItemsOfRestockOrder(
          restockOrders[i].id
        );

      restockOrders[i].skuItems = skuItemsList;
      if (restockOrders[i].state == "ISSUED")
        delete restockOrders[i].transportNote;
    }
    return restockOrders;
  }

  async getIssuedRestockOrders() {
    //OK

    const restockOrders = await this.dao.getIssuedRestockOrders();
    for (var i = 0; i < restockOrders.length; i++) {
      const productList = await product_order_dao.getProductOrderGivenOrderId(
        restockOrders[i].id
      );
      restockOrders[i].products = productList;
      let skuItems = [];
      restockOrders[i].skuItems = skuItems;
    }
    return restockOrders;
  }

  async getRestockOrder(id) {
    //OK
    if (id === undefined || !parseInt(id)) {
      return 422;
    }
    const restockOrder = await this.dao.getRestockOrderById(id);
    if (restockOrder === undefined) {
      return 404;
    }
    const productList = await product_order_dao.getProductOrderGivenOrderId(
      restockOrder.id
    );
    restockOrder.products = productList;
    let skuItemsList = {};
    skuItemsList = await sku_item_dao.getSkuItemsOfRestockOrder(id);
    restockOrder.skuItems = skuItemsList;

    delete restockOrder.id;
    return restockOrder;
  }

  //OK
  async getReturnItemsRestockOrder(id) {
    const order = await this.dao.getRestockOrderById(id);
    if (order === undefined) return 404;
    else if (order.state != "COMPLETEDRETURN") return 422;
    else {
      const skuItems = await sku_item_dao.getSkuItemsOfRestockOrder(id);
      let skuItemsReturnList = [];
      for (var i = 0; i < skuItems.length; i++) {
        const skuItemsTestResults = await test_result_dao.getTestResults(
          skuItems[i].RFID
        );
        let result = {};
        let isToReturn = 0;
        for (var j = 0; j < skuItemsTestResults.length; j++) {
          if (!skuItemsTestResults[j].result == false) {
            isToReturn = true;
          }
        }
        if (isToReturn) {
          result.SKUId = skuItems[i].SKUId;
          result.itemId = skuItems[i].itemId;
          result.rfid = skuItems[i].RFID;
          skuItemsReturnList.push(result);
        }
      }

      return skuItemsReturnList;
    }
  }

  async modifyRestockOrderState(id, state) {
    //OK
    const order = await this.dao.getRestockOrderById(id);
    if (order === undefined) return 404;
    else {
      const res = await this.dao.updateStateOrder(id, state);
      return;
    }
  }

  //OK
  async addSkuItemsToRestockOrder(id, skuItems) {
    const order = await this.dao.getRestockOrderById(id);
    if (skuItems == undefined) return 422;
    if (order === undefined) {
      return 404;
    } else if (order.state !== "DELIVERED") {
      return 422;
    } else {
      for (var i = 0; i < skuItems.length; i++) {
        await sku_item_dao.updateOrderIdSkuItem(
          id,
          skuItems[i].itemId,
          skuItems[i].rfid
        );
      }
      return;
    }
  }

  async addTransportNoteToRestockOrder(id, transportNote) {
    //OK

    const order = await this.dao.getRestockOrderById(id);
    const deliveryDate = new Date(transportNote.deliveryDate);
    let issueDate;
    if (order !== undefined) issueDate = new Date(order.issueDate);
    if (order == undefined) {
      return 404;
    } else if (order.state != "DELIVERY" || issueDate > deliveryDate) {
      return 422;
    } else {
      await this.dao.addTransportNoteToOrder(id, JSON.stringify(transportNote));
      return;
    }
  }

  async deleteOrder(id) {
    //OK
    const order = await this.dao.getRestockOrderById(id);
    if (order === undefined) return 422;
    await this.dao.deleteOrder(id);
    return;
  }
}

module.exports = RestockOrderService;