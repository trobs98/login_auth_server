// Utilizes JSend rules https://github.com/omniti-labs/jsend

class APIResponse {
    constructor (data, status) {
        this._data = data;
        this._status = status;
    }

    getData() {
        return this._data;
    }
    setData(data) {
        this._data = data;
    }
    getStatus() {
        return this._status;
    }
    setStatus(status) {
        this._status = status;
    }

    getResponse() {
        return {
            'status': this._status,
            'data': this._data,
        }
    }
}

class SuccessResponse extends APIResponse {
    constructor (data) {
        super(data, 'success');
    }
}

class FailureResponse extends APIResponse {
    constructor (data) {
        super(data, 'fail');
    }
}

class ErrorResponse extends APIResponse {
    constructor (data) {
        super(data, 'error');
    }
}

module.exports = {
    SuccessResponse: SuccessResponse,
    FailureResponse: FailureResponse,
    ErrorResponse: ErrorResponse
}