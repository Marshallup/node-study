module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated;
    res.locals.csrf = req.csrfToken();

    // console.log(res)

    next();
};