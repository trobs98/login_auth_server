const HttpStatusCodes = require('http-status-codes');

class ExtendableError {
    constructor(message, code) {
        if (new.target ===  ExtendableError) {
            throw new TypeError('Abstract class "ExtendableError" cannot be instantiated.');
        }
        this.name = this.constructor.name;
        this.message = message;
        this.code = code;
    }
}

class BadRequestError extends ExtendableError {
    constructor(message) {
        if (arguments.length === 0) {
            super('Bad Request Error', HttpStatusCodes.StatusCodes.BAD_REQUEST);
        }
        else {
            super(message, HttpStatusCodes.StatusCodes.BAD_REQUEST);
        }
    }
}

class UnauthorizedError extends ExtendableError {
    constructor(message) {
        if (arguments.length === 0) {
            super('Unauthorized Error', HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        }
        else {
            super(message, HttpStatusCodes.StatusCodes.UNAUTHORIZED);
        }
    }
}

class ForbiddenError extends ExtendableError {
    constructor(message) {
        if (arguments.length === 0) {
            super('ForbiddenError', HttpStatusCodes.StatusCodes.FORBIDDEN);
        }
        else {
            super(message, HttpStatusCodes.StatusCodes.FORBIDDEN);
        }
    }
}

class InteralServerError extends ExtendableError {
    constructor(message) {
        if (arguments.length === 0) {
            super('InteralServerError', HttpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR);
        }
        else {
            super(message, HttpStatusCodes.StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

class NotFoundError extends ExtendableError {
    constructor(message) {
        if (arguments.length === 0) {
            super('NotFoundError', HttpStatusCodes.StatusCodes.NOT_FOUND);
        }
        else {
            super(message, HttpStatusCodes.StatusCodes.NOT_FOUND);
        }
    }
}

module.exports = {
    BadRequestError: BadRequestError,
    UnauthorizedError: UnauthorizedError,
    ForbiddenError: ForbiddenError,
    InteralServerError: InteralServerError,
    NotFoundError: NotFoundError
}