const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    let courses = await Course.find()
        .populate('userId', 'email name')
        .lean();
    // courses = JSON.parse(courses);
    // console.log(courses);
    res.render('courses', {
        title: 'Курсы',
        isCourses: true,
        courses
    });
});

router.get('/:id/edit', auth, async (req, res) => {
   if (!req.query.allow) {
       return res.redirect('/courses')
   }

   let course = await Course.findById(req.params.id);
   course = course.toJSON();

   res.render('course-edit', {
       title: `Редактировать ${course.title}`,
       course
   })
});

router.post('/edit', auth, async (req, res) => {
    const {id} = req.body;
    delete req.body.id;
    // console.log(id, 'wwwww111', req.body)
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
})

router.get('/:id', async (req, res) => {
    let course = await Course.findById(req.params.id);
    course = course.toJSON();

    res.render('course', {
        layout: 'empty',
        title: `Курс ${course.title}`,
        course
    });
});

router.post('/remove', auth, async (req, res) => {
    try {
        // console.log(req.body)
        await Course.deleteOne({
            _id: req.body.id,
        });
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;