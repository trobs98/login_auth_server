# Server

This section will describe how to setup the server and how to work the server API


## Setup - WSL2 - Ubuntu

Install NVM, NodeJS 16.13.2 and NPM version
```shell
sudo apt update && sudo apt upgrade
sudo apt-get install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install 16.13.2
```

Verify that NodeJS and NPM are installed
```shell
node -v
npm -v
```

Inside this folder, install the node modules
```shell
npm install
```

Inside this folder, create a **.env** file
```shell
touch .env
```

In the **.env** file, add the following key/value pairs and replace the *COOKIE_TOKEN_SECRET* value with your secret, and replace the *CLIENT_URL* value with you frontend URL
```sh
COOKIE_TOKEN_SECRET='<SECRET>'
COOKIE_NAME='AUTH_TOKEN'
CLIENT_URL = '<FRONTEND URL>'
```

Inside this folder, create a **config** folder, and inside the config folder, create a **email-config.js** file and **mysql-config.js** file
```shell
mkdir config
cd config
touch email-config.js
touch mysql-config.js
```

In the **email-config.js**, add the following code and replace the *host*, *port*, *user* and *password* with your SMTP email credentials
```javascript
module.exports = {
    host: '<SMTP HOST>',
    port: '<SMTP PORT>',
    auth: {
        user: '<SMTP USERNAME>',
        pass: '<SMTP PASSWORD>'
    }
};
```

In the **mysql-config.js**, add the following code and replace the *host*, *user*, *password*, *database* and *port* with your MySQL credentials (Config is split into the database you'd use for your normal application storage and the database you'd use for your auth storage)
```javascript
module.exports = {
    'Connection' : {
        host     : '<HOSTNAME>',
        user     : '<USERNAME>',
        password : '<PASSWORD>',
        database : '<DB NAME>',
        port     : '<PORT>'
    },
    
    'AuthConnection' : {
        host     : '<AUTH HOSTNAME>',
        user     : '<AUTH USERNAME>',
        password : '<AUTH PASSWORD>',
        database : '<AUTH DB NAME>',
        port     : '<AUTH PORT>'
    }
};
```

Now to start the server run the following
```shell
npm start
```


## API Documentation