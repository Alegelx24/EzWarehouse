const chai = require("chai");
const chaiHttp = require("chai-http");

const user_dao = require('../api/user/user_dao');
const UserService = require('../api/user/users_service');
const user_service = new UserService(user_dao);

chai.use(chaiHttp);
chai.should();

const app = require('../server');
const { should } = require("chai");
var agent = chai.request.agent(app);

describe ('User - POST /api/newUser', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
    });

    testPostNewUser('Michael', 'Scott', "michael.scott@ezwh.com", 'supplier', 'password1', 201, "Correct new user insertion"); // Correct new user
    testPostNewUser('Michael', 'Scott', "michael.scott@ezwh.com", 'supplier', 'password1', 409, 'Inserting user already present in system'); // Already present in system
    testPostNewUser('Dwight', 'Shrute', "dwight.shrute@ezwh.com", 'manager', 'password1', 422, 'Inserting a manager user'); // Can't create manager account through api
    testPostNewUser('Dwight', 'Shrute', "dwight.shruteezwh.com", 'supplier', 'password1', 422, 'Inserting user with wrong email'); // Email is wrong
    testPostNewUser('Dwight', 'Shrute', "dwight.shruteezwh.com", 'supplier', 'pass', 422, 'Inserting user with a password that is too short'); // Password is too short
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/managerSessions', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "password1");
        await user_dao.updateType("michael.scott@ezwh.com", "supplier", "manager");
    })
    testManagerSessions("michael.scott@ezwh.com", "password1", 'Michael', 200, "Testing correct log in into manager session.");
    testManagerSessions("michael.scott@ezwh.com", "password2", 'Michael', 401, "Testing log in into manager session with wrong password.");
    testManagerSessions("michael.scott@ezw.com", "password1", 'Michael', 401, "Testing log in into manager session with wrong email.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/customerSessions', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "customer", "password1");
    })
    testCustomerSessions("michael.scott@ezwh.com", "password1", 'Michael', 200, "Testing correct log in into customer session.");
    testCustomerSessions("michael.scott@ezwh.com", "password2", 'Michael', 401, "Testing log in into customer session with wrong password.");
    testCustomerSessions("michael.scott@ezw.com", "password1", 'Michael', 401, "Testing log in into customer session with wrong email.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/supplierSessions', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "password1");
    })
    testSupplierSessions("michael.scott@ezwh.com", "password1", 'Michael', 200, "Testing correct log in into supplier session.");
    testSupplierSessions("michael.scott@ezwh.com", "password2", 'Michael', 401, "Testing log in into supplier session with wrong password.");
    testSupplierSessions("michael.scott@ezw.com", "password1", 'Michael', 401, "Testing log in into supplier session with wrong email.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/clerkSessions', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "clerk", "password1");
    })
    testClerkSessions("michael.scott@ezwh.com", "password1", 'Michael', 200, "Testing correct log in into clerk session.");
    testClerkSessions("michael.scott@ezwh.com", "password2", 'Michael', 401, "Testing log in into clerk session with wrong password.");
    testClerkSessions("michael.scott@ezw.com", "password1", 'Michael', 401, "Testing log in into clerk session with wrong email.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/qualityEmployeeSessions', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "qualityEmployee", "password1");
    })
    testQualityEmployeeSessions("michael.scott@ezwh.com", "password1", 'Michael', 200, "Testing correct log in into qualityEmployee session.");
    testQualityEmployeeSessions("michael.scott@ezwh.com", "password2", 'Michael', 401, "Testing log in into qualityEmployee session with wrong password.");
    testQualityEmployeeSessions("michael.scott@ezw.com", "password1", 'Michael', 401, "Testing log in into qualityEmployee session with wrong email.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/deliveryEmployeeSessions', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "deliveryEmployee", "password1");
    })
    testDeliveryEmployeeSessions("michael.scott@ezwh.com", "password1", 'Michael', 200, "Testing correct log in into deliveryEmployee session.");
    testDeliveryEmployeeSessions("michael.scott@ezwh.com", "password2", 'Michael', 401, "Testing log in into deliveryEmployee session with wrong password.");
    testDeliveryEmployeeSessions("michael.scott@ezw.com", "password1", 'Michael', 401, "Testing log in into deliveryEmployee session with wrong email.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
});

describe ('User - POST /api/logout', function () {
    testLogin(200, 'Testing login.');
})

describe ('User - GET /api/suppliers', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "password1");
        await user_service.newUser("Dwight", "Shrute", "dwight.shrute@ezwh.com", "supplier", "password1");
    })
    testGetAllSuppliers("Michael", "Scott", "michael.scott@ezwh.com", "Dwight", "Shrute", "dwight.shrute@ezwh.com", 200, 'Testing GET all suppliers.');
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
})

describe ('User - GET /api/users', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "password1");
        await user_service.newUser("Dwight", "Shrute", "dwight.shrute@ezwh.com", "customer", "password1");
    })
    testGetAllUsers("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "Dwight", "Shrute", "dwight.shrute@ezwh.com", "customer", 200, 'Testing GET all suppliers.');
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
})

describe ('User - PUT /api/users/:username', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "password1");
        await user_service.newUser("Dwight", "Shrute", "dwight.shrute@ezwh.com", "supplier", "password1");
        await user_dao.updateType("dwight.shrute@ezwh.com", "supplier", "manager");
    })
    testChangeUserType("supplier", "clerk", "michael.scott@ezwh.com", 200,  "Testing correct type changing.");
    testChangeUserType("supplier", "clerk", "michael.scott@ezwh.com", 404,  "Testing type changing with wrong old type.");
    testChangeUserType("supplier", "clerk", "michae.scott@ezwh.com", 404,  "Testing type changing with wrong email.");
    testChangeUserType("manager", "clerk", "dwight.shrute@ezwh.com", 422,  "Testing type changing of a manager.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
})

describe ('User - DELETE /api/users/:username/:type', function () {
    this.beforeAll(async () => {
        await user_dao.deleteAllUsers();
        await user_service.newUser("Michael", "Scott", "michael.scott@ezwh.com", "supplier", "password1");
        await user_service.newUser("Dwight", "Shrute", "dwight.shrute@ezwh.com", "supplier", "password1");
        await user_dao.updateType("dwight.shrute@ezwh.com", "supplier", "manager");
    })
    testDeleteUser("michael.scottezwh.com", "supplier", 422, "Testing deleting of a user with wrong email.");
    testDeleteUser("michael.scott@ezwh.com", "clerk", 422, "Testing deleting of a user with wrong type.");
    testDeleteUser("michael.scott@ezwh.com", "supplier", 204, "Testing correct deleting of a user.");
    testDeleteUser("dwight.shrute@ezwh.com", "manager", 422, "Testing deleting a manager.");
    this.afterAll(async () => {
        await user_dao.deleteAllUsers();
    })
})

function testDeleteUser (username, type, expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.delete('/api/users/'+username+'/'+type).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
        })
    })
}

function testChangeUserType(oldType, newType, email, expectedHTTPStatus, description) {
    it (description, function (done) {
        let req_body = {
            oldType: oldType,
            newType: newType,
        }
        agent.put('/api/users/' + email).send(req_body).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
        })
    })
}

function testLogin(expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.post('/api/logout').then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
        })
    })
}

function testGetAllUsers(name1, surname1, email1, type1, name2, surname2, email2, type2, expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.get('/api/users').then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            const expectedBody = [{
                id: res.body[0].id,
                name: name1,
                surname: surname1,
                email: email1,
                type: type1,
            },
            {
                id: res.body[1].id,
                name: name2,
                surname: surname2,
                email: email2,
                type: type2,
            }];
            JSON.stringify(res.body).should.equal(JSON.stringify(expectedBody));
            done();
        })
    })
}

function testGetAllSuppliers(name1, surname1, email1, name2, surname2, email2, expectedHTTPStatus, description) {
    it (description, function (done) {
        agent.get('/api/suppliers').then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            const expectedBody = [{
                id: res.body[0].id,
                name: name1,
                surname: surname1,
                email: email1,
            },
            {
                id: res.body[1].id,
                name: name2,
                surname: surname2,
                email: email2,
            }];
            JSON.stringify(res.body).should.equal(JSON.stringify(expectedBody));
            done();
        })
    })
}

function testManagerSessions(email, password, name, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            password: password,
        };
        agent.post('/api/managerSessions').send(body).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            if (expectedHTTPStatus == 200) {
                JSON.stringify(res.body).should.equal(JSON.stringify({id: res.body.id, username: email,name: name}));
            }
            else {
                res.body.should.equal("Unauthorized (wrong username and/or password)");
            }
            done();
        })
    })
}

function testCustomerSessions(email, password, name, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            password: password,
        };
        agent.post('/api/customerSessions').send(body).then(function (res) {
            if (expectedHTTPStatus == 200) {
                JSON.stringify(res.body).should.equal(JSON.stringify({id: res.body.id, username: email,name: name}));
            }
            else {
                res.body.should.equal("Unauthorized (wrong username and/or password)");
            }
            done();
        })
    })
}
function testSupplierSessions(email, password, name, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            password: password,
        };
        agent.post('/api/supplierSessions').send(body).then(function (res) {
            if (expectedHTTPStatus == 200) {
                JSON.stringify(res.body).should.equal(JSON.stringify({id: res.body.id, username: email,name: name}));
            }
            else {
                res.body.should.equal("Unauthorized (wrong username and/or password)");
            }
            done();
        })
    })
}
function testClerkSessions(email, password, name, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            password: password,
        };
        agent.post('/api/clerkSessions').send(body).then(function (res) {
            if (expectedHTTPStatus == 200) {
                JSON.stringify(res.body).should.equal(JSON.stringify({id: res.body.id, username: email,name: name}));
            }
            else {
                res.body.should.equal("Unauthorized (wrong username and/or password)");
            }
            done();
        })
    })
}

function testQualityEmployeeSessions(email, password, name, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            password: password,
        };
        agent.post('/api/qualityEmployeeSessions').send(body).then(function (res) {
            if (expectedHTTPStatus == 200) {
                JSON.stringify(res.body).should.equal(JSON.stringify({id: res.body.id, username: email,name: name}));
            }
            else {
                res.body.should.equal("Unauthorized (wrong username and/or password)");
            }
            done();
        })
    })
}

function testDeliveryEmployeeSessions(email, password, name, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            password: password,
        };
        agent.post('/api/deliveryEmployeeSessions').send(body).then(function (res) {
            if (expectedHTTPStatus == 200) {
                JSON.stringify(res.body).should.equal(JSON.stringify({id: res.body.id, username: email,name: name}));
            }
            else {
                res.body.should.equal("Unauthorized (wrong username and/or password)");
            }
            done();
        })
    })
}

function testPostNewUser (name, surname, email, type, password, expectedHTTPStatus, description) {
    it (description, function (done) {
        const body = {
            username: email,
            name: name,
            surname: surname,
            password: password,
            type: type,
        };
        agent.post('/api/newUser').send(body).then(function (res) {
            res.should.have.status(expectedHTTPStatus);
            done();
        })
    })
}

