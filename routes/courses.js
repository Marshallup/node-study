const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {

    try {
        let courses = await Course.find()
            .populate('userId', 'email name')
            .lean();
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        });
    } catch (e) {
        console.log(e, 'error courses');
    }

});

router.get('/:id/edit', auth, async (req, res) => {
   if (!req.query.allow) {
       return res.redirect('/courses')
   }

   try {

       let course = await Course.findById(req.params.id);
       // console.log(course.userId.toString(), 'user id');

       if (!isOwner(course, req)) {
            return res.redirect('/courses');
       }

       course = course.toJSON();

       res.render('course-edit', {
           title: `Редактировать ${course.title}`,
           course
       });
   } catch (e) {
       console.log(e, 'course edit');
   }

});

router.post('/edit', auth, async (req, res) => {

    try {
        const {id} = req.body;
        delete req.body.id;
        const course = Course.findById(id);
        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }
        Object.assign(course, req.body)
        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log(e, 'error');
    }

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
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        });
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;