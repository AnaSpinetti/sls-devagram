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
exports.changePassword = exports.forgotPassword = exports.confirmEmail = exports.register = void 0;
var formatResponseUtil_1 = require("../utils/formatResponseUtil");
var Regexes_1 = require("../constants/Regexes");
var CognitoServices_1 = require("../services/CognitoServices");
var UserModel_1 = require("../models/UserModel");
var aws_multipart_parser_1 = require("aws-multipart-parser");
var S3Services_1 = require("../services/S3Services");
var environmentsUtils_1 = require("../utils/environmentsUtils");
var register = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, USER_POOL_ID, USER_POOL_CLIENT_ID, AVATAR_BUCKET, error, formData, file, name, email, password, cognitoUser, key, user, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_POOL_ID', 'USER_POOL_CLIENT_ID', 'USER_TABLE', 'AVATAR_BUCKET']), USER_POOL_ID = _a.USER_POOL_ID, USER_POOL_CLIENT_ID = _a.USER_POOL_CLIENT_ID, AVATAR_BUCKET = _a.AVATAR_BUCKET, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                if (!event.body) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Parâmetros de entrada não informados')];
                }
                formData = (0, aws_multipart_parser_1.parse)(event, true);
                file = formData.file;
                name = formData.name;
                email = formData.email;
                password = formData.password;
                if (!email || !email.match(Regexes_1.emailRegex)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Email inválido')];
                }
                if (!password || !password.match(Regexes_1.passwordRegex)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Senha inválida, senha deve conter pelo menos um caractér maiúsculo, minúsculo, numérico e especial, além de ter pelo menos oito dígitos.')];
                }
                if (!name || name.trim().length < 2) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Nome inválido')];
                }
                if (file && !Regexes_1.imageExtensionAllowed.exec(file.filename)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Extensão inválida')];
                }
                return [4 /*yield*/, new CognitoServices_1.CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).signUp(email, password)];
            case 1:
                cognitoUser = _b.sent();
                key = '';
                if (!file) return [3 /*break*/, 3];
                return [4 /*yield*/, new S3Services_1.S3Service().saveImage(AVATAR_BUCKET, 'avatar', file)];
            case 2:
                key = _b.sent();
                _b.label = 3;
            case 3:
                user = {
                    name: name,
                    email: email,
                    password: password,
                    avatar: key,
                    cognitoId: cognitoUser.userSub,
                };
                return [4 /*yield*/, UserModel_1.UserModel.create(user)];
            case 4:
                _b.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Usuario cadastrado com sucesso, verifique seu email para confirmar o codigo!')];
            case 5:
                error_1 = _b.sent();
                console.log('Error on register user: ', error_1);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao cadastrar usuário, tente novamente' + error_1)];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.register = register;
var confirmEmail = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, USER_POOL_ID, USER_POOL_CLIENT_ID, error, request, email, verificationCode, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_POOL_ID', 'USER_POOL_CLIENT_ID']), USER_POOL_ID = _a.USER_POOL_ID, USER_POOL_CLIENT_ID = _a.USER_POOL_CLIENT_ID, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                if (!event.body) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Parâmetros de entrada não informados')];
                }
                request = JSON.parse(event.body);
                email = request.email, verificationCode = request.verificationCode;
                if (!email || !email.match(Regexes_1.emailRegex)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Email inválido')];
                }
                if (!verificationCode || verificationCode.length !== 6) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Código de confirmação inválido')];
                }
                return [4 /*yield*/, new CognitoServices_1.CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).confirmEmail(email, verificationCode)];
            case 1:
                _b.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Email confirmado com sucesso!')];
            case 2:
                e_1 = _b.sent();
                console.log('Error on confirm user email: ', e_1);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao confirmar email do usuário: ' + e_1)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.confirmEmail = confirmEmail;
var forgotPassword = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, USER_POOL_ID, USER_POOL_CLIENT_ID, error, request, email, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_POOL_ID', 'USER_POOL_CLIENT_ID']), USER_POOL_ID = _a.USER_POOL_ID, USER_POOL_CLIENT_ID = _a.USER_POOL_CLIENT_ID, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                if (!event.body) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Parâmetros de entrada não informados')];
                }
                request = JSON.parse(event.body);
                email = request.email;
                if (!email || !email.match(Regexes_1.emailRegex)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Email inválido')];
                }
                return [4 /*yield*/, new CognitoServices_1.CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).forgotPassword(email)];
            case 1:
                _b.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Solicitação de troca de senha enviada com sucesso!')];
            case 2:
                e_2 = _b.sent();
                console.log('Error on request forgot password: ', e_2);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao solicitar troca de senha: ' + e_2)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.forgotPassword = forgotPassword;
var changePassword = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, USER_POOL_ID, USER_POOL_CLIENT_ID, error, request, email, verificationCode, password, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = (0, environmentsUtils_1.validateEnvs)(['USER_POOL_ID', 'USER_POOL_CLIENT_ID']), USER_POOL_ID = _a.USER_POOL_ID, USER_POOL_CLIENT_ID = _a.USER_POOL_CLIENT_ID, error = _a.error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                if (!event.body) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Parâmetros de entrada não informados')];
                }
                request = JSON.parse(event.body);
                email = request.email, verificationCode = request.verificationCode, password = request.password;
                if (!email || !email.match(Regexes_1.emailRegex)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Email inválido')];
                }
                if (!password || !password.match(Regexes_1.passwordRegex)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Senha inválida, senha deve conter pelo menos um caractér maiúsculo, minúsculo, numérico e especial, além de ter pelo menos oito dígitos.')];
                }
                if (!verificationCode || verificationCode.length !== 6) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Código inválido')];
                }
                return [4 /*yield*/, new CognitoServices_1.CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).changePassword(email, password, verificationCode)];
            case 1:
                _b.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Senha alterada com sucesso!')];
            case 2:
                e_3 = _b.sent();
                console.log('Error on request change password: ', e_3);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao alterar a senha: ' + e_3)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.changePassword = changePassword;
//# sourceMappingURL=auth.js.map