const userRouter = require('./users');
const authRouter = require('./auth');

function route(app) {
    app.use('/api/users', userRouter);
    app.use('/api/auth', authRouter);
    app.use('/', (req, res) => {
        res.send({ mess: 'success' });
    });
}

module.exports = route;
