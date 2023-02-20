const RestockOrderService = require("../../api/order/restock_order_service");
const restock_order_dao = require("../../api/order/order_dao");
const restock_order_service = new RestockOrderService(restock_order_dao);
const product_order_dao = require("../../api/order/product_order_dao");
const sku_item_dao = require("../../api/sku_item/sku_item_dao");

const issueDate1 = "2021/11/29 09:32";
const products1 = [{"SKUId":12,"itemId":10,"description":"a product","price":10.99,"qty":30},
{"SKUId":180,"itemId":18,"description":"another product","price":11.99,"qty":20}]
;
const supplierId1 = 1;
const newState1 = "ISSUED";
const issueDate2 = "2021/11/20 00:00";
const products2 = [
  { SKUId: 12, itemId: 10, description: "a product", price: 10.99, qty: 3 },
  {
    SKUId: 180,
    itemId: 10,
    description: "another product",
    price: 11.99,
    qty: 3,
  },
];
const supplierId2 = 2;
const newState2 = "ACCEPTED";

const transportNote = { transportNote: { deliveryDate: "2022/12/25" } };
const skuItems = [
  { SKUId: 12, itemId: 10, rfid: "12345678901234567890123456789016" },
  { SKUId: 12, itemId: 10, rfid: "12345678901234567890123456789017" },
];

describe("Test restock order service", () => {
  beforeAll(async () => {
    await restock_order_dao.deleteOrderData();
  });

  testNewRestockOrder();
  testGetAllRestockOrders();
  testGetAllRestockIssuedOrders();
  testGetRestockOrder();
  testUpdateStateOrder();
  testAddTransportNote();
  testAddSkuItems();
  testDeleteOrder();
});

async function testNewRestockOrder() {
  test("create new restock order", async () => {
    await restock_order_service.newRestockOrder(
      issueDate1,
      products1,
      supplierId1
    );
    var res = await restock_order_service.getAllRestockOrders();

    expect(res.length).toStrictEqual(1);

    res = await restock_order_service.getRestockOrder(res[0].id);

    expect(res.issueDate).toStrictEqual(issueDate1);
    expect(res.supplierId).toStrictEqual(supplierId1);
    expect(JSON.stringify(res.products)).toStrictEqual(
      JSON.stringify(products1)
    );
  });
}

async function testGetAllRestockOrders() {
  try {
    await test("get all restock orders", async () => {
      await restock_order_dao.deleteOrderData();

      await restock_order_service.newRestockOrder(
        issueDate1,
        products1,
        supplierId1
      );
      await restock_order_service.newRestockOrder(
        issueDate2,
        products2,
        supplierId2
      );

      var res = await restock_order_service.getAllRestockOrders();

      expect(res.length).toStrictEqual(2);

      for (var i = 1; i < res.length + 1; i++) {
        expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
        expect(res[i - 1].supplierId).toStrictEqual(eval("supplierId" + i));
        expect(JSON.stringify(res[i - 1].products)).toStrictEqual(
          JSON.stringify(eval("products" + i))
        );
      }
    });
  } catch (err) {
    console.log(err);
  }
}



async function testGetAllRestockIssuedOrders() {
    await test('get all restock issued orders', async () => {

        await restock_order_dao.deleteOrderData();

        await restock_order_service.newRestockOrder(issueDate1, products1, supplierId1);
        await restock_order_service.newRestockOrder(issueDate2, products2, supplierId2);

        var res = await restock_order_service.getIssuedRestockOrders();

        expect((res).length).toStrictEqual(2);

        for (var i = 1; i < (res).length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].supplierId).toStrictEqual(eval("supplierId" + i));
            expect(JSON.stringify(res[i - 1].products)).toStrictEqual(JSON.stringify(eval("products" + i)));
            expect(res[i - 1].state).toStrictEqual("ISSUED");
        }


    });
}

async function testGetRestockOrder() {
    await test('get restock order given id', async () => {

        await restock_order_dao.deleteOrderData();
        var orderId = await restock_order_service.newRestockOrder(issueDate1, products1, supplierId1);
        var resList = await restock_order_service.getAllRestockOrders();

        expect(Object.keys(resList).length).toStrictEqual(1);
        expect(resList[0].issueDate).toStrictEqual(issueDate1);
        expect(resList[0].supplierId).toStrictEqual(supplierId1);
        expect(resList[0].state).toStrictEqual("ISSUED");
        expect(JSON.stringify(resList[0].products)).toStrictEqual(JSON.stringify(products1));

    });
}

async function testUpdateStateOrder() {
    await test('update state of an existing order', async () => {

        await restock_order_dao.deleteOrderData();
        await restock_order_service.newRestockOrder(issueDate1, products1, supplierId1);
        var orderList = await restock_order_service.getAllRestockOrders();

        var res = await restock_order_service.modifyRestockOrderState(orderList[0].id, newState2)
        var updatedOrderList = await restock_order_service.getAllRestockOrders();
        expect(updatedOrderList[0].state).toStrictEqual(newState2);
    });
}

async function testAddTransportNote() {
    await test('test add transport note to an order', async () => {

        await restock_order_dao.deleteOrderData();
        await restock_order_service.newRestockOrder(issueDate1, products1, supplierId1);
        var orderList = await restock_order_service.getAllRestockOrders();
        await restock_order_service.modifyRestockOrderState(orderList[0].id, "DELIVERY")
        await restock_order_service.addTransportNoteToRestockOrder(orderList[0].id, transportNote)
        var updatedOrder = await restock_order_service.getRestockOrder(orderList[0].id);
        expect(JSON.stringify(updatedOrder.transportNote)).toStrictEqual(JSON.stringify(transportNote));

    });
}

async function testAddSkuItems() {
    await test('test add sku items to an order', async () => {

        await restock_order_dao.deleteOrderData();
        await sku_item_dao.deleteSkuItemData();
        await sku_item_dao.newSkuItem("12345678901234567890123456789016", 12, "2021/11/29 12:30");
        await sku_item_dao.newSkuItem("12345678901234567890123456789017", 12, "2021/11/29 12:30");

        await restock_order_service.newRestockOrder(issueDate1, products1, supplierId1);
        var orderList = await restock_order_service.getAllRestockOrders();
        await restock_order_service.modifyRestockOrderState(orderList[0].id, "DELIVERED");
        var newStateList = await restock_order_service.getAllRestockOrders();
        await restock_order_service.addSkuItemsToRestockOrder(newStateList[0].id, skuItems);
        var skuItemList = await sku_item_dao.getAllSkuItems();
        var updatedOrder = await restock_order_service.getAllRestockOrders();

        expect(JSON.stringify(updatedOrder[0].skuItems)).toStrictEqual(JSON.stringify(skuItems));

    });
}

async function testDeleteOrder() {
    await test('Delete a restock order from the db', async () => {

        await restock_order_dao.deleteOrderData();
        await restock_order_service.newRestockOrder(issueDate1, products1, supplierId1);
        var orderList = await restock_order_service.getAllRestockOrders();
        expect(Object.keys(orderList).length).toStrictEqual(1);
        await restock_order_dao.deleteOrder(orderList[0].id);
        orderList = await restock_order_service.getAllRestockOrders();
        expect(Object.keys(orderList).length).toStrictEqual(0);
    });
}
