const product_order_dao = require('../../api/order/product_order_dao');

const productsWithRfid = [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" },
{ "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }];

const products1 = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
{ "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }];
const orderId = 1;
const rfid1 = "12345678901234567890123456789016";

describe('testDao', () => {
    beforeAll(async () => {
        await product_order_dao.deleteProductOrderData();

    });

    testNewProductInternalOrder();
    testNewProductRestockOrder();
    // testGetRfid();
});


async function testNewProductInternalOrder() {
    test('create new product internal order', async () => {

        await product_order_dao.newProductInternalOrder(products1, orderId);

        var res = await product_order_dao.getProductOrderGivenOrderId(orderId);

        expect(Object.keys(res).length).toStrictEqual(2);

        expect(res[0].SKUId).toStrictEqual(products1[0].SKUId);
        expect(res[0].description).toStrictEqual(products1[0].description);
        expect(res[0].qty).toStrictEqual(products1[0].qty);
    });
}

async function testNewProductRestockOrder() {
    test('create new product restock order', async () => {

        await product_order_dao.deleteProductOrderData();

        await product_order_dao.newProductRestockOrder(products1, orderId);

        var res = await product_order_dao.getProductOrderGivenOrderId(orderId);

        expect(Object.keys(res).length).toStrictEqual(2);

        expect(res[0].SKUId).toStrictEqual(products1[0].SKUId);
        expect(res[0].description).toStrictEqual(products1[0].description);
        expect(res[0].qty).toStrictEqual(products1[0].qty);
    });
}

async function testUpdateListOrder() {
    test('update product order ', async () => {

        await product_order_dao.deleteProductOrderData();

        await product_order_dao.newProductRestockOrder(products1, orderId);

        var res = await product_order_dao.updateListOrder(orderId, productsWithRfid[0]);

        expect(res[0].RFID).toStrictEqual(productsWithRfid[0].RFID);
    });
}

async function testGetRfid() {
    test('get rfid from skuId and orderId', async () => {

        await product_order_dao.deleteProductOrderData();
        await product_order_dao.newProductOrder(products1, orderId);

        var res = await product_order_dao.getRFID(orderId, products1[0].SKUId);
        expect(res).toStrictEqual(products1[0].rfid);

    });
}
