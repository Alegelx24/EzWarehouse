"use strict";

const status_messages = require("../../status_messages");

const RestockOrderService = require("./restock_order_service");
const order_dao = require("./order_dao");
const restock_order_service = new RestockOrderService(order_dao);

const { check, validationResult } = require("express-validator");


//------------------------RESTOCK ORDER API------------------------//

//GET all restock order 
module.exports = function (app) {

  app.get("/api/restockOrders", async (req, res) => {
    /*
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const orders = await restock_order_service.getAllRestockOrders();
      if (orders) res.status(200).json(orders);
      else res.status(500).json(status_messages[500]);
    } catch (err) {
      console.error(err);
      res.status(500).json(status_messages[500]);
    }
  });

  //GET all restock issued order 
  app.get("/api/restockOrdersIssued", async (req, res) => {
    /*
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const orders = await restock_order_service.getIssuedRestockOrders();
      if (orders) res.status(200).json(orders);
      else res.status(500).json(status_messages[500]);
    } catch (err) {
      console.error(err);
      res.status(500).json(status_messages[500]);
    }
  });

  // GET restock order by id 
  app.get("/api/restockOrders/:id", check("id").isInt(), async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 404 => Not Found
     * 422 => Unprocessable Entity
     * 500 => Internal Server Error
     */
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
      }

      const order = await restock_order_service.getRestockOrder(req.params.id);

      if (order === 422) {
        res.status(422).json(status_messages[422]);
        return;
      }
      if (order === 404) {
        res.status(404).json(status_messages[404]);
        return;
      }
      res.status(200).json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json(status_messages[500]);
    }
  });

  // GET list of return items of an order, OK COMPLETE AND CHECKED
  app.get("/api/restockOrders/:id/returnItems", check("id").isInt(),
    async (req, res) => {

      /* STATUS CODES:
    * 200 => OK
    * 404 => Not Found
    * 422 => Unprocessable Entity
    * 500 => Internal Server Error
    */

      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }

        const returnItems = await restock_order_service.getReturnItemsRestockOrder(req.params.id);
        if (returnItems == 404)
          res.status(404).json(status_messages[404]);
        else if (returnItems == 422)
          res.status(422).json(status_messages[422]);
        else
          res.json(returnItems);
      } catch (err) {
        res.status(500).end();
      }
    });

  // POST create a new restock order 
  app.post(
    "/api/restockOrder",
    check("issueDate").isString(),
    check("supplierId").isInt(),
    check("products.*.SKUId").isInt(),
    check("products.*.itemId").isInt(),
    check("products.*.description").isString(),
    check("products.*.price").isFloat(),
    check("products.*.qty").isFloat(),
    check("issueDate").custom((value) => {
      if (value != null) {
        let timestamp = Date.parse(value);
        if (isNaN(timestamp)) {
          throw new Error("Invalid Date format");
        }
      }
      return true;
    }),
    async (req, res) => {
      /*
       * REQUEST BODY: application/json
       *  { issueDate, products, supplierId }
       * STATUS CODES:
       * 201 => Created
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(errors);
        }

        const order = await restock_order_service.newRestockOrder(
          req.body.issueDate,
          req.body.products,
          req.body.supplierId
        );

        if (order == 422) {
          return res.status(422).json(status_messages[422]);
        } else {
          return res.status(201).json(status_messages[201]);
        }
      } catch (err) {
        console.error(err);
        res.status(500).json(status_messages[500]);
      }
    }
  );

  // PUT modify the state of restockOrder , 
  app.put(
    "/api/restockOrder/:id",
    check("id").isInt(),
    check("newState").isIn([
      "ISSUED",
      "DELIVERY",
      "DELIVERED",
      "TESTED",
      "COMPLETEDRETURN",
      "COMPLETED",
    ]),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }
        const order = await restock_order_service.modifyRestockOrderState(
          req.params.id,
          req.body.newState
        );
        if (order == 404) res.status(404).json(status_messages[404]);
        else res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(503).json(status_messages[503]);
      }
    }
  );

  // PUT add skuItemList to a restockOrder 
  app.put("/api/restockOrder/:id/skuItems", check("id").isInt(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }
        const result = await restock_order_service.addSkuItemsToRestockOrder(
          req.params.id,
          req.body.skuItems
        );
        if (result == 404) res.status(404).json(status_messages[404]);
        else if (result == 422) return res.status(422).json(status_messages[422]);
        else res.status(200).end();
      } catch (err) {
        res.status(503).json(status_messages[503]);
      }
    }
  );

  // PUT add transportNote to a restockOrder 
  app.put(
    "/api/restockOrder/:id/transportNote",
    check("id").isInt(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }
        const result = await restock_order_service.addTransportNoteToRestockOrder(
          req.params.id,
          req.body.transportNote
        );
        if (result == 404) res.status(404).json(status_messages[404]);
        else if (result == 422) return res.status(422).json(status_messages[422]);
        else res.status(200).end();
      } catch (err) {
        res.status(503).json(status_messages[503]);
      }
    }
  );

  // DELETE an restock order 
  app.delete("/api/restockOrder/:id", check("id").isInt(), async (req, res) => {
    /**
     * REQUEST BODY: empty
     * STATUS CODES:
     * 204 => No Content
     * 422 => Unprocessable Entity
     * 503 => Service Unavailable
     */
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
      }
      const result = await restock_order_service.deleteOrder(req.params.id);
      if (result == 422) res.status(422).json(status_messages[422]);
      else res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(503).json(status_messages[503]);
    }
  });
}