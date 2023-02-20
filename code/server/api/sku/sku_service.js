const position_dao = require("../position/position_dao");
const test_descriptor_dao = require("../testDescriptor/testDescriptor_dao");
class SkuService {
  dao;

  constructor(dao) {
    this.dao = dao;
  }

  getAllSku = async () => {
    const skus = await this.dao.getAllSku();
    let skuDTO = skus.map((sku) => ({
      id: sku.id,
      description: sku.description,
      weight: sku.weight,
      volume: sku.volume,
      notes: sku.notes,
      position: sku.position,
      availableQuantity: sku.availableQuantity,
      price: sku.price,
    }));

    const testDescriptors = await test_descriptor_dao.getTestDescriptors();
    skuDTO = skuDTO.map((sku) => {
      sku.testDescriptors = testDescriptors
        .filter((elem) => elem.skuID == sku.id)
        .map((td) => td.id);
      return sku;
    });

    return skuDTO;
  };

  getSkuById = async (id) => {
    if (id === undefined || !parseInt(id)) {
      throw 422;
    }
    const sku = await this.dao.getSkuById(id);
    if (sku === undefined) {
      throw 404;
    }
    let skuDTO = {
      id: sku.id,
      description: sku.description,
      weight: sku.weight,
      volume: sku.volume,
      notes: sku.notes,
      position: sku.position,
      availableQuantity: sku.availableQuantity,
      price: sku.price,
    };

    const testDescriptors = await test_descriptor_dao.getTestDescriptors();
    skuDTO.testDescriptors = testDescriptors
      .filter((elem) => elem.skuID == sku.id)
      .map((td) => td.id);
    return skuDTO;
  };

  newSKU = async (
    description,
    weight,
    volume,
    notes,
    price,
    availableQuantity
  ) => {
    const sku = await this.dao.newSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    if (sku === undefined) {
      throw 503;
    } else {
      return 201;
    }
  };

  updateSKU = async (
    id,
    newDescription,
    newWeight,
    newVolume,
    newNotes,
    newPrice,
    newAvailableQuantity
  ) => {
    //Update SKU
    const currentSku = await this.dao.getSkuById(id);
    if (!currentSku) {
      throw 404;
    }
    const updatedSku = await this.dao.updateSKU(
      id,
      newDescription,
      newWeight,
      newVolume,
      newNotes,
      newPrice,
      newAvailableQuantity
    );
    if (updatedSku == 200) {
      //If SKU update successful, update Position
      if (currentSku.position != undefined) {
        const positionData = await position_dao.getPositionById(
          currentSku.position
        );
        if (!positionData) {
          throw 503;
        }
        const updatedPosition = await this.dao.updatePositionData(
          currentSku.position,
          newAvailableQuantity,
          newWeight,
          newVolume,
          currentSku.availableQuantity,
          currentSku.weight,
          currentSku.volume,
          positionData
        );
        if (updatedPosition == 422) {
          const rollbackPosition = await this.dao.updateSKU(
            id,
            currentSku.description,
            currentSku.weight,
            currentSku.volume,
            currentSku.notes,
            currentSku.price,
            currentSku.availableQuantity
          );
          if (rollbackPosition == 200) {
            throw 422;
          } else {
            throw 503;
          }
        }
        if (updatedPosition == 200) {
          //TODO update testDescriptors
          return 200;
        } else {
          throw 503;
        }
      } else {
        return 200;
      }
    } else {
      throw 503;
    }
  };

  deleteSku = async (id) => {
    //Delete SKU
    /* const sku = await this.dao.getSkuById(id);
    if (!sku) {
      throw 404;
    } */
    const res = await this.dao.deleteSku(id);
    if (res == 204) {
      //Now set to 0 occupiedWeight and occupiedVolume in position
      /* if (sku.position != undefined) {
        await position_dao.updatePositionOccupation(sku.position, 0, 0);
      } */
      return 204;
    } else {
      throw 503;
    }
  };

  putPosition = async (skuID, positionID) => {
    const sku = await this.dao.getSkuById(skuID);
    if (!sku) {
      throw 404;
    }

    const position = await position_dao.getPositionById(positionID);
    if (!position) {
      throw 404;
    }
    //Position ID is already assigned to this SKU
    if (sku.position == position.id) {
      return 200;
    }

    //Check if positionID is assigned to another skuID
    const skus = await this.dao.getAllSku();
    if (skus.filter((elem) => elem.position === positionID).length > 0) {
      throw 422;
    }

    const newOccupiedWeight =
      position.occupiedWeight + sku.weight * sku.availableQuantity;
    const newOccupiedVolume =
      position.occupiedVolume + sku.volume * sku.availableQuantity;

    if (
      newOccupiedWeight <= position.maxWeight &&
      newOccupiedVolume <= position.maxVolume
    ) {
      const resultSku = await this.dao.putPosition(skuID, positionID);
      const resultPos = await position_dao.updatePositionOccupation(
        positionID,
        newOccupiedWeight,
        newOccupiedVolume
      );
      if (resultSku == 200 && resultPos == 201) {
        return 200;
      } else {
        //rollback
        await this.dao.putPosition(skuID, null);
        await position_dao.updatePositionOccupation(
          positionID,
          position.occupiedWeight,
          position.occupiedVolume
        );
        throw 422;
      }
    } else {
      await this.dao.putPosition(skuID, null);
      await position_dao.updatePositionOccupation(
        positionID,
        position.occupiedWeight,
        position.occupiedVolume
      );
      throw 422;
    }
  };
}

module.exports = SkuService;
