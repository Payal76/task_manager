// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const passport = require('passport');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const authRoutes = require('./routes/authRoutes');
// const projectRoutes = require('./routes/projectRoutes');
// const taskRoutes = require('./routes/taskRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes');
// const initializePassport = require('./config/passport');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;
// const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: clientUrl, credentials: true }));

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB error:', err));

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'secretkey',
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24,
//     sameSite: 'lax',
//   },
// }));

// initializePassport(passport);
// app.use(passport.initialize());
// app.use(passport.session());

// app.use('/api/auth', authRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(err.status || 500).json({ message: err.message || 'Server error' });
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });






const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const initializePassport = require('./config/passport');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// 🔥 IMPORTANT (Render proxy fix)
app.set("trust proxy", 1);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS FIX
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// ✅ SESSION FINAL FIX
app.use(session({
  name: "connect.sid",   // 🔥 important
  secret: process.env.SESSION_SECRET || 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "none",   // 🔥 cross-site cookie
    secure: true,       // 🔥 https required
    httpOnly: true,     // 🔥 security
  },
}));

// Passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});