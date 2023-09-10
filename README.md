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
