import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

const generateToken = (id: string, roles: string[]) => {
    return jwt.sign({ id, roles }, SESSION_SECRET, {
        expiresIn: '30d'
    });
};

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
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
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

export const authUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            token: generateToken(user._id.toString(), user.roles),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

export const getUserProfile = async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};
