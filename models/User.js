const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    fullName: {
        type: String,
        trim: true,
        required: [true, 'Full name is required'],
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email!`,
        },
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^\+?[0-9]{10,15}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        required: [true, 'Role is required'],
        type: String,
        default: 'user',
        enum: {
            values: ['user', 'admin', 'moderator'],
            message: 'Role must be either user, admin, or moderator',
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    subscriptionPlan: {
        type: String,
        enum: ['Basic', 'Standard', 'Premium'],
        default: 'Basic',
    },
    avatar: {
        type: Buffer,
        default: null,
        content: String,
    },
    resetPassword: {
        OTP: { type: String },
        expires: { type: Date },
    },
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

userSchema.methods.toSafeObject = function () {
    const user = this.toObject();
    delete user.password;
    delete user.updatedAt;
    delete user.deleted;
    delete user.createdAt;
    delete user.__v;
    return user;
};

userSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: true,
});

module.exports = mongoose.model('User', userSchema);
