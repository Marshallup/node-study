const {Router} = require('express');
const router = Router();
const User = require('../models/user');

router.get('/login', async (req, res) => {
    // req.session.isAuthenticated = true;
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
    })
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
            const isSame = password === candidate.password;

            if (isSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');
                })
            } else {
                res.redirect('/auth/login#login');
            }
        } else {
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        console.log(e)
    }
});

router.post('/register', async (req, res) => {
   try {
       const {remail, rpassword, repeat, name} = req.body;
       const candidate = await User.findOne({ remail });

       // console.log(remail, rpassword, name, 'ewewe')

       if (candidate) {
           res.redirect('/auth/login#register');
       } else {
           const user = new User({
               email: remail, name, password: rpassword, cart: {items: []}
           });
           await user.save();
           res.redirect('/auth/login#login');
       }

   } catch (e) {
       console.log(e)
   }
});

module.exports = router;