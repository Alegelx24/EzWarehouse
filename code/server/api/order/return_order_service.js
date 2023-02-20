const product_order_dao = require('./product_order_dao');
const order_dao = require('./order_dao');

class ReturnOrderService {
    dao;
    constructor(dao) {
        this.dao = dao;
    }

    newReturnOrder = async (returnDate, products, restock_order_id) => {
        if ((await order_dao.getRestockOrderById(restock_order_id)) === undefined) {
            return 404;
        }
        let new_return_order = await order_dao.newReturnOrder(returnDate);
        if (new_return_order === undefined) {
            return 503;
        }
        for (var i = 0; i < products.length; i++) {
            let id = await product_order_dao.newProductOrder(products[i], new_return_order);
            if (id == undefined) {
                return 503;
            }
        }
        new_return_order = await this.dao.newReturnOrder(new_return_order, restock_order_id);
        if (new_return_order === undefined) {
            return 503;
        } else {
            return 201;
        }
    }

    getReturnOrders = async () => {
        let return_orders = await this.dao.getReturnOrders();
        if (return_orders === undefined) {
            return 500;
        }
        for (var i = 0; i < return_orders.length; i++) {
            return_orders[i].returnDate = (await order_dao.getOrderById(return_orders[i].id)).returnDate;
            return_orders[i].products = await product_order_dao.getProductReturnOrdersGivenOrderId(return_orders[i].id);
        }
        return return_orders;
    }

    getReturnOrderById = async (return_order_id) => {  
        try {
            let return_order = await this.dao.getReturnOrderById(return_order_id);
            if (return_order !== undefined) {
                return_order.returnDate = (await order_dao.getOrderById(return_order_id)).returnDate;
                return_order.products = await product_order_dao.getProductReturnOrdersGivenOrderId(return_order_id);
                return return_order;
            }
            else {
                return return_order;
            }
        }catch (err) {console.log(err)}
    }

    deleteReturnOrder = async (return_order_id) => {
        try {
            await this.dao.deleteReturnOrder(return_order_id);
            await order_dao.deleteOrder(return_order_id);
            await product_order_dao.deleteProductOrderByOrderId(return_order_id);
        }
        catch (err) { console.log(err) }
    }
}

module.exports = ReturnOrderService;