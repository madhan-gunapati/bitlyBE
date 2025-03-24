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
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
const nanoid_1 = require("nanoid");
const client_1 = require("@prisma/client");
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
exports.app = app;
app.use(express.json());
app.use(cors());
const prisma = new client_1.PrismaClient();
const authorization_middleware = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (token !== undefined) {
            const email = jwt.verify(token, 'my-secret-token');
            req.email = email;
            next();
        }
    }
    catch (e) {
        next(e);
    }
};
app.get('/', (req, res) => {
    res.send('App is working Fine');
});
app.put('/user-registration', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('came here');
    const { name, email, password } = req.body;
    const hashed_password = yield bcrypt.hash(password, 10);
    try {
        const db_response = yield prisma.user.create({
            data: { name, email, password: hashed_password }
        });
        const { id } = db_response;
        res.send(JSON.stringify({ id }));
    }
    catch (e) {
        if (e.code == 'P2002') {
            res.status(400).send('Unique Constraint Violation');
        }
        else {
            next(e);
        }
    }
}));
app.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const email_found = yield prisma.user.findUnique({
            where: { email: email }
        });
        if (email_found === null) {
            res.status(404).send('User Not Found');
        }
        else {
            const hashed_password = email_found.password;
            const result = yield bcrypt.compare(password, hashed_password);
            if (result) {
                const payload = { email };
                const token = jwt.sign(payload, 'my-secret-token');
                res.send(token);
            }
            else {
                res.status(404).send('Incorrect Password');
            }
        }
    }
    catch (e) {
        next(e);
    }
}));
app.put('/short-url', authorization_middleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { input_url } = req.body;
        if (!req.email) {
            res.status(400).send('Bad Request');
            return;
        }
        const { email } = req.email;
        const user = yield prisma.user.findUnique({ where: {
                email
            } });
        if (!user) {
            res.status(400).send('Bad Request');
            return;
        }
        const { id } = user;
        const short_url = 'tiny/' + String((0, nanoid_1.nanoid)(4));
        const userId = id;
        const storage_result = yield prisma.links.create({
            data: {
                LongUrl: input_url, shortUrl: short_url,
                user: { connect: { id: userId } }
            }
        });
        res.json({ short_url });
    }
    catch (e) {
        next(e);
    }
}));
app.put('/redirection-url', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { short_url } = req.body;
    try {
        const result = yield prisma.links.findMany({ where: {
                shortUrl: short_url
            } });
        if (result === null) {
            res.send('www.notfound.com');
        }
        else {
            res.send(result[0].LongUrl);
        }
    }
    catch (e) {
        next(e);
    }
}));
app.use((error, req, res, next) => {
    if (error instanceof Error) {
        res.send(500).json({ message: error.message });
    }
    else {
        res.send(500).json({ message: 'unknown Error' });
    }
});
const server = app.listen(3000, () => {
    console.log('App started Working, FE still in progress...Thanks for reaching... ');
});
exports.server = server;
