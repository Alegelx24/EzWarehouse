"use strict";

const status_messages = require("../../status_messages");

const TestResultService = require("./testResult_service");
const testResult_dao = require("./testResult_dao");
const testResult_service = new TestResultService(testResult_dao);

const { check, validationResult } = require("express-validator");

module.exports = function (app) {

    app.post('/api/skuitems/testResult',
    check("rfid").isString().isLength(32),
    check("idTestDescriptor").isInt(),
    check("Date").isDate(),
    check("Result").isBoolean(),
    async(req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
        }

        const tr = await testResult_service.newTestResult(req.body.rfid, req.body.idTestDescriptor, req.body.Date, req.body.Result);

        if(tr === 404){
        res.status(404).json(status_messages[404]);
        return;
        }
        else{
        res.status(201).json(status_messages[201]);
        return;
        }
    }catch (err){
        console.error(err);
        res.status(503).json(status_messages[503])
    }
    });

    app.get('/api/skuitems/:rfid/testResults', 
    check("rfid").isString().isLength(32),
    async (req, res) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
        }
        const trs = await testResult_service.getTestResults(req.params.rfid);
        if(trs === 404){
            return res.status(404).json(status_messages[404]);
         }
        else{
            return  res.status(200).json(trs);
        }
    }catch(err){
        console.error(err);
        res.status(500).json(status_messages[500]);
    }
    });

    app.get('/api/skuitems/:rfid/testResults/:id', 
    check("rfid").isString().isLength(32),
    check("id").isInt(),
    async (req, res) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
        }
        const tr = await testResult_service.getSpecificTR(req.params.rfid, req.params.id);
        if(tr == 404){
            return res.status(404).json(status_messages[404]);
        }
        return res.status(200).json(tr);  
    }catch(err){
        console.error(err);
        res.status(500).json(status_messages[500]);
    }
    });

    app.put('/api/skuitems/:rfid/testResult/:id', 
    check("rfid").isString().isLength(32),
    check("id").isInt(),
    check("newIdTestDescriptor").isInt(),
    check("newDate").isDate(),
    check("newResult").isBoolean(),
    async (req, res) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
        }

        const tr = await testResult_service.updateTestResult(req.params.rfid, req.params.id, req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult);

        if(tr === 404){
            return res.status(404).json(status_messages[404]);
        }
        return res.status(200).json(status_messages[200]);
    }catch(err){
        console.error(err);
        res.status(503).json(status_messages[503]);
    }
    });

    app.delete('/api/skuitems/:rfid/testResult/:id', 
    check("rfid").isString().isLength(32),
    check("id").isInt(),
    async (req, res) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        console.error(errors);
        return res.status(422).json(status_messages[422]);
        }

        await testResult_service.deleteTestResult(req.params.rfid, req.params.id);
        res.status(204).json(status_messages[204]);
    
    }catch (err){
        console.error(err);
        res.status(503).json(status_messages[503]);
    }
    });
}