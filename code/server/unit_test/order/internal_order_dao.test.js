const internal_order_dao = require('../../api/order/order_dao');

describe('testDao', () => {
    beforeAll(async () => {
        await internal_order_dao.deleteOrderData();

    });

    test('delete db', async () => {
        var res = await internal_order_dao.deleteOrder(1);
        expect(res).toStrictEqual(undefined);
    });

    testNewInternalOrder("2021/10/22 00:00", 1)
    testGetAllInternalOrder("2022/10/10 9:30", 1, "2021/10/22 00:00", 2)
    testGetAllInternalIssuedOrder("2022/10/10 9:30", 1, "2021/10/22 00:00", 2)
    testUpdateStateOrder("ACCEPTED");
    testGetAllInternalAcceptedOrder("2022/10/10 9:30", 1, "2021/10/22 00:00", 2)
    testGetInternalOrderById("2022/10/10 9:30", 1, "2021/10/22 00:00", 2);
    testDeleteOrder("2022/10/10 9:30", 1, "2021/10/22 00:00", 2)

});


async function testNewInternalOrder(issueDate, customerId) {
    test('create new internal order', async () => {

        await internal_order_dao.newInternalOrder(issueDate, customerId);

        var res = await internal_order_dao.getAllInternalOrders();

        expect(res.length).toStrictEqual(1);

        res = await internal_order_dao.getInternalOrder(res[0].id);

        expect(res.issueDate).toStrictEqual(issueDate);
        expect(res.customerId).toStrictEqual(customerId);
        expect(res.state).toStrictEqual("ISSUED");
    });
}

async function testGetAllInternalOrder(issueDate1, customerId1, issueDate2, customerId2) {
    test('get all internal order', async () => {

        await internal_order_dao.deleteOrderData();
        await internal_order_dao.newInternalOrder(issueDate1, customerId1);
        await internal_order_dao.newInternalOrder(issueDate2, customerId2);

        var res = await internal_order_dao.getAllInternalOrders();
        expect(res.length).toStrictEqual(2);

        for (var i = 1; i < res.length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].customerId).toStrictEqual(eval("customerId" + i));
            expect(res[i - 1].state).toStrictEqual("ISSUED");
        }
    });
}

async function testGetAllInternalIssuedOrder(issueDate1, customerId1, issueDate2, customerId2) {
    test('get all internal order in ISSUED state', async () => {

        await internal_order_dao.deleteOrderData();
        await internal_order_dao.newInternalOrder(issueDate1, customerId1);
        await internal_order_dao.newInternalOrder(issueDate2, customerId2);

        var res = await internal_order_dao.getIssuedInternalOrders();
        expect(res.length).toStrictEqual(2);

        for (var i = 1; i < res.length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].customerId).toStrictEqual(eval("customerId" + i));
            expect(res[i - 1].state).toStrictEqual("ISSUED");
        }
    });
}

async function testUpdateStateOrder(newState) {
    test('update state of an existing order', async () => {

        await internal_order_dao.deleteOrderData();
        var order = await internal_order_dao.newInternalOrder("2021/10/22 00:00", 1);

        var res = await internal_order_dao.updateStateOrder(order, newState)
        var updatedOrder = await internal_order_dao.getInternalOrder(res);

        expect(updatedOrder.state).toStrictEqual(newState)
    });
}


async function testGetAllInternalAcceptedOrder(issueDate1, customerId1, issueDate2, customerId2) {
    test('get all internal order in ACCEPTED state', async () => {

        await internal_order_dao.deleteOrderData();
        var order1Id = await internal_order_dao.newInternalOrder(issueDate1, customerId1);
        var order2Id = await internal_order_dao.newInternalOrder(issueDate2, customerId2);
        var order3Id = await internal_order_dao.newInternalOrder(issueDate2, customerId2);

        await internal_order_dao.updateStateOrder(order1Id, "ACCEPTED");
        await internal_order_dao.updateStateOrder(order2Id, "ACCEPTED")
        //Order 3 is still in ISSUED state

        var res = await internal_order_dao.getAcceptedInternalOrders();
        expect(res.length).toStrictEqual(2);

        for (var i = 1; i < res.length + 1; i++) {
            expect(res[i - 1].issueDate).toStrictEqual(eval("issueDate" + i));
            expect(res[i - 1].customerId).toStrictEqual(eval("customerId" + i));
            expect(res[i - 1].state).toStrictEqual("ACCEPTED");
        }
    });
}


async function testGetInternalOrderById(issueDate1, customerId1) {
    test('get internal order given id', async () => {

        await internal_order_dao.deleteOrderData();
        var orderId = await internal_order_dao.newInternalOrder(issueDate1, customerId1);

        var orderUpdated = await internal_order_dao.updateStateOrder(orderId, "ACCEPTED")
        var res = await internal_order_dao.getInternalOrder(orderUpdated);

        expect(res.issueDate).toStrictEqual(issueDate1);
        expect(res.customerId).toStrictEqual(customerId1);
        expect(res.state).toStrictEqual("ACCEPTED");
    });
}

async function testDeleteOrder(issueDate1, customerId1) {
    test('delete an internal order from the db', async () => {

        await internal_order_dao.deleteOrderData();
        var orderId = await internal_order_dao.newInternalOrder(issueDate1, customerId1);
        await internal_order_dao.deleteOrder(orderId);
        var res = await internal_order_dao.getAllInternalOrders();
        expect(res.length).toStrictEqual(0);

    });
}



