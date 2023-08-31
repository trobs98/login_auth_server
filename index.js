const config = require('./config/config');
const PORT = process.env.PORT;

const app = require('./api-app')(config);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});