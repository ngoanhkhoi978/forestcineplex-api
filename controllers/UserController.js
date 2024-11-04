class UserController {
    index(req, res) {
        res.json({ mess: 'entered user page' });
    }
}

module.exports = new UserController();
