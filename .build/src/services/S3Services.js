"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
var AWS = require("aws-sdk");
var Uuid = require("uuid");
var Regexes_1 = require("../constants/Regexes");
var S3 = new AWS.S3();
var S3Service = /** @class */ (function () {
    function S3Service() {
        this.getImageURL = function (bucket, key) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = { Bucket: bucket, Key: key };
                    S3.getSignedUrl('getObject', params, function (err, url) {
                        if (err) {
                            reject(err);
                        }
                        resolve(url);
                    });
                }
                catch (error) {
                    reject(Error);
                }
            });
        };
    }
    S3Service.prototype.saveImage = function (bucket, type, file) {
        return new Promise(function (resolve, reject) {
            try {
                var uuidAvatar = Uuid.v4();
                var extension = Regexes_1.imageExtensionAllowed.exec(file.filename) || [''];
                var key_1 = "".concat(type, "-").concat(uuidAvatar).concat(extension[0]);
                var config = {
                    Bucket: bucket,
                    Key: key_1,
                    Body: file.content
                };
                S3.upload(config, function (err, res) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(key_1);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    };
    return S3Service;
}());
exports.S3Service = S3Service;
//# sourceMappingURL=S3Services.js.map