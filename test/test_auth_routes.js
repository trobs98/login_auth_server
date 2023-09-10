const config = require('./config/test-config');

const chai = require('chai');
const chaihttp = require('chai-http');
const { ResponseStatuses } = require('../models/response-model');
const expect = chai.expect;

const setupTestDB = require('./setup/setupTestDB')(config);
const authHelper = require('../helper/auth-helper')(config);

chai.use(chaihttp);

const TEST_USER_01 = {
    id: 1,
    firstName: 'Test',
    lastName: 'User_01',
    email: 'testuser01@gmail.com',
    password: 'testpassword1234',
    salt: authHelper.createSalt(),
    createDate: Date.now()
};

const TEST_USER_02 = {
    id: 2,
    firstName: 'Test',
    lastName: 'User_02',
    email: 'testuser02@email.com',
    password: 'testpassword1234',
    salt: authHelper.createSalt(),
    createDate: Date.now()
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrow_epoch = Math.trunc(tomorrow.getTime() / 1000);

const TEST_USER_02_COOKIE = {
    id: 1,
    FK_userId: TEST_USER_02.id,
    login_date: Date.now(),
    login_IP: 'thisIP',
    cookie: 'thisismycookie',
    expiry_date: tomorrow_epoch
};

const TEST_NEW_USER_01 = {
    firstName: 'NewTest',
    lastName: 'User_03',
    email: 'newtestuser03@email.com',
    password: 'testpassword1234',
};

const reset_password_details = authHelper.createResetPasswordDetails();
const TEST_USER_02_RESET_PASSWORD = {
    FK_userId: TEST_USER_02.id,
    hash_token: authHelper.createHashPassword(reset_password_details.token, reset_password_details.salt),
    salt: reset_password_details.salt,
    expiration_date: reset_password_details.expiration
};

const TEST_DATABASE_NAME = 'UserTestSchema';

const TEST_DATA_SQL = `
    INSERT INTO UserTestSchema.User VALUES (${TEST_USER_01.id}, '${TEST_USER_01.firstName}', '${TEST_USER_01.lastName}', '${TEST_USER_01.email}', '${authHelper.createHashPassword(TEST_USER_01.password,TEST_USER_01.salt)}', '${TEST_USER_01.salt}', '${TEST_USER_01.createDate}');
    INSERT INTO UserTestSchema.User VALUES (${TEST_USER_02.id}, '${TEST_USER_02.firstName}', '${TEST_USER_02.lastName}', '${TEST_USER_02.email}', '${authHelper.createHashPassword(TEST_USER_02.password,TEST_USER_02.salt)}', '${TEST_USER_02.salt}', '${TEST_USER_02.createDate}');
    INSERT INTO UserTestSchema.UserAudit VALUES (${TEST_USER_02_COOKIE.id}, ${TEST_USER_02_COOKIE.FK_userId}, '${TEST_USER_02_COOKIE.login_date}', '${TEST_USER_02_COOKIE.login_IP}', '${TEST_USER_02_COOKIE.cookie}', '${TEST_USER_02_COOKIE.expiry_date}');
    INSERT INTO UserTestSchema.ResetPasswordToken (FK_userId, hash_token, salt, expiration_date) VALUES (${TEST_USER_02_RESET_PASSWORD.FK_userId}, '${TEST_USER_02_RESET_PASSWORD.hash_token}', '${TEST_USER_02_RESET_PASSWORD.salt}', '${TEST_USER_02_RESET_PASSWORD.expiration_date}');
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
                .end(async (err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('status', ResponseStatuses.success);
                    expect(res).to.have.cookie(config.server.COOKIE_NAME);
                    done();
                });
        });
        it('Fails - Bad Request', (done) => {
            chai.request(app)
                .post('/session/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: null,
                    password: TEST_USER_01.password
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', ResponseStatuses.failure);
                    expect(res).to.not.have.cookie(config.server.COOKIE_NAME);
                    done();
                });
        });
        it('Fails - Unauthorized', (done) => {
            chai.request(app)
                .post('/session/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: 'bademail@email.com',
                    password: 'badpassword'
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('status', ResponseStatuses.failure);
                    expect(res).to.not.have.cookie(config.server.COOKIE_NAME);
                    done();
                });
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
                    firstName: TEST_NEW_USER_01.firstName,
                    lastName: TEST_NEW_USER_01.lastName
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('status', ResponseStatuses.success);
                    done();
                });
        });
        it('Fails - Bad Request: Missing email', (done) => {
            chai.request(app)
                .post('/session/signup')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: null,
                    password: TEST_NEW_USER_01.password,
                    firstName: TEST_NEW_USER_01.firstName,
                    lastName: TEST_NEW_USER_01.lastName
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', ResponseStatuses.failure);
                    done();
                });
        });
        it('Fails - Bad Request: Account already exists', (done) => {
            chai.request(app)
                .post('/session/signup')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: TEST_NEW_USER_01.email,
                    password: TEST_NEW_USER_01.password,
                    firstName: TEST_NEW_USER_01.firstName,
                    lastName: TEST_NEW_USER_01.lastName
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', ResponseStatuses.failure);
                    done();
                });
        });
    });

    describe('DELETE - /session/logout', () => {
        it('Success', (done) => {
            chai.request(app)
                .delete('/session/logout')
                .set('Cookie', `${config.server.COOKIE_NAME}=${TEST_USER_02_COOKIE.cookie}; Path=/; HttpOnly`)
                .send()
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('status', ResponseStatuses.success);
                    expect(res).to.not.have.cookie(config.server.COOKIE_NAME);
                    done();
                });
        });
        it('Fails - Not Found', (done) => {
            chai.request(app)
                .delete('/session/logout')
                .set('Cookie', '')
                .send()
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('status', ResponseStatuses.failure);
                    done();
                });
        });
    });

    describe('POST - /session/forgotpassword', () => {
        // Requires a slighly longer timeout than default
        it('Success', (done) => {
            chai.request(app)
                .post('/session/forgotpassword')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: TEST_USER_01.email
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('status', ResponseStatuses.success);
                    done();
                });
        }).timeout(5000);
        it('Fails - Bad Request', (done) => {
            chai.request(app)
                .post('/session/forgotpassword')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    email: null
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('status', ResponseStatuses.failure);
                    done();
                });
        });
    });

    describe('POST - /session/resetpassword', () => {
        it('Success', (done) => {
            chai.request(app)
            .post('/session/resetpassword')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                userId: TEST_USER_02.id,
                password: "ThisIsMyNewPassword",
                token: reset_password_details.token
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('status', ResponseStatuses.success);
                done();
            });
        });
        it('Fails - Bad Request', (done) => {
            chai.request(app)
            .post('/session/resetpassword')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                userId: TEST_USER_02.id,
                password: "",
                token: reset_password_details.token
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('status', ResponseStatuses.failure);
                done();
            });
        });
    });
})