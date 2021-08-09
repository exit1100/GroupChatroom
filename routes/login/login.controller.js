exports.login = (req, res, next) => {
    res.render('login.html')
}

exports.non_account_login = (req, res, next) => {
    res.render('non_account_login.html')
}