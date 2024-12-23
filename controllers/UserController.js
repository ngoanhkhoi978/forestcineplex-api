const User = require('../models/User');

const bcrypt = require('bcrypt');

const { validatePassword } = require('../utils/validators');
const Movie = require('../models/Movie');

class UserController {
    async getAllUsers(req, res) {
        try {
            const users = await User.find({});
            res.status(200).send(users);
        } catch (e) {
            console.log(e);
            res.status(500).send({ error: e });
        }
    }

    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const users = await User.findOne({ _id: userId });

            res.status(200).send(users);
        } catch (e) {
            console.log(e);
            res.status(500).send({ error: e });
        }
    }

    // [POST] /
    async addUser(req, res) {
        try {
            const { username, password, fullName, email, phone, role } = req.body;

            const errors = {};

            if (!username) errors.username = 'Username is required';
            if (!password) errors.password = 'Password is required';
            if (!fullName) errors.fullName = 'Full name is required';
            if (!email) errors.email = 'Email is required';
            if (!phone) errors.phone = 'Phone is required';

            const passwordValidationError = validatePassword(password);
            if (passwordValidationError) {
                errors.password = passwordValidationError;
            }

            if (Object.keys(errors).length > 0) {
                return res.status(400).json(errors);
            }

            const newUser = new User({
                username,
                password,
                fullName,
                email,
                phone,
                role,
            });

            await newUser.save();

            res.status(201).json(newUser);
        } catch (e) {
            const errors = {};

            if (e.name === 'ValidationError') {
                Object.entries(e.errors).forEach(([field, err]) => {
                    errors[field] = err.message;
                });
            }

            if (e.code === 11000) {
                const field = Object.keys(e.keyValue)[0];
                errors[field] = `${field} already exists`;
            }

            if (Object.keys(errors).length > 0) {
                return res.status(400).json(errors);
            }

            res.status(500).json({ general: 'Internal server error', details: e.message });
        }
    }

    async editUser(req, res) {
        try {
            const { userId } = req.params;
            const { username, password, fullName, email, phone, role } = req.body;

            const errors = {};

            if (!username) errors.username = 'Username is required';
            if (!fullName) errors.fullName = 'Full name is required';
            if (!email) errors.email = 'Email is required';
            if (!phone) errors.phone = 'Phone is required';

            // Validate password if provided
            if (password) {
                const passwordError = validatePassword(password);
                if (passwordError) {
                    errors.password = passwordError;
                }
            }

            if (Object.keys(errors).length > 0) {
                return res.status(400).json(errors);
            }

            // Tìm user theo userId
            const existingUser = await User.findById(userId);
            if (!existingUser) {
                return res.status(404).json({ general: 'User not found' });
            }

            // Cập nhật thông tin người dùng, chỉ cập nhật những trường có giá trị mới
            existingUser.username = username || existingUser.username;
            existingUser.fullName = fullName || existingUser.fullName;
            existingUser.email = email || existingUser.email;
            existingUser.phone = phone || existingUser.phone;
            existingUser.role = role || existingUser.role;

            // Nếu có mật khẩu mới, hash và cập nhật
            if (password) {
                existingUser.password = password;
            }

            await existingUser.save();

            // Trả về thông tin user sau khi sửa đổi
            res.status(200).json(existingUser);
        } catch (e) {
            const errors = {};

            // Xử lý lỗi validation
            if (e.name === 'ValidationError') {
                Object.entries(e.errors).forEach(([field, err]) => {
                    errors[field] = err.message;
                });
            }

            // Xử lý lỗi trùng lặp (unique constraint)
            if (e.code === 11000) {
                const field = Object.keys(e.keyValue)[0];
                errors[field] = `${field} already exists`;
            }

            // Nếu có lỗi, trả về lỗi chi tiết
            if (Object.keys(errors).length > 0) {
                return res.status(400).json(errors);
            }

            // Lỗi server chung
            res.status(500).json({ general: 'Internal server error', details: e.message });
        }
    }

    // [DELETE] /:userId
    async deleteUserById(req, res) {
        try {
            const { userId } = req.params;
            const result = await User.deleteOne({ _id: userId });
            res.status(200).json(result);
        } catch (e) {
            res.status(500).send({ error: e });
        }
    }

    async getUsersWithPagination(req, res) {
        try {
            const { index = 1, limit = 5, search, q } = req.query;

            const pageIndex = parseInt(index) - 1;
            const pageLimit = parseInt(limit);

            let filter = {};

            if (search) {
                filter = {
                    $or: [
                        {
                            username: {
                                $regex: `^${search}`,
                                $options: 'i',
                            },
                        },
                        {
                            email: {
                                $regex: `^${search}`,
                                $options: 'i',
                            },
                        },
                        {
                            phone: {
                                $regex: `^${search}`,
                                $options: 'i',
                            },
                        },
                        {
                            role: {
                                $regex: `^${search}`,
                                $options: 'i',
                            },
                        },
                        {
                            fullName: {
                                $regex: `^${search}`,
                                $options: 'i',
                            },
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: '$_id' },
                                    regex: `^${search}`,
                                    options: 'i',
                                },
                            },
                        },
                    ],
                };
            }

            const totalItems = await User.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / pageLimit);

            const users = await User.find(filter)
                .skip(pageIndex * pageLimit)
                .limit(pageLimit);

            res.status(200).json({
                users,
                totalPages,
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: e.message });
        }
    }
}

module.exports = new UserController();
