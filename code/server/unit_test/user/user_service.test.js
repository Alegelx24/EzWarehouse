const { createTestScheduler } = require('jest');
const UserService = require('../../api/user/users_service.js');
const dao = require('../../api/user/user_dao');
const user_service = new UserService(dao);

describe("Test user", () => {
    let user1 = {
        name: 'Jim',
        surname: 'Halpert',
        email: 'jim.halpert@ezwh.com',
        type: 'supplier',
        password: 'password1',
    }

    let user2 = {
        name: 'Dwight',
        surname: 'Shrute',
        email: 'dwight.shrute@ezwh.com',
        type: 'supplier',
        password: 'password1',
    }

    let user3 = {
        name: 'Michael',
        surname: 'Scott',
        email: 'michael.scott@ezwh.com',
        type: 'clerk',
        password: 'password1',
    }

    let user4 = {
        name: 'Robert',
        surname: 'California',
        email: 'robert.california@ezwh.com',
        type: 'supplier',
        password: 'password1',
    }

    beforeEach(async () => {
        await dao.deleteAllUsers();
        await dao.newUser(user1.name, user1.surname, user1.email, user1.type, user1.password); // Jim Halpert
        await dao.newUser(user2.name, user2.surname, user2.email, user2.type, user2.password); // Dwitght Shrute
        await dao.newUser(user3.name, user3.surname, user3.email, user3.type, user3.password); // Michael Scott
        await dao.newUser(user4.name, user4.surname, user4.email, user4.type, user4.password); // Robert California    
    });

    testGetAllUsers(user1, user2, user3, user4);
    testUsersByType('clerk', user3);
    testGetSuppliers();
    testUpdateType('qualityEmployee', user1);
    testDeleteUser(user3);
    afterAll(async () => {
        await dao.deleteAllUsers();
    })
});

async function testDeleteUser(user1) {
    test('Delete user', async () => {
        await user_service.deleteUser(user1.email, user1.type);
        let res = await user_service.getUsersByType('clerk');
        expect(res).toEqual([]);
    });
}

async function testGetAllUsers(user1, user2, user3, user4) {
    test('Get all users.', async () => {
        let res = await user_service.getAllUsers();
        expect(typeof(res[0].id)).toEqual("number");
        expect(typeof(res[1].id)).toEqual("number");
        expect(typeof(res[2].id)).toEqual("number");
        expect(typeof(res[3].id)).toEqual("number");
        expect(res).toEqual(
            [{
                id: res[0].id,
                name: user1.name,
                surname: user1.surname,
                email: user1.email,
                type: user1.type
            },
            {
                id: res[1].id,
                name: user2.name,
                surname: user2.surname,
                email: user2.email,
                type: user2.type
            },
            {
                id: res[2].id,
                name: user3.name,
                surname: user3.surname,
                email: user3.email,
                type: user3.type
            },
            {
                id: res[3].id,
                name: user4.name,
                surname: user4.surname,
                email: user4.email,
                type: user4.type
            }]
        );
    });
}


async function testGetSuppliers() {
    test('Get all suppliers.', async () => {
        let res = await user_service.getSuppliers();
        expect(typeof(res[0].id)).toEqual("number");
        let expected_result = await user_service.getUsersByType('supplier');
        for (var i=0; i<expected_result.length; i++) {
            delete expected_result[i].type;
        }
        expect(res).toEqual(expected_result);
    });
}

async function testUpdateType(newType, user1) {
    test('Update user type.', async () => {
        await user_service.updateType(user1.email, user1.type, newType);
        let res = await user_service.getUsersByType(newType);
        expect(typeof(res[0].id)).toEqual("number");
        expect(res).toEqual(
            [{
                id: res[0].id,
                name: user1.name,
                surname: user1.surname,
                email: user1.email,
                type: newType
            }]
        )
    })
}

async function testUsersByType(type, user1) {
    test('Get users by type.', async () => {
        let res = await user_service.getUsersByType(type);
        expect(typeof(res[0].id)).toEqual("number");
        expect(res).toEqual(
            [{
                id: res[0].id,
                name: user1.name,
                surname: user1.surname,
                email: user1.email,
                type: user1.type
            }]
        );
    });
}

