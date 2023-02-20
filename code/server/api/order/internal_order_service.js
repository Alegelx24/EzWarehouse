const product_order_dao = require('./product_order_dao');

class InternalOrderService {
    dao;

    constructor(dao) {
        this.dao = dao;
    }

    newInternalOrder = async (issueDate, products, customerId) => {

        const internalOrder = await this.dao.newInternalOrder(issueDate, customerId);
        const newProductList = await product_order_dao.newProductInternalOrder(products, internalOrder);
        if (internalOrder === undefined || newProductList === undefined) {
            return 503;
        } else {
            return 201;
        }
    }

    async getAllInternalOrders() {

        const internalOrders = await this.dao.getAllInternalOrders();
        for (var i = 0; i < internalOrders.length; i++) {
            const productList = await product_order_dao.getProductInternalOrderGivenOrderId(internalOrders[i].id);
            internalOrders[i].products = productList;
        }
        return internalOrders;
    }

    async getIssuedInternalOrders() {

        const internalOrders = await this.dao.getIssuedInternalOrders();
        for (var i = 0; i < internalOrders.length; i++) {
            const productList = await product_order_dao.getProductInternalOrderGivenOrderId(internalOrders[i].id);
            internalOrders[i].products = productList;
        }
        return internalOrders;
    }

    async getAcceptedInternalOrders() {

        const internalOrders = await this.dao.getAcceptedInternalOrders();
        for (var i = 0; i < internalOrders.length; i++) {
            const productList = await product_order_dao.getProductInternalOrderGivenOrderId(internalOrders[i].id);
            internalOrders[i].products = productList;
        }
        return internalOrders;

    }

    async getInternalOrder(id) {

        if (id === undefined || !parseInt(id)) {
            return 422;
        }
        const internalOrder = await this.dao.getInternalOrder(id);
        if (internalOrder === undefined) {
            return 404;
        } else {
            const productList = await product_order_dao.getProductInternalOrderGivenOrderId(internalOrder.id);
            internalOrder.products = productList;
        }
        return internalOrder;
    }

    async updateStateOrder(id, newState, products) {
        const order = await this.dao.getInternalOrder(id);
        if (order === undefined)
            return 404;
        else {
            const result = await this.dao.updateStateOrder(id, newState);
            if (newState == 'COMPLETED') {
                for (var i = 0; i < products.length; i++) {
                    const isRfidNull = await product_order_dao.getRFID(id, products[i]);

                    if (isRfidNull == undefined) {
                        await product_order_dao.updateListOrder(id, products[i]);
                    }
                    else {
                        const orderToDuplicate = await product_order_dao.getProductOrderGivenOrderIdAndSkuId(id, products[i].Skuid);
                        orderToDuplicate.rfid = products[i].RFID;
                        const result = await product_order_dao.newProductOrder(orderToDuplicate, id);
                    }
                }
                return;
            }
        }
    }

    async deleteOrder(id) {
        const order = await this.dao.getInternalOrder(id);
        if (order === undefined)
            return 422;
        else {
            await this.dao.deleteOrder(id);
            return;
        }
    }
}

module.exports = InternalOrderService;