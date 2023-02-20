const sku_dao = require("../sku/sku_dao");
class PositionService {
  dao;

  constructor(dao) {
    this.dao = dao;
  }

  getAllPosition = async () => {
    const positions = await this.dao.getAllPosition();
    let positionDTO = positions.map((position) => ({
      positionID: position.positionID,
      aisleID: position.aisleID,
      row: position.row,
      col: position.col,
      maxWeight: position.maxWeight,
      maxVolume: position.maxVolume,
      occupiedWeight: position.occupiedWeight,
      occupiedVolume: position.occupiedVolume,
    }));

    return positionDTO;
  };

  newPosition = async (positionID, aisleID, row, col, maxWeight, maxVolume) => {
    const position = await this.dao.newPosition(
      positionID,
      aisleID,
      row,
      col,
      maxWeight,
      maxVolume
    );
    if (position) {
      return 201;
    } else {
      throw 503;
    }
  };

  updatePosition = async (
    positionID,
    newAisleID,
    newRow,
    newCol,
    newMaxWeight,
    newMaxVolume,
    newOccupiedWeight,
    newOccupiedVolume
  ) => {
    const position = await this.dao.getPositionById(positionID);
    if (!position) {
      throw 404;
    }
    const updatedPosition = await this.dao.updatePosition(
      positionID,
      newAisleID,
      newRow,
      newCol,
      newMaxWeight,
      newMaxVolume,
      newOccupiedWeight,
      newOccupiedVolume
    );
    if (updatedPosition) {
      return 200;
    } else {
      throw 503;
    }
  };

  updatePositionID = async (positionID, newPositionID) => {
    const position = await this.dao.getPositionById(positionID);
    if (!position) {
      throw 404;
    }
    const updatedPosition = await this.dao.updatePositionID(
      positionID,
      newPositionID
    );
    if (updatedPosition) {
      const sku = await this.getSkuByPosition(position.id);
      if (sku) {
        await sku_dao.putPosition(sku.id, newPositionID);
      }
      return 200;
    } else {
      throw 503;
    }
  };

  deletePosition = async (positionID) => {
    //Delete SKU
    const position = await this.dao.getPositionById(positionID);
    if (!position) {
      throw 422;
    }
    const res = await this.dao.deletePosition(positionID);
    if (res == 204) {
      //Now set to NULL in sku associated to deleted position
      const sku = await this.getSkuByPosition(position);
      if (sku) {
        await sku_dao.putPosition(sku.id, null);
      }
      return 204;
    } else {
      throw 503;
    }
  };

  getSkuByPosition = async (positionID) => {
    const skus = await sku_dao.getAllSku();
    const sku = skus.filter((sku) => sku.position == positionID);
    if (sku) return sku[0];
    else return false;
  };
}

module.exports = PositionService;
