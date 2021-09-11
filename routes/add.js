const {Router} = require('express');
const router = Router();
const Course = require('../models/course');

router.get('/', (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true,
    });
});

router.post('/', async (req, res) => {
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