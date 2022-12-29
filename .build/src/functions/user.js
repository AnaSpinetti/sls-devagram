"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUser = exports.getUserById = exports.update = exports.me = void 0;
var UserModel_1 = require("../models/UserModel");
var S3Services_1 = require("../services/S3Services");
var authenticationHandlerUtil_1 = require("../utils/authenticationHandlerUtil");
var formatResponseUtil_1 = require("../utils/formatResponseUtil");
var aws_multipart_parser_1 = require("aws-multipart-parser");
var Regexes_1 = require("../constants/Regexes");
var environmentsUtils_1 = require("../utils/environmentsUtils");
var me = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, AVATAR_BUCKET, error, userId, user, url, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_TABLE', 'AVATAR_BUCKET']), AVATAR_BUCKET = _a.AVATAR_BUCKET, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                userId = (0, authenticationHandlerUtil_1.getUserIdFromEvent)(event);
                if (!userId) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                return [4 /*yield*/, UserModel_1.UserModel.get({ 'cognitoId': userId })];
            case 1:
                user = _b.sent();
                if (!(user && user.avatar)) return [3 /*break*/, 3];
                return [4 /*yield*/, new S3Services_1.S3Service().getImageURL(AVATAR_BUCKET, user.avatar)];
            case 2:
                url = _b.sent();
                user.avatar = url;
                user.password = null;
                _b.label = 3;
            case 3: return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, undefined, user)];
            case 4:
                e_1 = _b.sent();
                console.log('Error on request login: ', e_1);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao realizar o login: ' + e_1)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.me = me;
var update = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, AVATAR_BUCKET, error, userId, user, formData, file, name, newKey, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_TABLE', 'AVATAR_BUCKET']), AVATAR_BUCKET = _a.AVATAR_BUCKET, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                if (!event.body) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Parâmetros de entrada inválidos')];
                }
                userId = (0, authenticationHandlerUtil_1.getUserIdFromEvent)(event);
                if (!userId) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                return [4 /*yield*/, UserModel_1.UserModel.get({ 'cognitoId': userId })];
            case 1:
                user = _b.sent();
                formData = (0, aws_multipart_parser_1.parse)(event, true);
                file = formData.file;
                name = formData.name;
                if (name && name.trim().length < 2) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Nome inválido')];
                }
                else if (name) {
                    user.name = name;
                }
                if (!(file && !Regexes_1.imageExtensionAllowed.exec(file.filename))) return [3 /*break*/, 2];
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Extensão inválida')];
            case 2:
                if (!file) return [3 /*break*/, 4];
                return [4 /*yield*/, new S3Services_1.S3Service().saveImage(AVATAR_BUCKET, 'avatar', file)];
            case 3:
                newKey = _b.sent();
                user.avatar = newKey;
                _b.label = 4;
            case 4: return [4 /*yield*/, UserModel_1.UserModel.update(user)];
            case 5:
                _b.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Usuário alterado com sucesso')];
            case 6:
                e_2 = _b.sent();
                console.log('Error on update user: ', e_2);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao atualizar o usuário: ' + e_2)];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.update = update;
var getUserById = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, AVATAR_BUCKET, error, userId, user, url, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_TABLE', 'AVATAR_BUCKET']), AVATAR_BUCKET = _a.AVATAR_BUCKET, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                userId = event.pathParameters.userId;
                if (!userId) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                return [4 /*yield*/, UserModel_1.UserModel.get({ 'cognitoId': userId })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                if (!user.avatar) return [3 /*break*/, 3];
                return [4 /*yield*/, new S3Services_1.S3Service().getImageURL(AVATAR_BUCKET, user.avatar)];
            case 2:
                url = _b.sent();
                user.avatar = url;
                user.password = null;
                _b.label = 3;
            case 3: return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, undefined, user)];
            case 4:
                e_3 = _b.sent();
                console.log('Error on get user by id: ', e_3);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao buscar dados do usuário por Id: ' + e_3)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getUserById = getUserById;
var searchUser = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, AVATAR_BUCKET, error, filter, lastKey, query, result, response, _i, result_1, document, _b, e_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 7, , 8]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_TABLE', 'AVATAR_BUCKET']), AVATAR_BUCKET = _a.AVATAR_BUCKET, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                filter = event.pathParameters.filter;
                if (!filter || filter.length < 3) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Filtro não informado')];
                }
                lastKey = (event.queryStringParameters || '').lastKey;
                query = UserModel_1.UserModel.scan().where("name").contains(filter).or().where("email").contains(filter);
                if (lastKey) {
                    query.startAt({ cognitoId: lastKey });
                }
                return [4 /*yield*/, query.limit(9).exec()];
            case 1:
                result = _c.sent();
                response = {};
                if (!result) return [3 /*break*/, 6];
                response.count = result.count;
                response.lastKey = result.lastKey;
                _i = 0, result_1 = result;
                _c.label = 2;
            case 2:
                if (!(_i < result_1.length)) return [3 /*break*/, 5];
                document = result_1[_i];
                if (!(document && document.avatar)) return [3 /*break*/, 4];
                _b = document;
                return [4 /*yield*/, new S3Services_1.S3Service().getImageURL(AVATAR_BUCKET, document.avatar)];
            case 3:
                _b.avatar = _c.sent();
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                response.data = result;
                _c.label = 6;
            case 6: return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, undefined, response)];
            case 7:
                e_4 = _c.sent();
                console.log('Error on search user: ', e_4);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao buscar usuário: ' + e_4)];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.searchUser = searchUser;
//# sourceMappingURL=user.js.map