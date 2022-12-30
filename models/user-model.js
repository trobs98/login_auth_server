module.exports = class User {
    constructor(id, email, firstName, lastName, createDate, hashPassword, salt) {
        this._id = id;
        this._email = email;
        this._firstName = firstName;
        this._lastName = lastName;
        this._createDate = createDate;
        this._hashPassword = hashPassword;
        this._salt = salt;
    }

    getId() {
        return this._id;
    }
    getEmail() {
        return this._email;
    }
    getFirstName() {
        return this._firstName;
    }
    getLastName() {
        return this._lastName;
    }
    getFullName() {
        return this._firstName + ' ' + this._lastName;
    }
    getDateCreated() {
        return this._createDate;
    }
    getHashPassword() {
        return this._hashPassword;
    }
    getSalt() {
        return this._salt;
    }
}