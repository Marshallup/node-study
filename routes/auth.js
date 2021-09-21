const {Router} = require('express');
const router = Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const mailer = require('../mail/nodemailer');

router.get('/login', async (req, res) => {
    // req.session.isAuthenticated = true;
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });
});

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});

        if (candidate) {
            const isSame = await bcrypt.compare(password, candidate.password);

            if (isSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');
                });
            } else {
                req.flash('loginError', 'Неверный пароль!');
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует!');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e)
    }
});

router.post('/register', async (req, res) => {
   try {
       const {remail, rpassword, repeat, name} = req.body;
       const candidate = await User.findOne({ email: remail });

       // console.log(remail, rpassword, name, 'ewewe')

       if (candidate) {
           req.flash('registerError', 'Пользователь с такой почтой уже существует!');
           res.redirect('/auth/login#register');
           // console.log(candidate, 'candidate');
           // console.log(req.body, 'body');
       } else {
           const hashPassword = await bcrypt.hash(rpassword, 10);
           const user = new User({
               email: remail, name, password: hashPassword, cart: {items: []}
           });
           await user.save();
           // console.log(user, 'user');
           res.redirect('/auth/login#login');
           await mailer({
               to: remail,
               subject: 'Тест',
               html: `
                Регистрация успешно пройдена!
                Пользователь - ${name}
                Почта - ${remail}
               `,
           });
       }

   } catch (e) {
       console.log(e)
   }
});

module.exports = router;