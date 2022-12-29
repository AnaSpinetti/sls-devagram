"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromEvent = void 0;
var getUserIdFromEvent = function (event) {
    var _a, _b, _c, _d, _e, _f;
    // Verificando se chegou o ID do usuário
    if (!((_c = (_b = (_a = event === null || event === void 0 ? void 0 : event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.jwt) === null || _c === void 0 ? void 0 : _c.claims['sub'])) {
        return null;
    }
    return (_f = (_e = (_d = event === null || event === void 0 ? void 0 : event.requestContext) === null || _d === void 0 ? void 0 : _d.authorizer) === null || _e === void 0 ? void 0 : _e.jwt) === null || _f === void 0 ? void 0 : _f.claims['sub'];
};
exports.getUserIdFromEvent = getUserIdFromEvent;
//# sourceMappingURL=authenticationHandlerUtil.js.map