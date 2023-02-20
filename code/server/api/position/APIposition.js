"use strict";

const status_messages = require("../../status_messages");

const PositionService = require("./position_service");
const position_dao = require("./position_dao");
const position_service = new PositionService(position_dao);
const { check, validationResult } = require("express-validator");

module.exports = function (app) {
  app.get("/api/positions", async (req, res) => {
    /**
     * STATUS CODES:
     * 200 => OK
     * 500 => Internal Server Error
     */
    try {
      const positions = await position_service.getAllPosition();
      res.status(200).json(positions);
    } catch (err) {
      console.error(err);
      res.status(err).json(status_messages[err]);
    }
  });

  app.post(
    "/api/position",
    check("positionID").isLength(12),
    check("aisleID").isLength(4),
    check("row").isLength(4),
    check("col").isLength(4),
    check("maxWeight").isFloat({ min: 0 }),
    check("maxVolume").isFloat({ min: 0 }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { positionID, aisleID, row, col, maxWeight, maxVolume }
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

        if (
          req.body.positionID !==
          "" + req.body.aisleID + req.body.row + req.body.col
        ) {
          throw 422;
        }

        await position_service.newPosition(
          req.body.positionID,
          req.body.aisleID,
          req.body.row,
          req.body.col,
          req.body.maxWeight,
          req.body.maxVolume
        );

        res.status(201).json(status_messages[201]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.put(
    "/api/position/:positionID",
    check("positionID").isLength(12),
    check("newAisleID").isLength(4),
    check("newRow").isLength(4),
    check("newCol").isLength(4),
    check("newMaxWeight").isFloat({ min: 0 }),
    check("newMaxVolume").isFloat({ min: 0 }),
    check("newOccupiedWeight").isFloat({ min: 0 }),
    check("newOccupiedVolume").isFloat({ min: 0 }),
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

        const updatedPosition = await position_service.updatePosition(
          req.params.positionID,
          req.body.newAisleID,
          req.body.newRow,
          req.body.newCol,
          req.body.newMaxWeight,
          req.body.newMaxVolume,
          req.body.newOccupiedWeight,
          req.body.newOccupiedVolume
        );

        res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.put(
    "/api/position/:positionID/changeID",
    check("positionID").isNumeric().isLength({ min: 12, max: 12 }),
    check("newPositionID").isNumeric().isLength({ min: 12, max: 12 }),
    async (req, res) => {
      /**
       * REQUEST BODY: application/json
       *  { newPositionID }
       * STATUS CODES:
       * 200 => Ok
       * 404 => Not Found (no position associated to positionID)
       * 422 => Unprocessable Entity
       * 503 => Service Unavailable
       */
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          throw 422;
        }

        const updatedPosition = await position_service.updatePositionID(
          req.params.positionID,
          req.body.newPositionID
        );

        res.status(200).json(status_messages[200]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );

  app.delete(
    "/api/position/:positionID",
    check("positionID").isNumeric().isLength({ min: 12, max: 12 }),
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

        const deletedPosition = await position_service.deletePosition(
          req.params.positionID
        );
        res.status(204).json(status_messages[204]);
      } catch (err) {
        console.error(err);
        res.status(err).json(status_messages[err]);
      }
    }
  );
};
