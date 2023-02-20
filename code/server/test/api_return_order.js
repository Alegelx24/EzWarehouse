const chai = require('chai');
const chaiHttp = require('chai-http');

const order_dao = require('../api/order/order_dao');
const return_order_dao = require('../api/order/return_oder_dao');
const product_order_dao = require('../api/order/product_order_dao');
const ReturnOrderService = require('../api/order/return_order_service');
const return_order_service = new ReturnOrderService(return_order_dao);

chai.use(chaiHttp);
chai.should();

const app = require('../server');
const { should } = require("chai");
var agent = chai.request.agent(app);

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


describe ('ReturnOrder - POST /api/returnOrder', function () {
    this.beforeAll(async () => {
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
    testNewReturnOrder(return_order1, 201, 'Testing creation of new return order.');
    this.afterAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
    })
});

describe('ReturnOrder - GET /api/returnOrders', function () {
    this.beforeAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
        restock_order1.id = await order_dao.newRestockOrder(restock_order1.issueDate, restock_order1.supplierId);
        restock_order2.id = await order_dao.newRestockOrder(restock_order2.issueDate, restock_order2.supplierId);
        await product_order_dao.newProductRestockOrder(restock_order1.products, restock_order1.id);
        await product_order_dao.newProductRestockOrder(restock_order2.products, restock_order2.id);
        return_order1.restockOrderId = restock_order1.id;
        return_order2.restockOrderId = restock_order2.id;
        await return_order_service.newReturnOrder(return_order1.returnDate, return_order1.products, return_order1.restockOrderId);
        await return_order_service.newReturnOrder(return_order2.returnDate, return_order2.products, return_order2.restockOrderId);
    })
    let expected_body = [return_order1,return_order2];
    testGetAllReturnOrders(expected_body, 200, 'Testing getting all return orders.');
    this.afterAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
    })
})

describe('ReturnOrder - GET /api/returnOrders/:id', function () {
    this.beforeAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
        restock_order1.id = await order_dao.newRestockOrder(restock_order1.issueDate, restock_order1.supplierId);
        restock_order2.id = await order_dao.newRestockOrder(restock_order2.issueDate, restock_order2.supplierId);
        await product_order_dao.newProductRestockOrder(restock_order1.products, restock_order1.id);
        await product_order_dao.newProductRestockOrder(restock_order2.products, restock_order2.id);
        return_order1.restockOrderId = restock_order1.id;
        return_order2.restockOrderId = restock_order2.id;
        await return_order_service.newReturnOrder(return_order1.returnDate, return_order1.products, return_order1.restockOrderId);
        await return_order_service.newReturnOrder(return_order2.returnDate, return_order2.products, return_order2.restockOrderId);
        id = (await return_order_service.getReturnOrders())[0].id
    })
    let expected_body = return_order1;
    testGetReturnOrderById(200, 'Testing getting return order by id.');
    this.afterAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
    })
})


describe('ReturnOrder - DELETE /api/returnOrders/:id', function () {
    this.beforeAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
        restock_order1.id = await order_dao.newRestockOrder(restock_order1.issueDate, restock_order1.supplierId);
        restock_order2.id = await order_dao.newRestockOrder(restock_order2.issueDate, restock_order2.supplierId);
        await product_order_dao.newProductRestockOrder(restock_order1.products, restock_order1.id);
        await product_order_dao.newProductRestockOrder(restock_order2.products, restock_order2.id);
        let return_order1 = {
            returnDate:"2022/01/29 09:33",
            products: [{"SKUId":876,"description":"Shirts","price":15.45,"RFID":"89945678901234567878965456789016"},
                        {"SKUId":156,"description":"Hats","price":4.99,"RFID":"24345678901234567890123456789038"}],
            restockOrderId : restock_order1.id
        }
        let return_order2 = {
            returnDate: "2022/01/12 11:33",
            products: [{"SKUId":127,"description":"Socks","price":10.99,"RFID":"12345678901234567890123456789016"},
                        {"SKUId":965,"description":"Pants","price":11.99,"RFID":"12345678901234567890123456789038"}],
            restockOrderId : restock_order2.id
        }
        await return_order_service.newReturnOrder(return_order1.returnDate, return_order1.products, return_order1.restockOrderId);
        await return_order_service.newReturnOrder(return_order2.returnDate, return_order2.products, return_order2.restockOrderId);
        id = (await return_order_dao.getReturnOrders())[0].id
    })
    testDeleteReturnOrder(204, 'Testing deleting return order by id.');
    this.afterAll(async () => {
        await order_dao.deleteOrderData();
        await product_order_dao.deleteProductOrderData();
        await return_order_dao.deleteAll();
    })
})

function testDeleteReturnOrder(expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.get('/api/returnOrders').then(function (res) {
            const id = res.body[0].id;
            agent.delete('/api/returnOrder/'+id).then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            })
        })
    })
}

function testGetReturnOrderById(expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.get('/api/returnOrders').then(function (res) {
            const id = res.body[0].id;
            const expected_body = res.body[0];
            agent.get('/api/returnOrders/'+id).then(function (res) {
                JSON.stringify(res.body).should.equal(JSON.stringify(expected_body));
                res.should.have.status(expectedHTTPStatus);
                done();
            })
        })
    })
}

function testGetAllReturnOrders(expected_body, expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.get('/api/returnOrders').then(function (res) {
            (typeof(res.body[0].id) === 'number').should.equal(true); // This is ugly but for some reason I could not make this comparison work in any other way.
            res.body[0].returnDate.should.equal(expected_body[0].returnDate);
            JSON.stringify(res.body[0].products).should.equal(JSON.stringify(expected_body[0].products));
            res.body[0].restockOrderId.should.equal(expected_body[0].restockOrderId);
            res.should.have.status(expectedHTTPStatus);
            
            (typeof(res.body[1].id) === 'number').should.equal(true);
            JSON.stringify(res.body[1].returnDate).should.equal(JSON.stringify(expected_body[1].returnDate));
            JSON.stringify(res.body[1].products).should.equal(JSON.stringify(expected_body[1].products));
            JSON.stringify(res.body[1].restockOrderId).should.equal(JSON.stringify(expected_body[1].restockOrderId));
            done();
        })
    })
}

function testNewReturnOrder(req_body, expectedHTTPStatus, description) {
    it (description, function (done) {
        console.log(req_body);
        agent.post('/api/returnOrder').send(req_body).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
        })
    })
}




