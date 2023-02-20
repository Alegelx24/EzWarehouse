const sku_dao = require("../sku/sku_dao");

class ItemService {
    dao;

    constructor(dao){
        this.dao = dao;
    }

    newItem = async(id, description, price, skuID, supplierId) => {
        const sku = await sku_dao.getSkuById(skuID);

        if(sku === undefined){
            return 404;
        }
        const i = await this.dao.getSoldItem(id, supplierId);
        if(i[0] !== undefined){
            return 422;
        }
        const iSku = await this.dao.getSoldItemS(skuID, supplierId);
        if(iSku[0] !== undefined){
            return 422;
        }
        await this.dao.newItem(id, description, price, skuID, supplierId);

        return;
    }

    getItems = async () =>{
        const i = await this.dao.getItems();
        return i;
    }

    getSpecificItem = async(id, supplierId) =>{
        const i = await this.dao.getSpecificItem(id, supplierId);

        if(i === undefined){
            return 404;
        }else
            return i;
    }

    updateItem = async(id, supplierId, newDescription, newPrice) =>{
        const i = await this.dao.getSpecificItem(id, supplierId);

        if(i === undefined){
            return 404;
        }

        await this.dao.updateItem(id ,supplierId ,newDescription, newPrice);

        return ;
    }

    deleteItem = async(id, supplierId) =>{
        await this.dao.deleteItem(id, supplierId);
        return;
    }
}

module.exports = ItemService;