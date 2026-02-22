"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.authUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
const generateToken = (id, roles) => {
    return jsonwebtoken_1.default.sign({ id, roles }, SESSION_SECRET, {
        expiresIn: '30d'
    });
};
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const userExists = await User_1.User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const passwordHash = await bcryptjs_1.default.hash(password, salt);
    const user = await User_1.User.create({
        username,
        email,
        passwordHash
    });
    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            token: generateToken(user._id.toString(), user.roles),
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};
exports.registerUser = registerUser;
const authUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email });
    if (user && (await bcryptjs_1.default.compare(password, user.passwordHash))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            token: generateToken(user._id.toString(), user.roles),
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};
exports.authUser = authUser;
const getUserProfile = async (req, res) => {
    const user = await User_1.User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
};
exports.getUserProfile = getUserProfile;
