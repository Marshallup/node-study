const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const exhbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const ordersRoutes = require('./routes/orders');
const coursesRouter = require('./routes/courses');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const app = express();

const hbs = exhbs.create({
    defaultLayout: 'main',
    extname: 'hbs',

});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('61385bd30818644b666c9573');
        req.user = user;
        next();
    } catch (e) {
        console.log(e)
    }
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRouter);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);



const PORT = process.env.PORT || 3000;


async function start() {
    // DB
    const password = 'hbozPfPcDYW8tf8q';
    const url = `mongodb+srv://admin:${password}@cluster0.8wobw.mongodb.net/shop`;
    // const url = `mongodb+srv://admin:${password}@cluster0.8wobw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
        });
        const candidate = await User.findOne();
        if (!candidate) {
            const user = new User({
                email: 'vladilen@mail.ru',
                name: 'Vladilen',
                cart: {item: []}
            });
            await user.save();
        }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();