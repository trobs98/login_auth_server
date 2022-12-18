/*
 *  Add the file 'mysql-connections.js to config folder and update
 *  the connection paramaters to include your main database to be the 'Connection'
 *  and the 'AuthConnection' to be your auth database
 */

module.exports = {
    'Connection' : {
        host     : 'host',
        user     : 'user',
        password : 'password',
        database : 'db',
        port     : 'port'
    },
    
    'AuthConnection' : {
        host     : 'host',
        user     : 'user',
        password : 'password',
        database : 'db',
        port     : 'port'
    }
};