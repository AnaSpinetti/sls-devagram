"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageExtensionAllowed = exports.passwordRegex = exports.emailRegex = void 0;
exports.emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
exports.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
exports.imageExtensionAllowed = /(\.jpg|\.png|\.jpeg|\.gif)$/i;
//# sourceMappingURL=Regexes.js.map