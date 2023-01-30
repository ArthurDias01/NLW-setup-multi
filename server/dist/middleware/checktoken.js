"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/middleware/checktoken.ts
var checktoken_exports = {};
__export(checktoken_exports, {
  checkToken: () => checkToken
});
module.exports = __toCommonJS(checktoken_exports);
var import_jwt_decode = __toESM(require("jwt-decode"));

// lib/cache.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({});

// src/middleware/checktoken.ts
async function checkToken(request, response) {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> no token");
    return response.status(401).send({ error: "User not Found or token expired" });
  }
  const decoded = (0, import_jwt_decode.default)(token);
  const now = new Date().getTime();
  if (decoded.exp * 1e3 < now) {
    return response.status(401).send({ error: "User not Found or token expired" });
  }
  const user = await prisma.user.findUnique({
    where: {
      firebaseId: decoded.user_id
    }
  });
  if (!user) {
    return response.status(401).send({ error: "User not Found or token expired" });
  }
  return { userId: user.id, firebaseId: decoded.user_id };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkToken
});
