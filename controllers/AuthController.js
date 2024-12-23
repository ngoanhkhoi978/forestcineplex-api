const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const env = require('../config/environment');
const { sendResetPasswordEmail } = require('../utils/mail');

class AuthController {
    // [POST] /login
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ validators: errors.array() });
            }

            const { username, password } = req.body;

            const user = await User.findOne({ username });

            const token = jwt.sign(
                {
                    userId: user._id,
                    role: user.role,
                },
                env.JWT_SECRET,
                { expiresIn: '1d' },
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 3600000,
            });

            res.status(200).json(user.toSafeObject());
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred during login' });
        }
    }
    async loginAdmin(req, res) {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ username });

            if (!user) {
                return res.status(401).json({ invalid: 'username' });
            }

            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(401).json({ invalid: 'password' });
            }

            if (user.role !== 'admin') {
                return res.status(401).json({ mess: 'only admin' });
            }

            const token = jwt.sign(
                {
                    userId: user._id,
                    role: user.role,
                },
                env.JWT_SECRET,
                { expiresIn: '1d' },
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 3600000,
            });

            res.status(200).json(user._doc);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred during login' });
        }
    }

    // [GET] /verify-token
    async verify(req, res) {
        const user = await User.findOne({ _id: req.userId });
        const { password, ...infoUser } = user._doc;
        res.status(200).json(infoUser);
    }

    async logout(req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });
        res.status(200).json({ message: 'Logout successful' });
    }

    async logoutAdmin(req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });
        res.status(200).json({ message: 'Logout successful' });
    }

    async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ validators: errors.array() });
            }
            const { fullName, username, password, email, phone } = req.body;

            const newUser = new User({ fullName, username, password, email, phone });
            await newUser.save();
            const token = jwt.sign(
                {
                    userId: newUser._id,
                    role: newUser.role,
                },
                env.JWT_SECRET,
                { expiresIn: '1d' },
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 3600000,
            });
            res.status(200).json(newUser.toSafeObject());
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async forgotPassword(req, res) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ validators: errors.array() });
            }
            const { identifier } = req.body;

            let user = await User.findOne({ email: identifier });

            if (!user) {
                user = await User.findOne({ username: identifier });
            }

            const bool = user.resetPassword && user.resetPassword.expires > Date.now();
            if (!bool) {
                await sendResetPasswordEmail(user);
            } else {
                return res
                    .status(200)
                    .json({ message: 'Password reset email has been sent. Please wait 5 minutes for next attempt.' });
            }
            res.status(200).json({ message: 'Reset password email sent' });
        } catch (e) {
            console.log(e);
            res.status(500).json(e);
        }
    }

    async resetPassword(req, res) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ validators: errors.array() });
            }

            const { identifier, newPassword } = req.body;

            let user = await User.findOne({ email: identifier });

            if (!user) {
                user = await User.findOne({ username: identifier });
            }

            user.resetPassword = null;

            user.password = newPassword;
            await user.save();
            res.status(200).json(user.toSafeObject());
        } catch (e) {
            res.status(500).json(e);
        }
    }
}

module.exports = new AuthController();
