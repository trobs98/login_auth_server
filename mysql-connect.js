const mysql = require('mysql');
const connections = require('./config/mysql-connections');

let connection = mysql.createConnection(connections.Connection);
let authConnection = mysql.createConnection(connections.AuthConnection);

/* A query function that sends a query to the main database
 *
 * @param query(String) the query string that will be executed where values should be replaced with a '?' in query
 * @param values(String[]) the values that will be inserted into value placeholders when query executes, as strings in an array
 * @return a promise that either resolves the results and the fields or rejects with an error
 */
let query = (query, values) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results, fields) => {
            if (error) reject(error);
            else {
                resolve({'results': results, 'fields': fields});
            }
        });
    })
};

/* A query function that sends a query to the Auth database
 *
 * @param query(String) the query string that will be executed where values should be replaced with a '?' in query
 * @param values(String[]) the values that will be inserted into value placeholders when query executes, as strings in an array
 * @return a promise that either resolves the results and the fields or rejects with an error
 */
let authQuery = (query, values) => {
    console.log('query: ', query);
    console.log('value: ', values);
    return new Promise((resolve, reject) => {
        authConnection.query(query, values, (error, results, fields) => {
            if (error) reject(error);
            else {
                resolve({'results': results, 'fields': fields});
            }
        });
    })
};

let endConnections = () => {
    connection.end((err) => {
        if (err) throw err;
    });
    authConnection.end((err) => {
        if (err) throw err;
    });
    return;
}

module.exports = {
    query: query,
    authQuery: authQuery,
    endConnections: endConnections
}