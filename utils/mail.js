const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

const env = require('../config/environment');

function generateOTP() {
    return crypto.randomBytes(3).toString('hex');
}

async function sendResetPasswordEmail(user) {
    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000;

    user.resetPassword = { OTP: otp, expires: expires };

    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.EMAIL_ADDRESS,
            pass: env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: env.EMAIL_ADDRESS,
        to: user.email,
        subject: 'Your Verification Code',
        html: `
            <html>
                <head>
                    <style>
                        * {
                            font-size: 16px;
                            font-family: sans-serif;
                        }
                        #name {
                            font-size: 18px;
                            font-weight: bold;
                        }
                        #code {
                            font-weight: bold;
                            font-size: 20px;
                        }
                        #mycomp {
                            font-weight: bold;
                            color: green;
                        }
                    </style>
                </head>
                <body>
                    Hello, <span id="name">${user.fullName}</span>
                    <br><br>
                    You or someone has requested a verification code to proceed with an action on <span id="mycomp">ForestCineplex</span>. Below is the verification code you will need to complete the process:
                    <br><br>
                    Your Verification Code: <span id="code">${otp}</span>
                    <br><br>
                    Please note that this code will expire in 10 minutes.
                    <br><br>
                    <span style="color: red;">If you did not request this verification code, please ignore this email or contact us if you believe this is an error.</span>
                    <br><br>
                    Thank you for your attention.
                    <br><br>
                    Warm regards, Forest Cineplex Support Team!
                </body>
            </html>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendResetPasswordEmail };
