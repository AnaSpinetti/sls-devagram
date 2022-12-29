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
exports.get = exports.postComment = exports.toggleLike = exports.create = void 0;
var Uuid = require("uuid");
var moment = require("moment");
var UserModel_1 = require("../models/UserModel");
var S3Services_1 = require("../services/S3Services");
var authenticationHandlerUtil_1 = require("../utils/authenticationHandlerUtil");
var formatResponseUtil_1 = require("../utils/formatResponseUtil");
var aws_multipart_parser_1 = require("aws-multipart-parser");
var Regexes_1 = require("../constants/Regexes");
var environmentsUtils_1 = require("../utils/environmentsUtils");
var PostModel_1 = require("../models/PostModel");
var create = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, POST_BUCKET, error, userId, user, formData, file, description, imageKey, post, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = (0, environmentsUtils_1.validateEnvs)(['POST_TABLE', 'POST_BUCKET']), POST_BUCKET = _a.POST_BUCKET, error = _a.error;
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
                if (!user) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                formData = (0, aws_multipart_parser_1.parse)(event, true);
                file = formData.file;
                description = formData.description;
                if (!description || description.trim().length < 5) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Descrição inválida')];
                }
                ;
                if (!file || !Regexes_1.imageExtensionAllowed.exec(file.filename)) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Extensão inválida')];
                }
                ;
                return [4 /*yield*/, new S3Services_1.S3Service().saveImage(POST_BUCKET, 'post', file)];
            case 2:
                imageKey = _b.sent();
                post = {
                    id: Uuid.v4(),
                    userId: userId,
                    description: description,
                    date: moment().format(),
                    image: imageKey
                };
                return [4 /*yield*/, PostModel_1.PostModel.create(post)];
            case 3:
                _b.sent();
                user.posts = user.posts + 1;
                return [4 /*yield*/, UserModel_1.UserModel.update(user)];
            case 4:
                _b.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Publicação criada com sucesso')];
            case 5:
                e_1 = _b.sent();
                console.log('Error on create post: ', e_1);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao criar a publicação: ' + e_1)];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.create = create;
var toggleLike = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var error, userId_1, user, postId, post, hasLikedIndex, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                error = (0, environmentsUtils_1.validateEnvs)(['POST_TABLE']).error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                userId_1 = (0, authenticationHandlerUtil_1.getUserIdFromEvent)(event);
                if (!userId_1) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                return [4 /*yield*/, UserModel_1.UserModel.get({ 'cognitoId': userId_1 })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                postId = event.pathParameters.postId;
                return [4 /*yield*/, PostModel_1.PostModel.get({ id: postId })];
            case 2:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Publicação não encontrada')];
                }
                hasLikedIndex = post.likes.findIndex(function (obj) {
                    var result = obj.toString() === userId_1;
                    return result;
                });
                if (!(hasLikedIndex != -1)) return [3 /*break*/, 4];
                post.likes.splice(hasLikedIndex, 1);
                return [4 /*yield*/, PostModel_1.PostModel.update(post)];
            case 3:
                _a.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Like removido')];
            case 4:
                post.likes.push(userId_1);
                return [4 /*yield*/, PostModel_1.PostModel.update(post)];
            case 5:
                _a.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Like inserido')];
            case 6: return [3 /*break*/, 8];
            case 7:
                e_2 = _a.sent();
                console.log('Error on toggle like: ', e_2);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao curtir/descurtir a publicação: ' + e_2)];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.toggleLike = toggleLike;
var postComment = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var error, userId, user, postId, post, request, comment, commentObj, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                error = (0, environmentsUtils_1.validateEnvs)(['POST_TABLE']).error;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                userId = (0, authenticationHandlerUtil_1.getUserIdFromEvent)(event);
                if (!userId) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                return [4 /*yield*/, UserModel_1.UserModel.get({ 'cognitoId': userId })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                postId = event.pathParameters.postId;
                return [4 /*yield*/, PostModel_1.PostModel.get({ id: postId })];
            case 2:
                post = _a.sent();
                if (!post) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Publicação não encontrada')];
                }
                request = JSON.parse(event.body);
                comment = request.comment;
                if (!comment || comment.length < 2) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Comentário inválido')];
                }
                commentObj = {
                    userId: userId,
                    userName: user.name,
                    date: moment().format(),
                    comment: comment
                };
                post.comments.push(commentObj);
                return [4 /*yield*/, PostModel_1.PostModel.update(post)];
            case 3:
                _a.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, 'Comentário inserido com sucesso')];
            case 4:
                e_3 = _a.sent();
                console.log('Error on post comment: ', e_3);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao comentar a publicação: ' + e_3)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.postComment = postComment;
var get = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, POST_BUCKET, userId, user, postId, post, _b, e_4;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = (0, environmentsUtils_1.validateEnvs)(['POST_TABLE', 'POST_BUCKET']), error = _a.error, POST_BUCKET = _a.POST_BUCKET;
                if (error) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, error)];
                }
                userId = (0, authenticationHandlerUtil_1.getUserIdFromEvent)(event);
                if (!userId) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                return [4 /*yield*/, UserModel_1.UserModel.get({ 'cognitoId': userId })];
            case 1:
                user = _c.sent();
                if (!user) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Usuário não encontrado')];
                }
                postId = event.pathParameters.postId;
                return [4 /*yield*/, PostModel_1.PostModel.get({ id: postId })];
            case 2:
                post = _c.sent();
                if (!post) {
                    return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(400, 'Publicação não encontrada')];
                }
                _b = post;
                return [4 /*yield*/, new S3Services_1.S3Service().getImageURL(POST_BUCKET, post.image)];
            case 3:
                _b.image = _c.sent();
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(200, undefined, post)];
            case 4:
                e_4 = _c.sent();
                console.log('Error on get post by id comment: ', e_4);
                return [2 /*return*/, (0, formatResponseUtil_1.formatDefaultResponse)(500, 'Erro ao retornar o post: ' + e_4)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.get = get;
//# sourceMappingURL=post.js.map