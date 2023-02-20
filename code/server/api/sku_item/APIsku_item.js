"use strict";

const status_messages = require("../../status_messages");

const SkuItemService = require("./sku_item_service");
const sku_item_dao = require("./sku_item_dao");
const sku_item_service = new SkuItemService(sku_item_dao);

const { check, validationResult } = require("express-validator");

module.exports = function (app) {
  app.get("/api/skuitems", async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const sku_items = await sku_item_service.getAllSkuItems();
      res.status(200).json(sku_items);
    } catch (err) {
      console.error(err);
      res.status(err).json(status_messages[err]);
    }
  });

  app.get("/api/skuitems/sku/:id", check("id").isInt(), async (req, res) => {
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
        throw 422;
      }

      const sku_items = await sku_item_service.getSkuItemsBySkuId(
        req.params.id
      );
      res.status(200).json(sku_items);
    } catch (err) {
      console.error(err);
      res.status(err).json(status_messages[err]);
    }
  });

  app.get(
    "/api/skuitems/:rfid",
    check("rfid").isNumeric().isLength(32),
    async (req, res) => {
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
          throw 422;
        }

        const sku_item = await sku_item_service.getSkuItemByRFID(
          req.params.rfid
        );
        res.status(200).json(sku_item);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.post(
    "/api/skuitem",
    check("RFID").isNumeric().isLength(32),
    check("SKUId").isInt(),
    check("DateOfStock").custom((value) => {
      if (value != null) {
        let timestamp = Date.parse(value);
        if (isNaN(timestamp)) {
          throw new Error("Invalid Date format");
        }
      }
      return true;
    }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { RFID, SKUId, DateOfStock = null }
       * STATUS CODES:
       * 201 => Created
       * 404 => Not Found (no SKU associated to SKUId)
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      req.body.DateOfStock
        ? check("DateOfStock").isDate()
        : (req.body.DateOfStock = null);

      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          throw 422;
        }

        const sku_item = await sku_item_service.newSkuItem(
          req.body.RFID,
          req.body.SKUId,
          req.body.DateOfStock
        );
        res.status(201).json(status_messages[201]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.put(
    "/api/skuitems/:rfid",
    check("rfid").isNumeric().isLength(32),
    check("newRFID").isNumeric().isLength(32),
    check("newAvailable").isInt(),
    check("newDateOfStock").custom((value) => {
      let timestamp = Date.parse(value);
      if (isNaN(timestamp)) {
        throw new Error("Invalid Date format");
      }
      return true;
    }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { newRFID, newAvailable, newDateOfStock }
       * STATUS CODES:
       * 200 => Ok
       * 404 => Not Found (SKU not existing)
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          throw 422;
        }

        const updated_sku_item = await sku_item_service.updateSkuItem(
          req.params.rfid,
          req.body.newRFID,
          req.body.newAvailable,
          req.body.newDateOfStock
        );
        res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.delete(
    "/api/skuitems/:rfid",
    check("rfid").isNumeric().isLength(32),
    async (req, res) => {
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
          throw 422;
        }
        const deleted_sku_item = await sku_item_service.deleteSkuItem(
          req.params.rfid
        );
        res.status(204).json(status_messages[204]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );
};
