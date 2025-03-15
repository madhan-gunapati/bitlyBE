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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
// import   express   from 'express';
// import  cors from 'cors'
// import  bcrypt from 'bcrypt'
// import   jwt  from 'jsonwebtoken'
var nanoid_1 = require("nanoid");
var client_1 = require("@prisma/client");
var express = require('express');
var cors = require('cors');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var app = express();
app.use(express.json());
app.use(cors());
var prisma = new client_1.PrismaClient();
var authorization_middleware = function (req, res, next) {
    var _a;
    try {
        var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (token !== undefined) {
            var email = jwt.verify(token, 'my-secret-token');
            req.email = email;
            next();
        }
    }
    catch (e) {
        next(e);
    }
};
app.get('/', function (req, res) {
    res.send('App is working Fine');
});
app.put('/user-registration', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, password, hashed_password, db_response, id, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, password = _a.password;
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 1:
                hashed_password = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, prisma.user.create({
                        data: { name: name, email: email, password: hashed_password }
                    })];
            case 3:
                db_response = _b.sent();
                id = db_response.id;
                res.send(JSON.stringify({ id: id }));
                return [3 /*break*/, 5];
            case 4:
                e_1 = _b.sent();
                if (e_1.code == 'P2002') {
                    res.status(400).send('Unique Constraint Violation');
                }
                else {
                    next(e_1);
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/login', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, email_found, hashed_password, result, payload, token, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { email: email }
                    })];
            case 1:
                email_found = _b.sent();
                if (!(email_found === null)) return [3 /*break*/, 2];
                res.status(404).send('User Not Found');
                return [3 /*break*/, 4];
            case 2:
                hashed_password = email_found.password;
                return [4 /*yield*/, bcrypt.compare(password, hashed_password)];
            case 3:
                result = _b.sent();
                if (result) {
                    payload = { email: email };
                    token = jwt.sign(payload, 'my-secret-token');
                    res.send(token);
                }
                else {
                    res.status(404).send('Incorrect Password');
                }
                _b.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                e_2 = _b.sent();
                next(e_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.put('/short-url', authorization_middleware, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var input_url, email, user, id, short_url, userId, storage_result, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                input_url = req.body.input_url;
                if (!req.email) {
                    res.status(400).send('Bad Request');
                    return [2 /*return*/];
                }
                email = req.email.email;
                return [4 /*yield*/, prisma.user.findUnique({ where: {
                            email: email
                        } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(400).send('Bad Request');
                    return [2 /*return*/];
                }
                id = user.id;
                short_url = 'tiny/' + String((0, nanoid_1.nanoid)(4));
                userId = id;
                return [4 /*yield*/, prisma.links.create({
                        data: {
                            LongUrl: input_url, shortUrl: short_url,
                            user: { connect: { id: userId } }
                        }
                    })];
            case 2:
                storage_result = _a.sent();
                res.json({ short_url: short_url });
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                next(e_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.put('/redirection-url', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var short_url, result, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                short_url = req.body.short_url;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.links.findMany({ where: {
                            shortUrl: short_url
                        } })];
            case 2:
                result = _a.sent();
                if (result === null) {
                    res.send('www.notfound.com');
                }
                else {
                    res.send(result[0].LongUrl);
                }
                return [3 /*break*/, 4];
            case 3:
                e_4 = _a.sent();
                next(e_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.use(function (error, req, res, next) {
    if (error instanceof Error) {
        res.send(500).json({ message: error.message });
    }
    else {
        res.send(500).json({ message: 'unknown Error' });
    }
});
app.listen(3000, function () {
    console.log('App started Working, FE still in progress...Thanks for reaching... ');
});
