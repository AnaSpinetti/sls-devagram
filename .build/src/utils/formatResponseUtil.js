"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDefaultResponse = void 0;
var formatDefaultResponse = function (statusCode, message, response) {
    var defaultMessage = {};
    if (message && (statusCode >= 200 && statusCode <= 399)) {
        defaultMessage.msg = message;
    }
    else if (message) {
        defaultMessage.error = message;
    }
    return {
        headers: {
            "content-type": "application/json"
        },
        statusCode: statusCode,
        body: JSON.stringify(response || defaultMessage)
    };
};
exports.formatDefaultResponse = formatDefaultResponse;
//# sourceMappingURL=formatResponseUtil.js.map