"use strict";

const status_messages = require("../../status_messages");
const UsersService = require ("./users_service");
const user_dao = require("./user_dao");

const users_service = new UsersService (user_dao);

module.exports = function (app) {

    //-----------------------------------GET---------------------------------//

    app.get('/api/suppliers', async (req, res) => {
        try {
          const suppliers = await users_service.getSuppliers()
          if (suppliers === undefined) {
            res.status(500).json(status_messages[500]);
          }
          else {
            res.status(200).json(suppliers);
          }
        }
        catch (err) {
          console.error(err);
          res.status(500).json(status_messages[500]);
        }
      });

    app.get('/api/users', async (req, res) => {
        try {
            const users = await users_service.getAllUsers();
            if (users == 500) {
                res.status(500).json(status_messages[500]);

            }
            else {
                res.status(200).json(users);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    //--------------------------------POST------------------------------//

    
    app.post('/api/newUser', async (req, res) => {
        try {
            const return_code = await users_service.newUser(req.body.name, req.body.surname, req.body.username, req.body.type, req.body.password);
            res.status(return_code).json(status_messages[return_code]);
            
        }
        catch (err) {
            console.error(err);
            res.status(503).json(status_messages[503]);
        }
    });
    
    app.post('/api/managerSessions', async (req, res) => {
        try {
            const result = await users_service.login(req.body.username, req.body.password, "manager");
            if (result === undefined) {
                res.status(401).json(status_messages[401]);
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    app.post('/api/customerSessions', async (req, res) => {
        try {
            const result = await users_service.login(req.body.username, req.body.password, "customer");
            if (result === undefined) {
                res.status(401).json(status_messages[401]);
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    app.post('/api/supplierSessions', async (req, res) => {
        try {
            const result = await users_service.login(req.body.username, req.body.password, "supplier");
            if (result === undefined) {
                res.status(401).json(status_messages[401]);
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    app.post('/api/clerkSessions', async (req, res) => {
        try {
            const result = await users_service.login(req.body.username, req.body.password, "clerk");
            if (result === undefined) {
                res.status(401).json(status_messages[401]);
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    app.post('/api/qualityEmployeeSessions', async (req, res) => {
        try {
            const result = await users_service.login(req.body.username, req.body.password, "qualityEmployee");
            if (result === undefined) {
                res.status(401).json(status_messages[401]);
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    app.post('/api/deliveryEmployeeSessions', async (req, res) => {
        try {
            const result = await users_service.login(req.body.username, req.body.password, "deliveryEmployee");
            if (result === undefined) {
                res.status(401).json(status_messages[401]);
            }
            else {
                res.status(200).json(result);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    app.post ('/api/logout', async (req, res) => {
        try {
            res.status(200).json(status_messages[200]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json(status_messages[500]);
        }
    });

    //----------------------------------PUT----------------------------//
    
    app.put ('/api/users/:username', async (req, res) => {
        try {
            const return_code = await users_service.updateType(req.params.username, req.body.oldType, req.body.newType);
            res.status(return_code).json(status_messages[return_code]);
        }
        catch (err) {
            console.error(err);
            res.status(503).json(status_messages[503]);
        }
    });

    //--------------------------------DELETE--------------------------//

    app.delete ('/api/users/:username/:type', async (req, res) => {
        try {
            const return_code = await users_service.deleteUser(req.params.username, req.params.type);
            res.status(return_code).json(status_messages[return_code]);
        }
        catch (err) {
            console.error(err);
            res.status(503).json(status_messages[503]);
        }
    });

}