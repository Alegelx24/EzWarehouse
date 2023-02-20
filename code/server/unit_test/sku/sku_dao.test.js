const DatabaseHelper = require("../../database/DatabaseHelper");
const sku_dao = require("../../api/sku/sku_dao");
const position_dao = require("../../api/position/position_dao");

describe("Test SKU DAO", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await sku_dao.deleteSkuData();
  });
  beforeEach(async () => await sku_dao.deleteSkuData());

  afterAll(async () => {
    await sku_dao.deleteSkuData();
  });

  test("Empty SKU Table", async () => {
    let res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(0);
  });

  testGetAllSku();
  testGetSkuById();
  testNewSku(
    "First Sku Test",
    100.5,
    20.8,
    "This is the note for the first sku",
    9.99,
    10
  );
  testUpdateSku(
    "First Sku Test",
    100.5,
    20.8,
    "This is the note for the first sku",
    9.99,
    10
  );
  testDeleteSku();
});

describe("Test Update Position Data Sku DAO", () => {
  let sku;

  beforeAll(async () => {
    new DatabaseHelper();
    await sku_dao.deleteSkuData();
    await position_dao.deletePositionData();

    await position_dao.newPosition(
      "100020003000",
      "1000",
      "2000",
      "3000",
      1000,
      1000
    );
  });

  const positionData = {
    positionID: "100020003000",
    aisleID: "1000",
    row: "2000",
    col: "3000",
    maxWeight: 1000,
    maxVolume: 1000,
    occupiedWeight: 0,
    occupiedVolume: 0,
  };

  testUpdatePositionData(
    "100020003000",
    10,
    10,
    10,
    1,
    1,
    1,
    positionData,
    200
  );

  positionData.occupiedWeight = 500;
  positionData.occupiedVolume = 500;

  testUpdatePositionData(
    "100020003000",
    1000,
    100,
    100,
    10,
    10,
    10,
    positionData,
    422
  );

  afterAll(async () => {
    await sku_dao.deleteSkuData();
    await position_dao.deletePositionData();
  });
});

function testGetAllSku() {
  test("Test Get All SKU", async () => {
    let res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(0);

    let new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);

    res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(1);

    new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);

    res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(2);
  });
}

function testGetSkuById() {
  test("Test Get SKU By Id", async () => {
    const new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);
    const res = await sku_dao.getSkuById(new_sku);
    expect(res.description).toStrictEqual("Test");
    expect(res.weight).toStrictEqual(1);
    expect(res.volume).toStrictEqual(1);
    expect(res.notes).toStrictEqual("Test");
    expect(res.price).toStrictEqual(1.01);
    expect(res.availableQuantity).toStrictEqual(1);
  });
}

function testNewSku(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("Test New SKU", async () => {
    const new_sku = await sku_dao.newSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );

    let res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(1);

    res = await sku_dao.getSkuById(new_sku);

    expect(res.description).toStrictEqual(description);
    expect(res.weight).toStrictEqual(weight);
    expect(res.volume).toStrictEqual(volume);
    expect(res.notes).toStrictEqual(notes);
    expect(res.price).toStrictEqual(price);
    expect(res.availableQuantity).toStrictEqual(availableQuantity);
  });
}

function testUpdateSku(
  newDescription,
  newWeight,
  newVolume,
  newNotes,
  newPrice,
  newAvailableQuantity
) {
  test("Test Update SKU", async () => {
    const new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);

    await sku_dao.updateSKU(
      new_sku,
      newDescription,
      newWeight,
      newVolume,
      newNotes,
      newPrice,
      newAvailableQuantity
    );

    let res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(1);

    res = await sku_dao.getSkuById(new_sku);

    expect(res.description).toStrictEqual(newDescription);
    expect(res.weight).toStrictEqual(newWeight);
    expect(res.volume).toStrictEqual(newVolume);
    expect(res.notes).toStrictEqual(newNotes);
    expect(res.price).toStrictEqual(newPrice);
    expect(res.availableQuantity).toStrictEqual(newAvailableQuantity);
  });
}

function testDeleteSku() {
  test("Test Delete SKU", async () => {
    const new_sku = await sku_dao.newSKU("Test", 1, 1, "Test", 1.01, 1);

    let res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(1);

    res = await sku_dao.deleteSku(new_sku);

    res = await sku_dao.getAllSku();
    expect(res.length).toStrictEqual(0);

    res = await sku_dao.getSkuById(new_sku);
    expect(res).toStrictEqual(undefined);
  });
}

function testUpdatePositionData(
  positionId,
  newAvailableQuantity,
  newWeight,
  newVolume,
  oldAvailableQuantity,
  oldWeight,
  oldVolume,
  oldPositionValues,
  expectedStatus
) {
  test("Test Update Position Data SKU", async () => {
    let res = await sku_dao.updatePositionData(
      positionId,
      newAvailableQuantity,
      newWeight,
      newVolume,
      oldAvailableQuantity,
      oldWeight,
      oldVolume,
      oldPositionValues
    );

    expect(res).toStrictEqual(expectedStatus);
  });
}
