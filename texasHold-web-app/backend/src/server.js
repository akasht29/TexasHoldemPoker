const path = require("path");
require('dotenv').config({path:path.join(__dirname,'config','.env')});

const express      = require("express");
const session      = require("express-session");
const pgSession    = require("connect-pg-simple")(session);


const http         = require("http");
const db           = require("./database/connection");
const cookieParser = require("cookie-parser");

const userRoutes   = require("./router/userRoutes");
const gameRoutes   = require("./router/gamesRoutes");
const root         = require("./router/root");
const { customErrorHandler } = require("./middleware/customErrorHandler");
const app          = express();
const PORT         = process.env.PORT | 3000;


// view engine setup
app.set("views", path.join(__dirname, "../../frontend/src/public/views"));

app.set("view engine", "ejs");

// Serve static files for front end

app.use(express.static(path.join(__dirname, "../../frontend/src/public/")));

app.use(cookieParser());

const sessionMiddleware = session({
    store: new pgSession({ pgPromise: db }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
});

const initSockets = require("./sockets/init.js");

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);

const server = initSockets(app, sessionMiddleware);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

app.use("/", root);
app.use("/user", userRoutes);
app.use("/game", gameRoutes);

// Move customErrorHandler here, after the routes
app.use(customErrorHandler);

//Creates database
const { CreateTableError, createTables } = require("./database/createTables");
const exp     = require("constants");
const { env } = require("process");
console.log('post sessinoomiddleware')

const result = {};
