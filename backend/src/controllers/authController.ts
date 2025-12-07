import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user: any = await User.create({
            email,
            password,
        });

        if (user) {
            const token = generateToken(user._id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            return res.status(201).json({
                _id: user._id,
                email: user.email,
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {
        const user: any = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            return res.json({
                _id: user._id,
                email: user.email,
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req: Request, res: Response): Promise<any> => {
    const { token } = req.body; // ID Token from frontend

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google Token' });
        }

        const { email, sub } = payload; // sub is google unique id

        let user = await User.findOne({ email });

        if (!user) {
            // Create user if not exists
            // Since we use email/password model, we'll set a dummy password for google users
            // userSchema requires password, so we generate a random hash or usage
            // In a real app, we'd make password optional or separate auth provider logic
            user = await User.create({
                email,
                password: await import('bcryptjs').then(bcrypt => bcrypt.hash(Math.random().toString(36), 10))
            });
        }

        const sessionToken = generateToken(user._id.toString());

        res.cookie('token', sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            _id: user._id,
            email: user.email,
        });

    } catch (error: any) {
        return res.status(500).json({ message: 'Google Auth Failed' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};

export const getMe = async (req: Request, res: Response) => {
    const user = (req as any).user;
    res.status(200).json({
        _id: user._id,
        email: user.email,
    });
};
