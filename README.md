

# Server

The server is a Node JS API that uses the Express framework. It handles the following routes: 
1. [/session/login](https://github.com/trobs98/login_auth_server/tree/main/#login)    
2. [/session/logout](https://github.com/trobs98/login_auth_server/tree/main/#logout)
3. [/session/signup](https://github.com/trobs98/login_auth_server/tree/main/#sign-up)
4. [/session/forgotpassword](https://github.com/trobs98/login_auth_server/tree/main/#forgot-password)
5. [/session/resetpassword](https://github.com/trobs98/login_auth_server/tree/main/#reset-password)

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

Inside this folder, create a **config** folder, and inside the config folder, create a **config.js** file
```shell
mkdir config
cd config
touch config.js
```

In the **config.js**, add the following code and replace with following:<br><br>
**server** - the *COOKIE_TOKEN_SECRET* and *USER_DATA_COOKIE_TOKEN_SECRET* with corresponding secret strings, the *COOKIE_NAME* with the name the auth cookie will be and the *CLIENT_URL* with the URL a client is running on that is using the server<br><br>
**mysql** - the *host*, *user*, *password*, *database* and *port* with your MySQL credentials (Config is split into the database you'd use for your normal application storage and the database you'd use for your auth storage)<br><br>
**email** - the *host*, *port*, *user* and *password* with your SMTP email credentials<br><br>

```javascript
module.exports = {
    server: {
        COOKIE_TOKEN_SECRET: '<COOKIE TOKEN SECRET>',
        USER_DATA_COOKIE_TOKEN_SECRET: '<USER DATA COOKIE TOKEN SECRET>',
        COOKIE_NAME: '<NAME>',
        CLIENT_URL: '<URL>'
    },
    mysql: {
        'Connection' : {
            host     : '<HOSTNAME>',
            user     : '<USERNAME>',
            password : '<PASSWORD>',
            database : '<DB NAME>',
            port     : '<PORT>',
            multipleStatements: true
        },
        
        'AuthConnection' : {
            host     : '<AUTH HOSTNAME>',
            user     : '<AUTH USERNAME>',
            password : '<AUTH PASSWORD>',
            database : '<AUTH DB NAME>',
            port     : '<AUTH PORT>',
            multipleStatements: true
        }
    },
    email: {
        host: '<SMTP HOST>',
        port: '<SMTP PORT>',
        auth: {
            user: '<SMTP USERNAME>',
            pass: '<SMTP PASSWORD>'
        }
    }
};
```
This is the Schema that is required to run the server. Ensure that it is setup
https://github.com/trobs98/login_auth_schema 
<br><br>

Now to start the server run the following
```shell
npm start
```

## Testing
The test cases are located in the **test** folder and are written using mocha (https://mochajs.org/) and chai (https://www.chaijs.com/) 

### Setup & Run
To setup the test cases, inside the **test** folder create a **config** folder, and inside the config folder, create a **test-config.js** file
```shell
cd test
mkdir config
cd config
touch test-config.js
```

The test config follows the same format as the regular config file, so copy the contents of regular config file into the test config and replace the code with their corresponding values

```javascript
module.exports = {
    server: {
        COOKIE_TOKEN_SECRET: '<COOKIE TOKEN SECRET>',
        USER_DATA_COOKIE_TOKEN_SECRET: '<USER DATA COOKIE TOKEN SECRET>',
        COOKIE_NAME: '<NAME>',
        CLIENT_URL: '<URL>'
    },
    mysql: {
        'Connection' : {
            host     : '<HOSTNAME>',
            user     : '<USERNAME>',
            password : '<PASSWORD>',
            database : '<DB NAME>',
            port     : '<PORT>',
            multipleStatements: true
        },
        
        'AuthConnection' : {
            host     : '<AUTH HOSTNAME>',
            user     : '<AUTH USERNAME>',
            password : '<AUTH PASSWORD>',
            database : '<AUTH DB NAME>',
            port     : '<AUTH PORT>',
            multipleStatements: true
        }
    },
    email: {
        host: '<SMTP HOST>',
        port: '<SMTP PORT>',
        auth: {
            user: '<SMTP USERNAME>',
            pass: '<SMTP PASSWORD>'
        }
    }
};
```

Now to run the test cases run the following
```shell
npm test
```

The command line should provide information on the success of the test cases, and a **coverage** folder will be created, where you can view the code coverage of the test cases.
This can be accessed by opening the index.html file from the folder in a web browser and navigating through the files.

## Linting
To lint this project run the following 
```shell
npm run lint
```

## API Documentation
The API Documentation will describe each endpoint, as well as potential responses and status codes
### Login
<table>
    <tr>
        <th> URL </th>
        <td> /session/login </td>
    </tr>
    <tr>
        <th> Method </th>
        <td> POST </td>
    </tr>
    <tr>
        <th> Data Params </th>
        <td>
            <b> REQUIRED: </b>
            <pre>email=[string]      <i>Email is required</i> and <i>Must be an email format</i></pre>
            <pre>password=[string]   <i>Password must be at minimum 8 characters and at maximum 100 characters</i></pre>
        </td>
    </tr>
    <tr>
        <th> Cookie </th>
        <td>
            None
        </td>
    </tr>
    <tr>
        <th> Success Response </th>
        <td>
            Code: 200
            <br>
            Body: 
<pre><code>{ 
    "status": "success", 
    "data": "Successfully logged in." 
}</code></pre>
            Cookie: AUTH_COOKIE:{Token Value}; HttpOnly; 
        </td>
    </tr>
    <tr>
        <th> Error Response </th>
        <td>
            <table>
                <tr>
                    <td>
                        Name: Bad Request Error
                        <br>
                        Code: 400
                        <br>
                        Body:
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "BadRequestError", 
                "message": " Email is required. Must be an email format. 
                             Password must be at minimum 8 characters and 
                             at maximum 100 characters Password must be at 
                             minimum 8 characters and at maximum 100 characters", 
                "code": 400 
             } 
}</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Unauthorized Error
                        <br>
                        Code: 401
                        <br>
                        Body: 
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "UnauthorizedError", 
                "message": "Invalid username or password.", 
                "code": 401 
             } 
 }</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Internal Server Error
                        <br>
                        Code: 500
                        <br>
                        Body: 
<pre><code>{ 
    "status": "error", 
    "data": { 
                "name": "InteralServerError", 
                "message": "Issue logging into your account. Please try again.", 
                "code": 500 
             } 
}</code></pre>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

### Logout
<table>
    <tr>
        <th> URL </th>
        <td> /session/logout </td>
    </tr>
    <tr>
        <th> Method </th>
        <td> DELETE </td>
    </tr>
    <tr>
        <th> Data Params </th>
        <td>
            None
        </td>
    </tr>
    <tr>
        <th> Cookie </th>
        <td>
             Cookie: AUTH_COOKIE:{Token Value}; HttpOnly; 
        </td>
    </tr>
    <tr>
        <th> Success Response </th>
        <td>
            Code: 200
            <br>
            Body: 
<pre><code>{ 
    "status": "success",
    "data": "Successfully logged out."
}</code></pre>
            Cookie: None
        </td>
    </tr>
    <tr>
        <th> Error Response </th>
        <td>
            <table>
                <tr>
                    <td>
                        Name: Not Found Error
                        <br>
                        Code: 404
                        <br>
                        Body: 
<pre><code>{ 
    "status": "fail", 
    "data": {
        "name": "NotFoundError",
        "message": "Could not logout, there is no login session.",
        "code": 404
    }
 }</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Internal Server Error
                        <br>
                        Code: 500
                        <br>
                        Body: 
<pre><code>{ 
    "status": "error", 
    "data": { 
                "name": "InteralServerError", 
                "message": "Issue logging out. Please try again later.", 
                "code": 500 
             } 
}</code></pre>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

### Sign Up
<table>
    <tr>
        <th> URL </th>
        <td> /session/signup </td>
    </tr>
    <tr>
        <th> Method </th>
        <td> POST </td>
    </tr>
    <tr>
        <th> Data Params </th>
        <td>
            <b> REQUIRED: </b>
            <pre>email=[string]      <i>Email is required</i> and <i>Must be an email format</i></pre>
            <pre>password=[string]   <i>Password must be at minimum 8 characters and at maximum 100 characters</i></pre>
            <pre>firstName=[string]  <i>First name is required and cannot be longer than 50 characters</i></pre>
            <pre>lastName=[string]  <i>Last name is required and cannot be longer than 50 characters</i></pre>
        </td>
    </tr>
    <tr>
        <th> Cookie </th>
        <td>
             None 
        </td>
    </tr>
    <tr>
        <th> Success Response </th>
        <td>
            Code: 200
            <br>
            Body: 
<pre><code>{ 
    "status": "success",
    "data": "Successfully created account!"
}</code></pre>
            Cookie: None
        </td>
    </tr>
    <tr>
        <th> Error Response </th>
        <td>
            <table>
                <tr>
                    <td>
                        Name: Bad Request Error
                        <br>
                        Code: 400
                        <br>
                        Body:
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "BadRequestError", 
                "message": " Email is required. Must be an email format. 
                            Password must be at minimum 8 characters and 
                            at maximum 100 characters. Password must be at 
                            minimum 8 characters and at maximum 100 characters. 
                            First name is required and cannot be longer than 50 
                            characters. Last name is required and cannot be 
                            longer than 50 characters.", 
                "code": 400 
             } 
}</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Bad Request Error
                        <br>
                        Code: 400
                        <br>
                        Body:
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "BadRequestError", 
                "message": "An account already exisits with the email ${email}, 
                            please create an account using a different email.", 
                "code": 400 
             } 
}</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Internal Server Error
                        <br>
                        Code: 500
                        <br>
                        Body: 
<pre><code>{ 
    "status": "error", 
    "data": { 
                "name": "InteralServerError", 
                "message": "Issue inserting your account. Please try again.", 
                "code": 500 
             } 
}</code></pre>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

### Forgot Password
<table>
    <tr>
        <th> URL </th>
        <td> /session/forgotpassword </td>
    </tr>
    <tr>
        <th> Method </th>
        <td> POST </td>
    </tr>
    <tr>
        <th> Data Params </th>
        <td>
            <b> REQUIRED: </b>
            <pre>email=[string]      <i>Email is required</i> and <i>Must be an email format</i></pre>
        </td>
    </tr>
    <tr>
        <th> Cookie </th>
        <td>
             None 
        </td>
    </tr>
    <tr>
        <th> Success Response </th>
        <td>
            Code: 200
            <br>
            Body: 
<pre><code>{ 
    "status": "success",
    "data": "If an account exists with the email ${email}, then you 
            will recieve an email with a link to reset your passsword."
}</code></pre>
            Cookie: None
        </td>
    </tr>
    <tr>
        <th> Error Response </th>
        <td>
            <table>
                <tr>
                    <td>
                        Name: Bad Request Error
                        <br>
                        Code: 400
                        <br>
                        Body:
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "BadRequestError", 
                "message": " Email is required. Must be an email format.", 
                "code": 400 
             } 
}</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Internal Server Error
                        <br>
                        Code: 500
                        <br>
                        Body: 
<pre><code>{ 
    "status": "error", 
    "data": { 
                "name": "InteralServerError", 
                "message": "Issue sending the forgot password email. Please try again.", 
                "code": 500 
             } 
}</code></pre>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

### Reset Password
<table>
    <tr>
        <th> URL </th>
        <td> /session/resetpassword </td>
    </tr>
    <tr>
        <th> Method </th>
        <td> POST </td>
    </tr>
    <tr>
        <th> Data Params </th>
        <td>
            <b> REQUIRED: </b>
            <pre>userId=[integer]      <i>userId is required</i></pre>
            <pre>password=[string]   <i>Password must be at minimum 8 characters and at maximum 100 characters</i></pre>
            <pre>token=[string]      <i>Token is required</i></pre>
        </td>
    </tr>
    <tr>
        <th> Cookie </th>
        <td>
             None 
        </td>
    </tr>
    <tr>
        <th> Success Response </th>
        <td>
            Code: 200
            <br>
            Body: 
<pre><code>{ 
    "status": "success",
    "data": "Successfully updated password!"
}</code></pre>
            Cookie: None
        </td>
    </tr>
    <tr>
        <th> Error Response </th>
        <td>
            <table>
                <tr>
                    <td>
                        Name: Bad Request Error
                        <br>
                        Code: 400
                        <br>
                        Body:
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "BadRequestError", 
                "message": " UserID is required. Password must be at minimum 
                             8 characters and at maximum 100 characters. 
                             Password must be at minimum 8 characters and at
                             maximum 100 characters. Token is required.", 
                "code": 400 
             } 
}</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Unauthorized Error
                        <br>
                        Code: 401
                        <br>
                        Body: 
<pre><code>{ 
    "status": "fail", 
    "data": { 
                "name": "UnauthorizedError", 
                "message": "Invalid reset password link. Please request a new one.", 
                "code": 401 
             } 
 }</code></pre>
                    </td>
                </tr>
                <tr>
                    <td>
                        Name: Internal Server Error
                        <br>
                        Code: 500
                        <br>
                        Body: 
<pre><code>{ 
    "status": "error", 
    "data": { 
                "name": "InteralServerError", 
                "message": "Issue resetting password. Please try again.", 
                "code": 500 
             } 
}</code></pre>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
