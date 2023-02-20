const restock_order_dao = require('../../api/order/order_dao');

describe('testDao', () => {
    beforeAll(async () => {
        await restock_order_dao.deleteOrderData();
    });


    testNewRestockOrder("2021/10/22 00:00",1);
    testGetAllRestockOrder("2022/10/10 9:30",1,"2021/10/22 00:00",2);
    testGetAllRestockIssuedOrder("2022/10/10 9:30",1,"2021/10/22 00:00",2);
    testGetRestockOrderById("2022/10/10 9:30",1,"2021/10/22 00:00",2);
    testAddTransportNote( `{"transportNote":{"deliveryDate":"2021/12/29"}}`);

});


async function testNewRestockOrder(issueDate, supplierId) {
    test('create new restock order', async () => {
        
        await restock_order_dao.deleteOrderData();
        await restock_order_dao.newRestockOrder(issueDate, supplierId);
        var res = await restock_order_dao.getAllRestockOrders();
        expect(res.length).toStrictEqual(1);
        
        res = await restock_order_dao.getRestockOrderById(res[0].id);

        expect(res.issueDate).toStrictEqual(issueDate);
        expect(res.supplierId).toStrictEqual(supplierId);
        expect(res.state).toStrictEqual("ISSUED");
    });
}

async function testGetAllRestockOrder(issueDate1, supplierId1, issueDate2, supplierId2) {
    test('get all restock order', async () => {
        
        await restock_order_dao.deleteOrderData();
        await restock_order_dao.newRestockOrder(issueDate1, supplierId1);
        await restock_order_dao.newRestockOrder(issueDate2, supplierId2);

        var res = await restock_order_dao.getAllRestockOrders();
        expect(res.length).toStrictEqual(2);
        
        for(var i=1; i< res.length+1; i++){
            expect(res[i-1].issueDate).toStrictEqual(eval("issueDate" +i));
            expect(res[i-1].supplierId).toStrictEqual(eval("supplierId" +i));
            expect(res[i-1].state).toStrictEqual("ISSUED");
        }
    });
}

async function testGetAllRestockIssuedOrder(issueDate1, supplierId1, issueDate2, supplierId2) {
    test('get all restock order in ISSUED state', async () => {
        
        await restock_order_dao.deleteOrderData();
        await restock_order_dao.newRestockOrder(issueDate1, supplierId1);
        await restock_order_dao.newRestockOrder(issueDate2, supplierId2);
        
        var res = await restock_order_dao.getIssuedRestockOrders();
        expect(res.length).toStrictEqual(2);
        
        for(var i=1; i< res.length+1; i++){
            expect(res[i-1].issueDate).toStrictEqual(eval("issueDate" +i));
            expect(res[i-1].supplierId).toStrictEqual(eval("supplierId" +i));
            expect(res[i-1].state).toStrictEqual("ISSUED");
        }
    });
}


async function testGetRestockOrderById(issueDate1, supplierId1) {
    test('get restock order given id', async () => {
        
        await restock_order_dao.deleteOrderData();
        var orderId = await restock_order_dao.newRestockOrder(issueDate1,supplierId1);

        var orderUpdated = await restock_order_dao.updateStateOrder(orderId, "ACCEPTED")
        var res = await restock_order_dao.getRestockOrderById(orderUpdated);
        
            expect(res.issueDate).toStrictEqual(issueDate1);
            expect(res.supplierId).toStrictEqual(supplierId1);
            expect(res.state).toStrictEqual("ACCEPTED");
    });
}


async function testAddTransportNote(transportNote){
    test('add transport note to a restock order given id', async () => {
        
        await restock_order_dao.deleteOrderData();
        var order = await restock_order_dao.newRestockOrder("2021/10/22 00:00",1);

        var res = await restock_order_dao.addTransportNoteToOrder(order, transportNote);
        var updatedOrder = await restock_order_dao.getRestockOrderById(res);

        expect(updatedOrder.transportNote).toStrictEqual(JSON.parse(transportNote)) ;
    });
}

