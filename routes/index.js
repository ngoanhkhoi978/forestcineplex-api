const userRouter = require('./users');
const authRouter = require('./auth');
const movieRouter = require('./movies');
const genresRouter = require('./genres');

const authenticationToken = require('../middlewares/authenticationToken');

function route(app) {
    app.use('/api/users', authenticationToken, userRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/movies', movieRouter);
    app.use('/api/genres', genresRouter);
    // app.use('/', (req, res) => {
    //     res.send({ mess: 'success' });
    // });
}

module.exports = route;
