"use strict";

const status_messages = require("../../status_messages");

const ItemService = require("./item_service");
const item_dao = require("./item_dao");
const item_service = new ItemService(item_dao);

const { check, validationResult } = require("express-validator");

module.exports = function (app) {

    app.post('/api/item', 
    check("id").isInt(),
    check("description").isString(),
    check("price").isFloat({gt: 0}),
    check("SKUId").isInt(),
    check("supplierId").isInt(),
    async (req, res) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              console.error(errors);
              return res.status(422).json(status_messages[422]);
            }

            const i = await item_service.newItem(req.body.id, req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);

            if(i === 404){
              return res.status(404).json(status_messages[404]);
            }
            if(i === 422){
              return res.status(422).json(status_messages[422]);
          }

           return res.status(201).json(status_messages[201]);
        }catch(err){
            console.error(err);
            res.status(503).json(status_messages[503]);
        }
    });

    app.get('/api/items', async(req, res) =>{
        try {
            const i = await item_service.getItems();
            if(i){
              return res.status(200).json(i);
            }else{
              return res.status(500).json(status_messages[500]);
            }
          } catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
          }
    });

    app.get('/api/items/:id/:supplierId', 
    check("id").isInt(),
    check("supplierId").isInt(),
    async(req, res) =>{
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              console.error(errors);
              return res.status(422).json(status_messages[422]);
            }
            
            const i= await item_service.getSpecificItem(req.params.id, req.params.supplierId);
              
            if(i === 404){
              return res.status(404).json(status_messages[404]);
            }
        
            return res.status(200).json(i);
        
            }catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
          }
    });

    app.put('/api/item/:id/:supplierId',
    check("id").isInt(),
    check("supplierId").isInt(),
    check("newDescription").isString(),
    check("newPrice").isFloat({gt:0}),
    async (req, res) => {
      try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }
        const i = await item_service.updateItem(req.params.id,req.params.supplierId ,req.body.newDescription, req.body.newPrice);
        if(i === 404){
            return res.status(404).json(status_messages[404]);
        }
        return res.status(200).json(status_messages[200]);
    
      }catch (err) {
        console.error(err);
        res.status(503).json(status_messages[503]);
      }
    });

    app.delete('/api/items/:id/:supplierId',
    check("id").isInt(),
    check("supplierId").isInt(),
    async (req, res) => {
      try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.error(errors);
          return res.status(422).json(status_messages[422]);
        }   
        await item_service.deleteItem(req.params.id, req.params.supplierId);
        return res.status(204).json(status_messages[204]);
         
      }catch (err) {
        console.error(err);
        res.status(503).json(status_messages[503]);
      }
    });

}