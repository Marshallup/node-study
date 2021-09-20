const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const csurf = require('csurf');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const exhbs = require('express-handlebars');
const homeRoutes = require('./routes/home');
const cardRoutes = require('./routes/card');
const addRoutes = require('./routes/add');
const ordersRoutes = require('./routes/orders');
const coursesRouter = require('./routes/courses');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');

const MONGODB_PSWD = 'hbozPfPcDYW8tf8q';
const MONGODB_URI = `mongodb+srv://admin:${MONGODB_PSWD}@cluster0.8wobw.mongodb.net/shop`;


const app = express();

const hbs = exhbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});

const store = new MongoStore({
   collection: 'sessions',
    uri: MONGODB_URI,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'some secret value',
    resave: false,
    saveUninitialized: false,
    store,
}));
app.use(csurf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRouter);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);



const PORT = process.env.PORT || 3000;


async function start() {
    // DB
    // const password = 'hbozPfPcDYW8tf8q';
    // const url = `mongodb+srv://admin:${password}@cluster0.8wobw.mongodb.net/shop`;
    // const url = `mongodb+srv://admin:${password}@cluster0.8wobw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(MONGODB_URI, {
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
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    } catch (e) {
        console.log(e, 'error connect');
    }
}

start();