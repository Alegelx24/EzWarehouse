"use strict";

const status_messages = require("../../status_messages");

const InternalOrderService = require("./internal_order_service");
const order_dao = require("./order_dao");
const internal_order_service = new InternalOrderService(order_dao);

const { check, validationResult } = require("express-validator");



//------------------------INTERNAL ORDER API------------------------//

//GET all internal order 
module.exports = function (app) {
  app.get("/api/internalOrders", async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const orders = await internal_order_service.getAllInternalOrders();
      if (orders) res.status(200).json(orders);
      else res.status(500).json(status_messages[500]);
    } catch (err) {
      console.error(err);
      res.status(500).json(status_messages[500]);
    }
  });

  //GET all internal issued order 
  app.get("/api/internalOrdersIssued", async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const orders = await internal_order_service.getIssuedInternalOrders();
      if (orders) res.status(200).json(orders);
      else res.status(500).json(status_messages[500]);
    } catch (err) {
      console.error(err);
      res.status(500).json(status_messages[500]);
    }
  });

  //GET all internal accepted order 
  app.get("/api/internalOrdersAccepted", async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const orders = await internal_order_service.getAcceptedInternalOrders();
      if (orders) res.status(200).json(orders);
      else res.status(500).json(status_messages[500]);
    } catch (err) {
      console.error(err);
      res.status(500).json(status_messages[500]);
    }
  });

  // GET internal order by id 
  app.get("/api/internalOrders/:id", async (req, res) => {
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

      const order = await internal_order_service.getInternalOrder(req.params.id);

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

  // POST create a new internal order
  app.post(
    "/api/internalOrders",
    check("customerId").isInt(),
    check('products.*.SKUId').isInt(),
    check("products.*.description").isString(),
    check("products.*.price").isFloat(),
    check("products.*.qty").isInt(),
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
       *  { issueDate, products, customerId }
       * STATUS CODES:
       * 201 => Created
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }

        const order = await internal_order_service.newInternalOrder(
          req.body.issueDate,
          req.body.products,
          req.body.customerId
        );
        if (order === 422) {
          res.status(422).json(status_messages[422]);
          return;
        }
        res.status(201).json(status_messages[201]);
      } catch (err) {
        console.error(err);
        res.status(500).json(status_messages[500]);
      }
    }
  );

  // PUT modify the state 
  app.put("/api/internalOrders/:id",
    check("id").isInt(),
    check("newState")
      .isString()
      .isIn(["ISSUED", "ACCEPTED", "REFUSED", "CANCELED", "COMPLETED"]),
     //check("products.*.SkuId").isInt(),
    //check("products.*.RFID").isString().isLength(32),
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

        const internalOrder = await internal_order_service.updateStateOrder(
          req.params.id,
          req.body.newState,
          req.body.products
        );
        if (internalOrder == 404) res.status(404).json(status_messages[404]);
        else res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(503).json(status_messages[503]);
      }
    }
  );

  // DELETE an internal order 
  app.delete("/api/internalOrders/:id", check("id").isInt(), async (req, res) => {
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
      const result = await internal_order_service.deleteOrder(req.params.id);
      console.log(result);
      if (result == 422) res.status(422).json(status_messages[422]);
      else res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(503).json(status_messages[503]);
    }
  });
}