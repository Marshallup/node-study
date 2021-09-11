const {Router} = require('express');
const router = Router();
const Course = require('../models/course');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true,
    });
});

router.post('/', auth, async (req, res) => {
    console.log(req.body);
    const response = req.body;

    const course = new Course({
        title: response.title,
        price: response.price,
        img: response.img,
        userId: req.user,
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log(e)
    }
})

module.exports = router;