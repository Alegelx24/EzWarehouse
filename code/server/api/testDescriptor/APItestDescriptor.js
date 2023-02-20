"use strict";

const status_messages = require("../../status_messages");

const TestDescriptorService = require("./testDescriptor_service");
const testDescriptor_dao = require("./testDescriptor_dao");
const testDescriptor_service = new TestDescriptorService(testDescriptor_dao);

const { check, validationResult } = require("express-validator");

module.exports = function (app) {
    app.get('/api/testDescriptors', async (req, res) => {
        try {
          
          const tds = await testDescriptor_service.getTestDescriptors();
          if(tds){
            return res.status(200).json(tds);
    
          }else{
            return res.status(500).json(status_messages[500]);
            
          }
        } catch (err) {
          console.error(err);
          res.status(500).json(status_messages[500]);
        }
      });
      
      app.get('/api/testDescriptors/:id',
      check("id").isInt(),
      async (req, res) => {
        try{
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            console.error(errors);
            return res.status(422).json(status_messages[422]);
          }
          
          const td = await testDescriptor_service.getSpecificTD(req.params.id);
            
          if(td === 404){
            return res.status(404).json(status_messages[404]);
            
          }
      
          return res.status(200).json(td);
      
          }catch (err) {
          console.error(err);
          res.status(500).json(status_messages[500]);
        }
      });
      
      app.post('/api/testDescriptor', 
      check("name").isString(),
      check("procedureDescription").isString(),
      check("idSKU").isInt(),
      async (req, res) => {
        try{
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            console.error(errors);
            return res.status(422).json(status_messages[422]);
          }
          const td = await testDescriptor_service.newTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
      
          if(td === 404){
            return res.status(404).json(status_messages[404]);
            
           }
           return res.status(201).json(status_messages[201]);
      
        }catch (err) {
          console.error(err);
          res.status(503).json(status_messages[503]);
        }
      });
      
      app.put('/api/testDescriptor/:id',
      check("id").isInt(),
      check("newName").isString(),
      check("newProcedureDescription").isString(),
      check("newIdSKU").isInt(),
      async (req, res) => {
        try{
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            console.error(errors);
            return res.status(422).json(status_messages[422]);
          }
          const td = await testDescriptor_service.updateTestDescriptor(req.params.id, req.body.newName, req.body.newProcedureDescription, req.body.newIdSKU);
          
          if(td === 404){
            return res.status(404).json(status_messages[404]);
            
          }
          return res.status(200).json(status_messages[200]);
      
        }catch (err) {
          console.error(err);
          res.status(503).json(status_messages[503]);
        }
      });
      
      app.delete('/api/testDescriptor/:id',
      check("id").isInt(),
      async (req, res) => {
        try{
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            console.error(errors);
            return res.status(422).json(status_messages[422]);
          }   
          await testDescriptor_service.deleteTestDescriptor(req.params.id);
          return res.status(204).json(status_messages[204]);
           
        }catch (err) {
          console.error(err);
          res.status(503).json(status_messages[503]);
        }
      });
}