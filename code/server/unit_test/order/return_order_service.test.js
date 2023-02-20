const { createTestScheduler } = require('jest');
const ReturnOrderService = require('../../api/order/return_order_service');
const product_order_dao = require('../../api/order/product_order_dao');
const return_order_dao = require('../../api/order/return_oder_dao');
const order_dao = require('../../api/order/order_dao');
const return_order_service = new ReturnOrderService(return_order_dao);

describe('Return test order', () => {
    let return_order1 = {
        returnDate:"2022/01/29 09:33",
        products: [{"SKUId":876, "itemId":10, "description":"Shirts","price":15.45,"RFID":"89945678901234567878965456789016"},
                    {"SKUId":156, "itemId":18, "description":"Hats","price":4.99,"RFID":"24345678901234567890123456789038"}],
        restockOrderId : 1
    }
    
    let return_order2 = {
        returnDate: "2022/01/12 11:33",
        products: [{"SKUId":127, "itemId":10, "description":"Socks","price":10.99,"RFID":"12345678901234567890123456789016"},
                    {"SKUId":965, "itemId":18, "description":"Pants","price":11.99,"RFID":"12345678901234567890123456789038"}],
        restockOrderId : 2
    }
    
    let restock_order1 = {
        issueDate:"2021/11/29 09:33",
        products: [{"SKUId":987, "itemId":10, "description":"a product","price":10.99,"qty":30},
                    {"SKUId":152, "itemId":18, "description":"another product","price":11.99,"qty":20}],
        supplierId : 1
    }
    
    let restock_order2 = {
        issueDate:"2021/11/29 09:33",
        products: [{"SKUId":197, "itemId":10, "description":"a product","price":10.99,"qty":30},
                    {"SKUId":565, "itemId":18, "description":"another product","price":11.99,"qty":20}],
        supplierId : 2
    }

    beforeAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
        restock_order1.id = await order_dao.newRestockOrder(restock_order1.issueDate, restock_order1.supplierId);
        restock_order2.id = await order_dao.newRestockOrder(restock_order2.issueDate, restock_order2.supplierId);
        return_order1.restockOrderId = restock_order1.id;
        return_order2.restockOrderId = restock_order2.id;
        await product_order_dao.newProductRestockOrder(restock_order1.products, restock_order1.id);
        await product_order_dao.newProductRestockOrder(restock_order2.products, restock_order2.id);
    })
    afterAll (async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
    })

    testNewReturnOrder(return_order1, return_order2);
    testGetReturnOrders(return_order1, return_order2);
    testGetReturnOrderById(return_order1);
    testDeleteReturnOrder(return_order1);
})

async function testNewReturnOrder (return_order1, return_order2) {
    test('Test new return order creation.', async () => {
        let res_1 = await return_order_service.newReturnOrder(return_order1.returnDate, return_order1.products, return_order1.restockOrderId);
        let res_2 = await return_order_service.newReturnOrder(return_order2.returnDate, return_order2.products, return_order2.restockOrderId);
        expect(res_1).toEqual(201);
        expect(res_2).toEqual(201);
    });
}

async function testGetReturnOrders(return_order1, return_order2) {
    test('Test get return orders.', async () => {
        let res = await return_order_service.getReturnOrders();
        expect(typeof(res[0].id)).toEqual("number");
        expect(typeof(res[1].id)).toEqual("number");
        expect(res).toEqual([
            {
                id: res[0].id,
                returnDate: return_order1.returnDate,
                products: return_order1.products,
                restockOrderId: return_order1.restockOrderId,
            },
            {
                id: res[1].id,
                returnDate: return_order2.returnDate,
                products: return_order2.products,
                restockOrderId: return_order2.restockOrderId,
            }
        ]);
    });
}

async function testGetReturnOrderById(return_order1) {
    test('Test getting return orders by ID.', async () => {
        let id = (await return_order_service.getReturnOrders())[0].id;
        let res = await return_order_service.getReturnOrderById(id);
        expect(res).toEqual(
            {
                id: id,
                returnDate: return_order1.returnDate,
                products: return_order1.products,
                restockOrderId: return_order1.restockOrderId,
            }
        );
    });
}

async function testDeleteReturnOrder(return_order1) {
    test('Test deleting return orders.', async () => {
        let id = (await return_order_service.getReturnOrders())[0].id;
        let res = await return_order_service.deleteReturnOrder(id)
        expect(res).toEqual(undefined);
    });
}

