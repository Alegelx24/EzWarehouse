const SkuService = require("../../api/sku/sku_service");
const sku_dao = require("../../api/sku/sku_dao");
const position_dao = require("../../api/position/position_dao");
const DatabaseHelper = require("../../database/DatabaseHelper");
const sku_service = new SkuService(sku_dao);

describe("Sku Service Test", () => {
  beforeAll(async () => {
    new DatabaseHelper();
    await sku_dao.deleteSkuData();
  });

  beforeEach(async () => {
    await sku_dao.deleteSkuData();
    await position_dao.deletePositionData();
  });

  afterAll(async () => {
    await sku_dao.deleteSkuData();
    await position_dao.deletePositionData();
  });

  testGetSku("First SKU", 100, 50, "First SKU Note", 10.99, 50);
  testGetSku("Second SKU", 70, 30, "Second SKU Note", 19.99, 60);

  testGetSku("Second SKU", 70, 30, "Second SKU Note", 19.99, 60, 422);

  testUpdateSku(
    "Sixth SKU",
    20,
    10,
    "Sixth SKU Note",
    39.99,
    80,
    1000,
    1000,
    422
  );

  testUpdateSku(
    "Sixth SKU",
    20,
    10,
    "Sixth SKU Note",
    39.99,
    80,
    10000,
    10000,
    200
  );

  testUpdateSku("Third SKU", 20, 10, "Third SKU Note", 39.99, 80);

  testDeleteSku("Fourth SKU", 20, 10, "Fourth SKU Note", 19.99, 80);

  testPutPosition(
    "Fifth SKU",
    40,
    20,
    "Fifth SKU Note",
    19.99,
    60,
    "800090007000",
    10000,
    10000,
    200
  );

  testPutPosition(
    "Fifth SKU",
    40,
    20,
    "Fifth SKU Note",
    19.99,
    60,
    "800090007001",
    100,
    100,
    422
  );
});

async function testGetSku(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity,
  expectedHTTPStatus = null
) {
  test("New SKU and Get Sku By Id", async () => {
    let new_sku = await sku_dao.newSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    try {
      if (expectedHTTPStatus === 422) {
        new_sku = "wrong";
      }
      if (expectedHTTPStatus === 404) {
        new_sku = 9999;
      }
      let res = await sku_service.getSkuById(new_sku);
      expect(res).toEqual({
        id: new_sku,
        description: description,
        weight: weight,
        volume: volume,
        notes: notes,
        position: null,
        availableQuantity: availableQuantity,
        price: price,
        testDescriptors: [],
      });
    } catch (err) {
      if (expectedHTTPStatus != null) {
        expect(err).toEqual(expectedHTTPStatus);
      }
    }
  });
}

async function testUpdateSku(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity,
  maxWeight = null,
  maxVolume = null,
  expectedStatus = null
) {
  test("Update SKU", async () => {
    try {
      const new_sku = await sku_dao.newSKU(
        "Test SKU",
        100,
        50,
        "Test SKU Note",
        10.99,
        5
      );

      if (maxWeight !== null && maxVolume !== null) {
        const new_position = await position_dao.newPosition(
          "777788889999",
          "7777",
          "8888",
          "9999",
          maxWeight,
          maxVolume
        );
        await sku_service.putPosition(new_sku, "777788889999");
      }

      const res = await sku_service.updateSKU(
        new_sku,
        description,
        weight,
        volume,
        notes,
        price,
        availableQuantity
      );

      expect(res).toStrictEqual(expectedStatus !== null ? expectedStatus : 200);
    } catch (err) {
      expect(err).toStrictEqual(expectedStatus);
    }
  });
}

async function testDeleteSku(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity
) {
  test("Delete SKU", async () => {
    const new_sku = await sku_dao.newSKU(
      description,
      weight,
      volume,
      notes,
      price,
      availableQuantity
    );
    sku_service.deleteSku(new_sku);
    try {
      await sku_service.getSkuById(new_sku);
    } catch (err) {
      expect(err).toStrictEqual(404);
    }
  });
}

async function testPutPosition(
  description,
  weight,
  volume,
  notes,
  price,
  availableQuantity,
  positionID,
  maxWeight,
  maxVolume,
  expectedStatus
) {
  test("Put Position SKU", async () => {
    try {
      const new_sku = await sku_dao.newSKU(
        description,
        weight,
        volume,
        notes,
        price,
        availableQuantity
      );
      const aisle = positionID.toString().substring(0, 4);
      const row = positionID.toString().substring(4, 8);
      const column = positionID.toString().substring(8, 12);

      const new_pos = await position_dao.newPosition(
        positionID,
        aisle,
        row,
        column,
        maxWeight,
        maxVolume
      );
      const res = await sku_service.putPosition(new_sku, positionID);
      expect(res).toStrictEqual(expectedStatus);
    } catch (err) {
      expect(err).toStrictEqual(expectedStatus);
    }
  });
}


