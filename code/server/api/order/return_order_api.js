"use strict";

const status_messages = require("../../status_messages");

const ReturnOrderService = require("./return_order_service");
const return_order_dao = require("./return_oder_dao");
const return_order_service = new ReturnOrderService(return_order_dao);

const { check, validationResult } = require("express-validator");

module.exports = function (app) {

    //-------------------- GET --------------------------//
    app.get('/api/returnOrders', async (req, res) => {
        try {
            const return_orders = await return_order_service.getReturnOrders()
            if (return_orders == 500) {
                return res.status(500).json(status_messages[500]);
            }
            else {
                return res.status(200).json(return_orders);
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(status_messages[500]);
        }
    })

    app.get('/api/returnOrders/:id', check("id").exists({checkNull: true}).isInt(), async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.error(errors);
                return res.status(422).json(status_messages[422]);
            }
            const return_order = await return_order_service.getReturnOrderById(req.params.id);
            if (return_order === undefined) {
                return res.status(404).json(status_messages[404]);
            }
            else {
                return res.status(200).json(return_order);
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(status_messages[500]);
        }
    })

    //----------------- POST ----------------------------//

    app.post('/api/returnOrder',
        check("returnDate").exists({checkNull: true}).custom((value) => {
            if (value != null) {
                let timestamp = Date.parse(value);
                if (isNaN(timestamp)) {
                    throw new Error("Invalid Date format");
                }
            }
            return true;
        }),
        check("restockOrderId").exists({checkNull: true}).isInt(),
        check("products").exists({checkNull: true}),
        check("products.*.SKUId").isInt(),
        check("products.*.itemId").isInt(),
        check("products.*.description").isString(),
        check("products.*.price").isFloat(),
        check("products.*.RFID").isInt(),
        async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    console.error(errors);
                    return res.status(422).json(status_messages[422]);
                }
                const return_value = await return_order_service.newReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderId);
                return res.status(return_value).json(status_messages[return_value]);
            }
            catch {
                return res.status(503).json(status_messages[503]);
            }
        })

    //--------------- DELETE ---------------------------//

    app.delete('/api/returnOrder/:id', check("id").exists({checkNull: true}).isInt(), async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.error(errors);
                return res.status(422).json(status_messages[422]);
            }
            await return_order_service.deleteReturnOrder(req.params.id);
            return res.status(204).json(status_messages[204]);
        }
        catch {
            return res.status(503).json(status_messages[503]);
        }
    })


}