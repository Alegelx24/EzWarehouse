const sku_dao = require("../sku/sku_dao");

class TestDescriptorService{
    dao;
    
    constructor(dao){
        this.dao = dao;

    }

    //qui definisco le funzioni
    newTestDescriptor = async (name, procedureDescription, skuID) => {      
        const sku = await sku_dao.getSkuById(skuID);
 
        if(sku === undefined){
            return 404;
        }
        
        await this.dao.newTestDescriptor(name, procedureDescription, skuID);
        
        return;
    }

    getTestDescriptors = async () => {
        const td = await this.dao.getTestDescriptors();

        return td;
    }

    getSpecificTD = async (id) => {
        const td = await this.dao.getSpecificTD(id);
        
        if(td === undefined)
            return 404;
        else
            return td;
    }



    updateTestDescriptor = async (id, newName, newProcedureDescription, newSkuID) => {
        const td = await this.dao.getSpecificTD(id);
        const sku = await sku_dao.getSkuById(newSkuID);

        if(td === undefined){
            
            return 404;
        }
        if(sku === undefined){
            return 404;
        }

        await this.dao.updateTestDescriptor(id, newName, newProcedureDescription, newSkuID);
        return;
    }

    deleteTestDescriptor = async (id) => {
        
        await this.dao.deleteTestDescriptor(id);
        return ;
    }

}


module.exports = TestDescriptorService