const {Router} = require('express');
const router = Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

router.get('/reset', (req, res) => {
   res.render('auth/reset', {
    title: 'Забыли пароль ?',
       resetError: req.flash('resetError'),
   });
});

router.get('/pwd/:token', async (req, res) => {
   if (!req.params.token) {
       return res.redirect('/auth/login');
   }

   try {
       const user = await User.findOne({
           resetToken: req.params.token,
           resetTokenExp: {$gt: Date.now()}
       });

       console.log(user, 'user');

       if (!user) {
           return res.redirect('/auth/login');
       } else {
           console.log(user);
           res.render('auth/pwd.hbs', {
            title: 'Восстановить доступ',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token,
           });
       }

   } catch(e) {
       console.log(e, 'reset token error');
   }

});

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
           if (err) {
               req.flash('error', 'Что-то пошло не так, повторите попытку позже!');
               res.redirect('/auth/reset');
           }

           const token = buffer.toString('hex');
           const candidate = await User.findOne({ email: req.body.email });
           // console.log(candidate, 'candidate');
           // return;

           if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                await mailer({
                    to: candidate.email,
                    subject: 'Восстановление доступа',
                    html: `
                        <h1>Забыли пароль ?</h1>
                        <p>Ссылка для восстановления:
                            <a target="_blank" href="http://localhost:3000/auth/pwd/${token}">Сбросить пароль</a>
                        </p>
                        Почта - ${candidate.email}
                    `,
                });
                return res.redirect('/auth/login');
           } else {
               req.flash('resetError', 'Пользователя не существует!');
               res.redirect('/auth/reset');
           }
        });
    } catch(e) {
        console.log(e, 'error reset pwd');
    }
});

router.post('/pwd', async (req, res) => {

    let user;
    try {
    user = await User.findOne({
       _id: req.body.userId,
        resetToken: req.body.token,
        resetTokenExp: {$gt: Date.now() }
    });
    console.log(user, 'user');
   } catch (e) {
    console.log(e, 'user pwd');
   }

   if (user) {
    user.password = await bcrypt.hash(req.body.pwd, 10);
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    res.redirect('/auth/login');
   } else {
       req.flash('loginError', 'Время жизни токена истекло!');
       res.redirect('/auth/login');
   }
});

module.exports = router;