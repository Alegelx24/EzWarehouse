'use strict';
const sqlite = require("sqlite3");

const db = new sqlite.Database('database.sqlite', (err)=> {
  if(err) throw err;
});

exports.newUser = (name, surname, email, type, password) => {
  return new Promise((resolve, reject) => {
    const sql = 
      `INSERT INTO User(name, surname, email, type, password)
      VALUES (?,?,?,?,?);`;
    
    db.run(sql, [name, surname, email, type, password], function (err) {
      if (err) {
        reject(err);
        return;
      }
      else {
        resolve(this.lastID)
      }
    });
  })
}


exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
      const sql_query = "SELECT * FROM 'User' WHERE email==?"; 
      db.get(sql_query, [email], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        else {
          if(row === undefined) {
            resolve(undefined);
            return;
          }
          const user = {
            id:       row.id,
            name:     row.name,
            surname:  row.surname,
            email:    row.email,
            password: row.password,
            type:     row.type,
          };
          resolve(user);
          return;
        }
      });
    })
}

exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql_query = "SELECT * FROM 'User' WHERE type != 'manager'";
    db.all(sql_query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      else {
        if(rows === undefined) {
          resolve(undefined);
          return;
        }
        const users = rows.map((row) => ({
          id: row.id,
          name: row.name,
          surname: row.surname,
          email: row.email,
          type: row.type,
        }));
        resolve(users);
        return;
      }
    });
  })
}

exports.getUsersByType = (type) => {
  return new Promise((resolve, reject) => {
    const sql_query = "SELECT * FROM 'User' WHERE type==?";
    db.all(sql_query, [type], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      else {
        if(rows === undefined) {
          resolve(undefined);
          return;
        }
        const users = rows.map((row) => ({
          id: row.id,
          name: row.name,
          surname: row.surname,
          email: row.email,
          type: row.type,
        }));
        resolve(users);
        return;
      }
    });
  })

}

  exports.updateType = (username, oldType, newType) => {
    return new Promise((resolve, reject) => {
      const sql_query = "UPDATE User SET type=? WHERE email == ? AND type == ?";
      db.run(sql_query, [newType, username, oldType], (err) => {
        if (err) {
            reject(err);
            return;
        }
        else {
          resolve(true);
        }
      });
    })
  }

  exports.deleteUser = (username, type) => {
    return new Promise ((resolve, reject) => {
      const sql_query = "DELETE FROM User WHERE email == ? AND type == ?";
      db.run(sql_query, [username, type], (err) => {
        if (err) {
          reject(err);
          return;
        }
        else {
          resolve(true);
        }
      });
    })
  }


  exports.deleteAllUsers = () => {
    return new Promise ((resolve, reject) => {
      const sql_query = "DELETE FROM User";
      db.run(sql_query, [], (err) => {
        if (err) {
          reject(err);
          return;  
        }
        else {
          resolve(true);
        }
      });
    })
  }