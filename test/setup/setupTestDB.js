module.exports = (config) => {
    const mysql = require('mysql');
    const fs = require('fs');
    const path = require('path');

    const mysqlConfig = config.mysql;

    let setupUserDb = (testDataSQL) => {
        return new Promise((resolve, reject) => {
            const testSetupSQL = fs.readFileSync(path.resolve(__dirname, './test-setup.sql')).toString();

            let connect = mysql.createConnection(mysqlConfig.AuthConnection);
            let querySQL = testSetupSQL + testDataSQL;

            connect.query(querySQL, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result)
                }
            });

            connect.end();
        });
    }

    let deleteUserDb = () => {
        return new Promise((resolve, reject) => {
            const testDeleteSQL = fs.readFileSync(path.resolve(__dirname,'./test-delete.sql')).toString();
        
            let connect = mysql.createConnection(mysqlConfig.AuthConnection);
            connect.query(testDeleteSQL, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result)
                }
            });

            connect.end();
        });
    }

    return {
        setupUserDb: setupUserDb,
        deleteUserDb: deleteUserDb
    };
}