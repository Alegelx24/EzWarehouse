"use strict";

const status_messages = require("../../status_messages");

const SkuService = require("./sku_service");
const sku_dao = require("./sku_dao");
const sku_service = new SkuService(sku_dao);

const { check, validationResult } = require("express-validator");

module.exports = function (app) {
  app.get("/api/skus", async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const skus = await sku_service.getAllSku();
      res.status(200).json(skus);
    } catch (err) {
      console.error(err);
      res.status(err).json(status_messages[err]);
    }
  });

  app.get("/api/skus/:id", check("id").isInt(), async (req, res) => {
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

      const sku = await sku_service.getSkuById(req.params.id);
      res.status(200).json(sku);
    } catch (err) {
      console.error(err);
      res.status(err).json(status_messages[err]);
    }
  });

  app.post(
    "/api/sku",
    check("description").isLength({ min: 1 }),
    check("weight").isFloat({ min: 0 }),
    check("volume").isFloat({ min: 0 }),
    check("notes").isLength({ min: 1 }),
    check("price").isFloat({ min: 0 }),
    check("availableQuantity").isInt({ min: 0 }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { description, weight, volume, notes, price, availableQuantity }
       * STATUS CODES:
       * 201 => Created
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          throw 422;
        }

        const sku = await sku_service.newSKU(
          req.body.description,
          req.body.weight,
          req.body.volume,
          req.body.notes,
          req.body.price,
          req.body.availableQuantity
        );
        res.status(201).json(status_messages[201]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.put(
    "/api/sku/:id",
    check("id").isInt(),
    check("newDescription").isLength({ min: 1 }),
    check("newWeight").isFloat({ min: 0 }),
    check("newVolume").isFloat({ min: 0 }),
    check("newNotes").isLength({ min: 1 }),
    check("newPrice").isFloat({ min: 0 }),
    check("newAvailableQuantity").isInt({ min: 0 }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity }
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

        await sku_service.updateSKU(
          req.params.id,
          req.body.newDescription,
          req.body.newWeight,
          req.body.newVolume,
          req.body.newNotes,
          req.body.newPrice,
          req.body.newAvailableQuantity
        );
        res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.put(
    "/api/sku/:id/position",
    check("id").isInt(),
    check("position").isNumeric().isLength({ min: 12, max: 12 }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { position }
       * STATUS CODES:
       * 200 => Ok
       * 404 => Not Found (Position not existing or SKU not existing)
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          throw 422;
        }

        const resultSku = await sku_service.putPosition(
          req.params.id,
          req.body.position
        );

        res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.delete("/api/skus/:id", check("id").isInt({ min: 0 }).notEmpty(), async (req, res) => {
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
      await sku_service.deleteSku(req.params.id);
      res.status(204).json(status_messages[204]);
    } catch (err) {
      console.error(err);
      res.status(err).json(status_messages[err]);
    }
  });
}