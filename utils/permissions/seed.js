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
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var mongodb_1 = require("../../src/mongodb");
var Permissions_1 = require("../../src/entities/Permissions");
var Roles_1 = require("../../src/entities/Roles");
// @ts-ignore
fs_1["default"].readdir('./src/routes/', function (err, files) { return __awaiter(void 0, void 0, void 0, function () {
    var permissionsRoutes, permissionsList, e_1, allCurrentPermissions, hashedCurrentPermissions, savedPermissions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                permissionsRoutes = files.filter(function (file) { return (!file.includes('test') && file.includes('.ts') && file !== 'index.ts'); });
                permissionsList = [];
                return [4 /*yield*/, Promise.all(permissionsRoutes.map(function (module) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            Promise.resolve().then(function () { return require(path_1["default"].resolve(__dirname, "../../src/routes/".concat(module))); }).then(function (router) {
                                var moduleCommonName = module.replace('.ts', '').toLowerCase();
                                router["default"].stack.forEach(function (layer) {
                                    var path = layer.route.path.slice(1).replace(':', '');
                                    Object.entries(layer.route.methods)
                                        .filter(function (_a) {
                                        var method = _a[0], bool = _a[1];
                                        return bool;
                                    })
                                        .forEach(function (_a) {
                                        var method = _a[0];
                                        permissionsList.push(new Permissions_1.Permissions({
                                            name: "".concat(moduleCommonName, ".").concat(path ? path + '.' : '').concat(method),
                                            group: moduleCommonName
                                        }));
                                    });
                                });
                            });
                            return [2 /*return*/];
                        });
                    }); }))];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, mongodb_1.establishMongooseConnection)()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.error(e_1 === null || e_1 === void 0 ? void 0 : e_1.message);
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [4 /*yield*/, Permissions_1.Permissions.find({})];
            case 6:
                allCurrentPermissions = _a.sent();
                hashedCurrentPermissions = allCurrentPermissions.reduce(function (acc, curr) {
                    acc[curr.name] = curr;
                    return acc;
                }, {});
                return [4 /*yield*/, Promise.all(permissionsList.map(function (permission) { return __awaiter(void 0, void 0, void 0, function () {
                        var name, group;
                        return __generator(this, function (_a) {
                            name = permission.name, group = permission.group;
                            if (hashedCurrentPermissions[name]) {
                                // remove from current permissions, anything left at the end will be deleted
                                delete hashedCurrentPermissions[name];
                            }
                            return [2 /*return*/, Permissions_1.Permissions.findOneAndUpdate({ name: permission.name }, {
                                    name: name,
                                    group: group
                                }, { upsert: true, returnDocument: 'after' })];
                        });
                    }); }))];
            case 7:
                savedPermissions = _a.sent();
                return [4 /*yield*/, Permissions_1.Permissions.deleteMany({ _id: { $in: Object.values(hashedCurrentPermissions).map(function (_a) {
                                var _id = _a._id;
                                return _id;
                            }) } })];
            case 8:
                _a.sent();
                return [4 /*yield*/, Roles_1.Roles.findOneAndUpdate({ name: 'SUPERADMIN' }, {
                        name: 'SUPERADMIN',
                        permissions: savedPermissions
                    }, { upsert: true })];
            case 9:
                _a.sent();
                return [4 /*yield*/, Roles_1.Roles.findOneAndUpdate({ name: 'user' }, { name: 'USER', permissions: savedPermissions.filter(function (permission) { return permission.name === 'users.me.get'; }) }, { upsert: true })];
            case 10:
                _a.sent();
                process.exit();
                return [2 /*return*/];
        }
    });
}); });
