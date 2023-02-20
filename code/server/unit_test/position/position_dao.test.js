const DatabaseHelper = require("../../database/DatabaseHelper");
const position_dao = require("../../api/position/position_dao");

describe("Test Position DAO", () => {
  beforeAll(() => {
    new DatabaseHelper();
    position_dao.deletePositionData();
  });
  beforeEach(() => {
    position_dao.deletePositionData();
  });

  afterAll(async () => {
    await position_dao.deletePositionData();
  });

  test("Empty Position Table", async () => {
    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(0);
  });

  testGetAllPosition();
  testGetPositionById();
  testNewPosition(800234543412, 8002, 3454, 3412, 1000, 1000);
  testUpdatePosition(8002, 3454, 3412, 1200, 600, 200, 100);
  testUpdatePositionOccupation(800234543412, 400, 400);
  testUpdatePositionID(800234543412, 500060007000);
  testDeletePosition();
});

function testGetAllPosition() {
  test("Test Get All Position", async () => {
    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(0);

    let new_position = await position_dao.newPosition(
      100020003000,
      1000,
      2000,
      3000,
      1000,
      1000
    );

    res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(1);

    new_position = await position_dao.newPosition(
      200030004000,
      2000,
      3000,
      4000,
      1000,
      1000
    );

    res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(2);
  });
}

function testGetPositionById() {
  test("Test Get Position By Id", async () => {
    await position_dao.newPosition(300040005000, 3000, 4000, 5000, 1000, 1000);
    const res = await position_dao.getPositionById(300040005000);

    expect(res.id).toStrictEqual(300040005000);
    expect(res.aisle).toStrictEqual(3000);
    expect(res.row).toStrictEqual(4000);
    expect(res.col).toStrictEqual(5000);
    expect(res.maxWeight).toStrictEqual(1000);
    expect(res.maxVolume).toStrictEqual(1000);
    expect(res.occupiedWeight).toStrictEqual(0);
    expect(res.occupiedVolume).toStrictEqual(0);
  });
}

function testNewPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
  test("Test New Position", async () => {
    await position_dao.newPosition(
      positionID,
      aisleID,
      row,
      col,
      maxWeight,
      maxVolume
    );

    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(1);

    res = await position_dao.getPositionById(positionID);

    expect(res.id).toStrictEqual(positionID);
    expect(res.aisle).toStrictEqual(aisleID);
    expect(res.row).toStrictEqual(row);
    expect(res.col).toStrictEqual(col);
    expect(res.maxWeight).toStrictEqual(maxWeight);
    expect(res.maxVolume).toStrictEqual(maxVolume);
    expect(res.occupiedWeight).toStrictEqual(0);
    expect(res.occupiedVolume).toStrictEqual(0);
  });
}

function testUpdatePosition(
  newAisleID,
  newRow,
  newCol,
  newMaxWeight,
  newMaxVolume,
  newOccupiedWeight,
  newOccupiedVolume
) {
  test("Test Update Position", async () => {
    await position_dao.newPosition(100020003000, 1000, 2000, 3000, 1000, 1000);

    await position_dao.updatePosition(
      100020003000,
      newAisleID,
      newRow,
      newCol,
      newMaxWeight,
      newMaxVolume,
      newOccupiedWeight,
      newOccupiedVolume
    );

    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(1);

    res = await position_dao.getPositionById(
      parseInt("" + newAisleID + newRow + newCol)
    );

    expect(res.id).toStrictEqual(parseInt("" + newAisleID + newRow + newCol));
    expect(res.aisle).toStrictEqual(newAisleID);
    expect(res.row).toStrictEqual(newRow);
    expect(res.col).toStrictEqual(newCol);
    expect(res.maxWeight).toStrictEqual(newMaxWeight);
    expect(res.maxVolume).toStrictEqual(newMaxVolume);
    expect(res.occupiedWeight).toStrictEqual(newOccupiedWeight);
    expect(res.occupiedVolume).toStrictEqual(newOccupiedVolume);
  });
}

function testUpdatePositionOccupation(
  positionID,
  newOccupiedWeight,
  newOccupiedVolume
) {
  test("Test Update Position Occupation", async () => {
    const aisle = parseInt(positionID.toString().substring(0, 4));
    const row = parseInt(positionID.toString().substring(4, 8));
    const column = parseInt(positionID.toString().substring(8, 12));

    await position_dao.newPosition(positionID, aisle, row, column, 1000, 1000);

    await position_dao.updatePositionOccupation(
      positionID,
      newOccupiedWeight,
      newOccupiedVolume
    );

    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(1);

    res = await position_dao.getPositionById(positionID);

    expect(res.id).toStrictEqual(positionID);
    expect(res.occupiedWeight).toStrictEqual(newOccupiedWeight);
    expect(res.occupiedVolume).toStrictEqual(newOccupiedVolume);
  });
}

function testUpdatePositionID(positionID, newPositionID) {
  test("Test Update Position ID", async () => {
    let aisle = parseInt(positionID.toString().substring(0, 4));
    let row = parseInt(positionID.toString().substring(4, 8));
    let column = parseInt(positionID.toString().substring(8, 12));

    await position_dao.newPosition(positionID, aisle, row, column, 1000, 1000);

    await position_dao.updatePositionID(positionID, newPositionID);

    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(1);

    res = await position_dao.getPositionById(newPositionID);

    aisle = parseInt(newPositionID.toString().substring(0, 4));
    row = parseInt(newPositionID.toString().substring(4, 8));
    column = parseInt(newPositionID.toString().substring(8, 12));

    expect(res.id).toStrictEqual(newPositionID);
    expect(res.aisle).toStrictEqual(aisle);
    expect(res.row).toStrictEqual(row);
    expect(res.col).toStrictEqual(column);
  });
}

function testDeletePosition() {
  test("Test Delete Position", async () => {
    await position_dao.newPosition(100020003000, 1000, 2000, 3000, 1000, 1000);

    let res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(1);

    res = await position_dao.deletePosition(100020003000);

    res = await position_dao.getAllPosition();
    expect(res.length).toStrictEqual(0);

    res = await position_dao.getPositionById(100020003000);
    expect(res).toStrictEqual(undefined);
  });
}
