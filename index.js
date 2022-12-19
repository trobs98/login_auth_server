const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth-routes');
const authLog = require('./middleware/auth-log');
const authRequest = require('./middleware/authenticate');

const app = express();
  
app.use(cors({'credentials': true, origin: true}));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(authRequest);
app.use(authLog);
app.use('/session/', authRoutes);