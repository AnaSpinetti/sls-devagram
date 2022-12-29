"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
var dynamoose = require("dynamoose");
var PostSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true
    },
    date: { type: String },
    userId: {
        type: String,
        index: {
            name: 'userPostIndex',
            global: true,
            rangeKey: 'date'
        }
    },
    description: { type: String },
    image: { type: String },
    comments: { type: Array, default: [] },
    likes: { type: Array, default: [] },
}, { saveUnknown: true });
var postTable = process.env.POST_TABLE || '';
exports.PostModel = dynamoose.model(postTable, PostSchema);
//# sourceMappingURL=PostModel.js.map