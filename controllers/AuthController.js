const User = require('../models/User');
const jwt = require('jsonwebtoken');

const env = require('../config/environment');

class AuthController {
    // [POST] /login
    async login(req, res) {
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
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.json({ message: 'Logout successful' });
    }
}

module.exports = new AuthController();
