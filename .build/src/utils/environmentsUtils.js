"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvs = void 0;
var validateEnvs = function (envs) {
    var result = {};
    for (var _i = 0, envs_1 = envs; _i < envs_1.length; _i++) {
        var e = envs_1[_i];
        var env = process.env[e];
        if (!env) {
            result.error = "ENV ".concat(e, " n\u00E3o encontrada");
            return result;
        }
        result[e] = env;
    }
    return result;
};
exports.validateEnvs = validateEnvs;
//# sourceMappingURL=environmentsUtils.js.map