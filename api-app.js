module.exports = (config) => {
    const authRoutes = require('./routes/auth-routes')(config);
    const authRequest = require('./middleware/authenticate')(config);

    const express = require('express');
    const cors = require('cors');
    const cookieParser = require('cookie-parser');

    const app = express();
    app.use(cors());

    // parse requests of content-type - application/json
    app.use(express.json());

    // parse requests of content-type - application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(authRequest);
    app.use('/session/', authRoutes);

    // Catch-all route that responds as a 404 - MUST BE LAST MIDDLEWARE
    app.use((req, res) => {
        res.status(404).send(`Request ${req.protocol}://${req.get('host')}${req.originalUrl} not found.`);
    });

    return app;
};
