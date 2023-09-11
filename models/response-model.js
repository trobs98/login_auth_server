// Utilizes JSend rules https://github.com/omniti-labs/jsend

const RESPONSE_STATUS = {
    'success': 'success',
    'failure': 'fail',
    'error': 'error'
};

class APIResponse {
    constructor (data, status) {
        this._data = data;
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
        super(data, RESPONSE_STATUS.success);
    }
}

class FailureResponse extends APIResponse {
    constructor (data) {
        super(data, RESPONSE_STATUS.failure);
    }
}

class ErrorResponse extends APIResponse {
    constructor (data) {
        super(data, RESPONSE_STATUS.error);
    }
}

module.exports = {
    SuccessResponse: SuccessResponse,
    FailureResponse: FailureResponse,
    ErrorResponse: ErrorResponse,
    ResponseStatuses: RESPONSE_STATUS
}