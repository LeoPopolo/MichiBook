"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const key_1 = __importDefault(require("./key"));
const pool = new pg_1.Client(key_1.default.database);
pool.connect()
    .then(() => {
    console.log("database connected");
})
    .catch(err => {
    console.log(err);
});
exports.default = pool;
//# sourceMappingURL=database.js.map