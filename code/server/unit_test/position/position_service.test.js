const PositionService = require("../../api/position/position_service");
const SkuService = require("../../api/sku/sku_service");
const position_dao = require("../../api/position/position_dao");
const sku_dao = require("../../api/sku/sku_dao");
const DatabaseHelper = require("../../database/DatabaseHelper");
const position_service = new PositionService(position_dao);
const sku_service = new SkuService(sku_dao);

describe("Position Service Test", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await position_dao.deletePositionData();
    await sku_dao.deleteSkuData();
  });

  beforeEach(async () => {
    await position_dao.deletePositionData();
    await sku_dao.deleteSkuData();
  });

  afterAll(async () => {
    await position_dao.deletePositionData();
    await sku_dao.deleteSkuData();
  });

  testNewPosition(800234543412, 8002, 3454, 3412, 1000, 1000);
  testUpdatePosition(800234543412, 8004, 3455, 3413, 2000, 2000, 800, 800);
  testUpdatePositionID(800234543412, 800434553413);
  testDeletePosition(800234543412);
  testGetSkuByPosition(800234543418);
});

async function testNewPosition(
  positionID,
  aisleID,
  row,
  col,
  maxWeight,
  maxVolume
) {
  test("New Position", async () => {
    await position_service.newPosition(
      positionID,
      aisleID,
      row,
      col,
      maxWeight,
      maxVolume
    );
    let res = await position_service.getAllPosition();
    expect(res.length).toStrictEqual(1);
    expect(res[0]).toEqual({
      positionID: positionID,
      aisleID: aisleID,
      row: row,
      col: col,
      maxWeight: maxWeight,
      maxVolume: maxVolume,
      occupiedWeight: 0,
      occupiedVolume: 0,
    });
  });
}

async function testUpdatePosition(
  positionID,
  newAisleID,
  newRow,
  newCol,
  newMaxWeight,
  newMaxVolume,
  newOccupiedWeight,
  newOccupiedVolume
) {
  test("Update Position", async () => {
    const aisle = positionID.toString().substring(0, 4);
    const row = positionID.toString().substring(4, 8);
    const column = positionID.toString().substring(8, 12);
    await position_service.newPosition(
      positionID,
      aisle,
      row,
      column,
      1000,
      1000
    );
    await position_service.updatePosition(
      positionID,
      newAisleID,
      newRow,
      newCol,
      newMaxWeight,
      newMaxVolume,
      newOccupiedWeight,
      newOccupiedVolume
    );
    let res = await position_service.getAllPosition();
    expect(res.length).toStrictEqual(1);
    expect(res[0]).toEqual({
      positionID: parseInt("" + newAisleID + newRow + newCol),
      aisleID: newAisleID,
      row: newRow,
      col: newCol,
      maxWeight: newMaxWeight,
      maxVolume: newMaxVolume,
      occupiedWeight: newOccupiedWeight,
      occupiedVolume: newOccupiedVolume,
    });
  });
}

async function testUpdatePositionID(positionID, newPositionID) {
  test("Update Position ID", async () => {
    const aisle = positionID.toString().substring(0, 4);
    const row = positionID.toString().substring(4, 8);
    const column = positionID.toString().substring(8, 12);
    await position_service.newPosition(
      positionID,
      aisle,
      row,
      column,
      1000,
      1000
    );
    await position_service.updatePositionID(positionID, newPositionID);
    const newAisle = parseInt(newPositionID.toString().substring(0, 4));
    const newRow = parseInt(newPositionID.toString().substring(4, 8));
    const newColumn = parseInt(newPositionID.toString().substring(8, 12));
    let res = await position_service.getAllPosition();
    expect(res.length).toStrictEqual(1);
    expect(res[0]).toEqual({
      positionID: newPositionID,
      aisleID: newAisle,
      row: newRow,
      col: newColumn,
      maxWeight: 1000,
      maxVolume: 1000,
      occupiedWeight: 0,
      occupiedVolume: 0,
    });
  });
}

async function testDeletePosition(positionID) {
  test("Delete Position ID", async () => {
    const aisle = positionID.toString().substring(0, 4);
    const row = positionID.toString().substring(4, 8);
    const column = positionID.toString().substring(8, 12);
    await position_service.newPosition(
      positionID,
      aisle,
      row,
      column,
      1000,
      1000
    );
    try {
      await position_service.deletePosition(positionID);
    } catch (err) {
      expect(err.toStrictEqual(404));
    }
  });
}

async function testGetSkuByPosition(positionID) {
  test("Get Sku by Position ID", async () => {
    const new_sku = await sku_dao.newSKU(
      "First SKU",
      100,
      50,
      "First SKU Note",
      10.99,
      5
    );
    const aisle = positionID.toString().substring(0, 4);
    const row = positionID.toString().substring(4, 8);
    const column = positionID.toString().substring(8, 12);
    await position_service.newPosition(
      positionID,
      aisle,
      row,
      column,
      1000,
      1000
    );
    const pos_res = await sku_service.putPosition(new_sku, positionID);
    const res = await position_service.getSkuByPosition(positionID);
    expect(res.id).toStrictEqual(new_sku);
  });
}
