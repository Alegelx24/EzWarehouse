class UsersService {
    dao;
    bcrypt;
    salt_rounds
    name_regex = new RegExp(/([A-Z]{1}[a-z]{1,10}\s*){1,3}/);
    email_regex = new RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    password_regex = new RegExp(/.{8,20}/);
    type_regex = new RegExp(/customer|qualityEmployee|clerk|deliveryEmployee|supplier/);
    constructor (dao) {
        this.dao = dao;
        this.bcrypt = require("bcrypt");
        this.salt_rounds = 10;
    }

    newUser = async (name, surname, email, type, password) => {
        if (this.email_regex.test(email) & this.type_regex.test(type)) { // check if email and types are ok.
            // check if there's a user in the db with same email and type.
            const user = await this.dao.getUserByEmail(email);
            if (user === undefined || user.type != type) { // if user is defined then check the type. If user is undefined then go straight in.
                if (this.name_regex.test(name) & this.name_regex.test(surname) & this.password_regex.test(password)) {
                    const hash = this.bcrypt.hashSync(password, this.salt_rounds);
                    const new_user = await this.dao.newUser(name, surname, email, type, hash);
                    if (new_user === undefined) {
                        return 503; //error
                    }
                    else {
                        return 201; //success
                    }
                }
                else {
                    return 422;
                }
            }
            else {
                return 409; // Conflict
            }
        }
        else
        {
            return 422;
        }
    }

    newAdmin = async (name, surname, email, password) => {
        if (this.email_regex.test(email)) { // check if email and types are ok.
            // check if there's a user in the db with same email and type.
            const user = await this.dao.getUserByEmail(email);
            if (user === undefined || user.type != "manager") { // if user is defined then check the type. If user is undefined then go straight in.
                if (this.name_regex.test(name) & this.name_regex.test(surname) & this.password_regex.test(password)) {
                    const hash = this.bcrypt.hashSync(password, this.salt_rounds);
                    const new_user = await this.dao.newUser(name, surname, email, "manager", hash);
                    if (new_user === undefined) {
                        return 503; //error
                    }
                    else {
                        return 201; //success
                    }
                }
                else {
                    return 422;
                }
            }
            else {
                return 409; // Conflict
            }
        }
        else
        {
            return 422;
        }
    }

    getUsersByType = async (type) => {
        if (this.type_regex.test(type)) {
            const users = await this.dao.getUsersByType(type);
            return users;
        }
        else {
            return undefined;
        }
    }

    getAllUsers = async () => {
        const users = await this.dao.getAllUsers();
        if (users === undefined) {
            return 500;
        }
        else {
            return users;
        }
    }

    getSuppliers = async () => {
        const suppliers = await this.dao.getUsersByType('supplier');
        suppliers.forEach(supplier => {
            delete supplier.type;
        })
        if (suppliers === undefined) {
            return 500;
        }
        else {
            return suppliers;
        }
    }

    login = async (email, password, type) => {
        const user = await this.dao.getUserByEmail(email);
        if (user === undefined || !this.bcrypt.compareSync(password, user.password) || user.type != type) {
            return undefined;
        }
        else {
            return {
                id: user.id,
                username: user.email,
                name: user.name,
            };
        }
    }
    
    updateType = async (email, oldType, newType) => {
        if ( this.email_regex.test(email) & this.type_regex.test(oldType) & this.type_regex.test(newType) & oldType != 'manager') {
            const user = await this.dao.getUserByEmail(email);
            if (user === undefined || user.type != oldType ) {
                return 404;
            }
            const result = await this.dao.updateType(email, oldType, newType);
            if (result === true) {
                return 200;
            }
            else {
                return 503;
            }
        }
        else {
            return 422;
        }
    }

    deleteUser = async (email, type) => {
        if (this.email_regex.test(email) & this.type_regex.test(type) & type != 'manager') {
            const user = await this.dao.getUserByEmail(email);
            if (user === undefined) {
                return 204; // If the user doesn't exists the api should still return 204 according to the requirements.
            }
            else if (user.type != type ) {
                return 422;
            }
            else {
                const result = await this.dao.deleteUser(email, type);
                if (result) {
                    return 204;
                }
                else {
                    return 503;
                }
            }
        }
        else {
            return 422;
        }
    }
}





module.exports = UsersService;