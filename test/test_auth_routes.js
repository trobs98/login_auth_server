const config = require('./config/test-config');

const chai = require('chai');
const chaihttp = require('chai-http');
const expect = chai.expect;

const setupTestDB = require('./setup/setupTestDB')(config);
const authHelper = require('../helper/auth-helper')(config);

chai.use(chaihttp);

const TEST_USER_01 = {
    id: 1,
    firstName: 'Test',
    lastName: 'User_01',
    email: 'testuser01@email.com',
    password: 'testpassword1234',
    salt: authHelper.createSalt(),
    createDate: Date.now()
};

const TEST_NEW_USER_01 = {
    firstName: 'NewTest',
    lastName: 'User_02',
    email: 'newtestuser02@email.com',
    password: 'testpassword1234',
};

const TEST_DATABASE_NAME = 'UserTestSchema';

const TEST_DATA_SQL = `
    INSERT INTO UserTestSchema.User VALUES (${TEST_USER_01.id}, '${TEST_USER_01.firstName}', '${TEST_USER_01.lastName}', '${TEST_USER_01.email}', '${authHelper.createHashPassword(TEST_USER_01.password,TEST_USER_01.salt)}', '${TEST_USER_01.salt}', '${TEST_USER_01.createDate}');
`;

describe('Auth Routes', () => {
    before(async () => {
        await setupTestDB.setupUserDb(TEST_DATA_SQL);
    });
    
    
    after(async () => {
        await setupTestDB.deleteUserDb();
    });

    // Add test database name to new config now that it exists
    let appConfig = JSON.parse(JSON.stringify(config));
    appConfig.mysql.AuthConnection.database = TEST_DATABASE_NAME;
    
    const app = require('../api-app')(appConfig);
    const AuthRoutes = require('../routes/auth-routes')(appConfig);

    describe('POST - /session/login', () => {
        it('Succeeds', (done) => {
            chai.request(app)
                .post('/session/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: TEST_USER_01.email,
                    password: TEST_USER_01.password
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res)
                    done();
                })
        });
    });

    describe('POST - /session/signup', () => {
        it('Succeeds', (done) => {
            chai.request(app)
                .post('/session/signup')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: TEST_NEW_USER_01.email,
                    password: TEST_NEW_USER_01.password,
                    firstname: TEST_NEW_USER_01.firstName,
                    lastName: TEST_NEW_USER_01.lastName
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                })
        });
    });
})