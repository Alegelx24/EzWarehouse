const InternalOrderService = require("../../api/order/internal_order_service");
const internal_order_dao = require("../../api/order/order_dao");
const internal_order_service = new InternalOrderService(internal_order_dao);

const product_order_dao = require("../../api/order/product_order_dao");



const issueDate1 = "2021/11/29 09:32";
const products1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }];
const customerId1 = 1;
const newState1 = "ISSUED";
const issueDate2 = "2021/11/20 00:00";
const products2 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }];
const customerId2 = 2;
const newState2 = "ACCEPTED";

describe("Test internal order service", () => {
    beforeAll(async () => {
        await internal_order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
    });

    testNewInternalOrder();
    testGetAllInternalOrders();
    testGetAllInternalIssuedOrders();
    testGetAllInternalAcceptedOrders();
    testUpdateStateOrder();
    testGetInternalOrder();
    testDeleteOrder();
});



async function testNewInternalOrder() {
    test('create new internal order', async () => {

        await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);
        var res = await internal_order_service.getAllInternalOrders();

        expect(res.length).toStrictEqual(1);

        res = await internal_order_service.getInternalOrder(res[0].id);

        expect(res.issueDate).toStrictEqual(issueDate1);
        expect(res.customerId).toStrictEqual(customerId1);
        expect(JSON.stringify(res.products)).toStrictEqual(JSON.stringify(products1));
    });
}


async function testGetAllInternalOrders() {
    test('get all internal orders', async () => {

        await internal_order_dao.deleteOrderData();

        await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);
        await internal_order_service.newInternalOrder(issueDate2, products2, customerId2);

        var res = await internal_order_service.getAllInternalOrders();

        expect(Object.keys(res).length).toStrictEqual(2);

        for (var i = 1; i < Object.keys(res).length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].customerId).toStrictEqual(eval("customerId" + i));
            expect(JSON.stringify(res[i - 1].products)).toStrictEqual(JSON.stringify(eval("products" + i)));
        }
    });
}


async function testGetAllInternalIssuedOrders() {
    test('get all internal issued orders', async () => {

        await internal_order_dao.deleteOrderData();

        await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);
        await internal_order_service.newInternalOrder(issueDate2, products2, customerId2);

        var res = await internal_order_service.getIssuedInternalOrders();

        expect(Object.keys(res).length).toStrictEqual(2);

        for (var i = 1; i < Object.keys(res).length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].customerId).toStrictEqual(eval("customerId" + i));
            expect(JSON.stringify(res[i - 1].products)).toStrictEqual(JSON.stringify(eval("products" + i)));
            expect(res[i - 1].state).toStrictEqual("ISSUED");
        }


    });
}

async function testUpdateStateOrder() {
    test('update state of an existing order', async () => {

        await internal_order_dao.deleteOrderData();
        await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);
        var orderList = await internal_order_service.getAllInternalOrders();

        var res = await internal_order_service.updateStateOrder(orderList[0].id, newState2, products2)
        var updatedOrderList = await internal_order_service.getAllInternalOrders();
        expect(updatedOrderList[0].state).toStrictEqual(newState2);
        expect(JSON.stringify(updatedOrderList[0].products)).toStrictEqual(JSON.stringify(products2))
    });
}

async function testGetAllInternalAcceptedOrders() {
    test('get all internal accepted orders', async () => {

        await internal_order_dao.deleteOrderData();

        await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);
        await internal_order_service.newInternalOrder(issueDate2, products2, customerId2);
        var orderList = await internal_order_service.getAllInternalOrders();
        await internal_order_service.updateStateOrder(orderList[0].id, "ACCEPTED", products2);
        await internal_order_service.updateStateOrder(orderList[1].id, "ACCEPTED", products2);

        var res = await internal_order_service.getAcceptedInternalOrders();

        expect(Object.keys(res).length).toStrictEqual(2);

        for (var i = 1; i < Object.keys(res).length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].customerId).toStrictEqual(eval("customerId" + i));
            expect(JSON.stringify(res[i - 1].products)).toStrictEqual(JSON.stringify(eval("products" + i)));
            expect(res[i - 1].state).toStrictEqual("ACCEPTED");
        }
    });
}

async function testGetInternalOrder() {
    test('get internal order given id', async () => {

        await internal_order_dao.deleteOrderData();

        var orderId = await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);

        var resList = await internal_order_service.getAllInternalOrders();

        expect(Object.keys(resList).length).toStrictEqual(1);

        expect(resList[0].issueDate).toStrictEqual(issueDate1);
        expect(resList[0].customerId).toStrictEqual(customerId1);
        expect(resList[0].state).toStrictEqual("ISSUED");
        expect(JSON.stringify(resList[0].products)).toStrictEqual(JSON.stringify(products1));

    });
}

async function testDeleteOrder() {
    test('Delete an internal order from the db', async () => {

        await internal_order_dao.deleteOrderData();
        await internal_order_service.newInternalOrder(issueDate1, products1, customerId1);
        var orderList = await internal_order_service.getAllInternalOrders();
        expect(Object.keys(orderList).length).toStrictEqual(1);
        await internal_order_dao.deleteOrder(orderList[0].id);
        orderList = await internal_order_service.getAllInternalOrders();
        expect(Object.keys(orderList).length).toStrictEqual(0);


    });
}