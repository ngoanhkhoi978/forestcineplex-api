const userRouter = require('./users');
const authRouter = require('./auth');
const movieRouter = require('./movies');
const genresRouter = require('./genres');
const episodesRouter = require('./episodes');
const favouritesRouter = require('./favourites');
const commentsRouter = require('./comments');
const viewRouter = require('./views');
const meRouter = require('./me');
const ratingsRouter = require('./ratings');

const authenticationToken = require('../middlewares/authenticationToken');

const authorize = require('../middlewares/authorize');

function route(app) {
    app.use('/api/users', authenticationToken, authorize(['admin']), userRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/movies', authenticationToken, movieRouter);
    app.use('/api/genres', authenticationToken, genresRouter);
    app.use('/api/episodes', authenticationToken, episodesRouter);
    app.use('/api/favourites', authenticationToken, favouritesRouter);
    app.use('/api/comments', authenticationToken, commentsRouter);
    app.use('/api/views', authenticationToken, viewRouter);
    app.use('/api/me', authenticationToken, meRouter);
    app.use('/api/ratings', ratingsRouter);
}

module.exports = route;
