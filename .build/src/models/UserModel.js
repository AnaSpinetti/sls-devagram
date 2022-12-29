"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
var dynamoose = require("dynamoose");
var UserSchema = new dynamoose.Schema({
    cognitoId: {
        type: String,
        hashKey: true
    },
    name: {
        type: String,
        index: {
            name: 'nameIndex',
            global: true
        }
    },
    email: {
        type: String,
        index: {
            name: 'emailIndex',
            global: true
        }
    },
    avatar: { type: String },
    followers: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    following: { type: Array, default: [] },
}, { saveUnknown: true });
var userTable = process.env.USER_TABLE || '';
exports.UserModel = dynamoose.model(userTable, UserSchema);
//# sourceMappingURL=UserModel.js.map