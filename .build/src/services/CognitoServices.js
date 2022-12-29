"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoServices = void 0;
var amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
var CognitoServices = /** @class */ (function () {
    function CognitoServices(userPoolId, userPoolClient) {
        var _this = this;
        this.userPoolId = userPoolId;
        this.userPoolClient = userPoolClient;
        // Dados do Pool de usuário, o Cognito não funciona sem
        this.poolData = {
            UserPoolId: this.userPoolId,
            ClientId: this.userPoolClient
        };
        this.signUp = function (email, password) {
            return new Promise(function (resolve, reject) {
                try {
                    var userPool = new amazon_cognito_identity_js_1.CognitoUserPool(_this.poolData);
                    var userAttributes = [];
                    userPool.signUp(email, password, userAttributes, userAttributes, function (err, result) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        };
        this.confirmEmail = function (email, verificationCode) {
            return new Promise(function (resolve, reject) {
                try {
                    var userPool = new amazon_cognito_identity_js_1.CognitoUserPool(_this.poolData);
                    var userData = {
                        Username: email,
                        Pool: userPool
                    };
                    var user = new amazon_cognito_identity_js_1.CognitoUser(userData);
                    user.confirmRegistration(verificationCode, true, function (err, result) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        };
        this.forgotPassword = function (email) {
            return new Promise(function (resolve, reject) {
                try {
                    var userPool = new amazon_cognito_identity_js_1.CognitoUserPool(_this.poolData);
                    var userData = {
                        Username: email,
                        Pool: userPool
                    };
                    var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
                    cognitoUser.forgotPassword({
                        onSuccess: function (data) {
                            resolve(data);
                        },
                        onFailure: function (err) {
                            reject(err);
                        },
                    });
                }
                catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        };
        this.changePassword = function (email, password, verificationCode) {
            return new Promise(function (resolve, reject) {
                try {
                    var userPool = new amazon_cognito_identity_js_1.CognitoUserPool(_this.poolData);
                    var userData = {
                        Username: email,
                        Pool: userPool
                    };
                    var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
                    cognitoUser.confirmPassword(verificationCode, password, {
                        onSuccess: function (success) {
                            resolve(success);
                        },
                        onFailure: function (err) {
                            reject(err);
                        },
                    });
                }
                catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        };
        this.login = function (login, password) {
            return new Promise(function (resolve, reject) {
                try {
                    var userPool = new amazon_cognito_identity_js_1.CognitoUserPool(_this.poolData);
                    var userData = {
                        Username: login,
                        Pool: userPool
                    };
                    var authenticationData = {
                        Username: login,
                        Password: password
                    };
                    var authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails(authenticationData);
                    var cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
                    cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: function (result) {
                            var accessToken = result.getAccessToken().getJwtToken();
                            var refreshToken = result.getRefreshToken().getToken();
                            resolve({
                                email: login,
                                token: accessToken,
                                refreshToken: refreshToken
                            });
                        },
                        onFailure: function (err) {
                            reject(err);
                        },
                    });
                }
                catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        };
    }
    return CognitoServices;
}());
exports.CognitoServices = CognitoServices;
//# sourceMappingURL=CognitoServices.js.map