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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allUsers = exports.getUser = exports.login = exports.register = void 0;
const cloudinary_1 = require("cloudinary");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../middlewares/errorHandler");
const UserModel_1 = require("../model/UserModel");
const fs_1 = __importDefault(require("fs"));
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    try {
        // Check if the username or email is already taken
        const existingUser = yield UserModel_1.User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new errorHandler_1.CustomErrorHandler("Username or email already exists", 400);
        }
        const url = yield cloudinary_1.v2.uploader.upload(req.file.path);
        const localFilePath = req.file.path;
        fs_1.default.unlink(localFilePath, (err) => {
            if (err) {
                console.error(`Error deleting local file: ${err.message}`);
            }
            else {
                console.log(`Local file deleted: ${localFilePath}`);
            }
        });
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Save the user to the database using Mongoose model
        const newUser = new UserModel_1.User({ username, password: hashedPassword, email, pic: url.url });
        const user = yield newUser.save();
        res.status(201).json({ message: "User registered successfully", user: user });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const user = yield UserModel_1.User.findOne({ username });
        // Check if the user exists
        if (!user) {
            throw new errorHandler_1.CustomErrorHandler("Invalid username or password", 401);
        }
        // Compare the hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        // Check if the password is valid
        if (!isPasswordValid) {
            throw new errorHandler_1.CustomErrorHandler("Invalid username or password", 401);
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, "your-secret-key", { expiresIn: "6h" });
        res.status(200).json({ token, user });
    }
    catch (error) {
        next(error); // Pass the error to the next middleware
    }
});
exports.login = login;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Access the authenticated user from the request
        const { id } = req;
        const user = yield UserModel_1.User.findOne({ _id: id });
        if (!user) {
            throw new errorHandler_1.CustomErrorHandler("Unauthorized - No user found", 401);
        }
        // You can fetch additional user details from your database or any other source
        // For demonstration purposes, we are returning the basic user information
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
const allUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 4;
    const skip = parseInt(req.query.skip) || 0;
    // Assuming you have a MongoDB model named 'User'
    try {
        const keyword = req.query.search
            ? {
                $or: [
                    { username: { $regex: req.query.search, $options: "i" } },
                    { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};
        const users = yield UserModel_1.User.find(keyword)
            .find({ _id: { $ne: req.id } })
            .limit(limit)
            .skip(skip);
        const total = yield UserModel_1.User.countDocuments(keyword);
        res.send({ users, total, limit });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
exports.allUsers = allUsers;
