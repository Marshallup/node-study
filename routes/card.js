const {Router} = require('express');
// const Card = require('../models/card');
const Course = require('../models/course');
const router = Router();
const auth = require('../middleware/auth');

function mapCartItems(cart) {
    return cart.items.map(c => ({
       ...c.courseId._doc,
        count: c.count,
        id: c.courseId.id,
    }));
}

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count;
    }, 0)
}

router.post('/add', async (req, res) => {
    const course = await Course.findById(req.body.id);
    // console.log(course, 'course')
    await req.user.addToCart(course);
    // await Card.add(course);

    res.redirect('/card');
});

router.get('/', auth, async (req, res) => {
    // const card = await Card.fetch();
    // console.log(card, 'www')
    const user = await req.user
        .populate('cart.items.courseId');

    const card = mapCartItems(user.cart);

    // console.log(user, courses)
    res.render('card', {
        title: 'Корзина',
        card,
        price: computePrice(card),
    })
    // res.json({test: true})
});

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId');
    const courses = mapCartItems(user.cart);
    const cart = {
        courses, price: computePrice(courses)
    }

    // const card = await Card.remove(req.params.id);
    res.status(200).json(cart);
})

module.exports = router;