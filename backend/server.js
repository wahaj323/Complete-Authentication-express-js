const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Define the JWT secret directly in the file
const JWT_SECRET = 'your_jwt_secret_key'; // Replace this with a secure key of your choice

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/authentication', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.model('User', userSchema);

// Middleware for Authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware for Authorization (based on roles)
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// Auth Routes (Signup, Login)
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes (Protected)
app.get('/api/admin-dashboard', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

// User Routes (Protected)
app.get('/api/user-dashboard', authenticate, authorize(['user', 'admin']), (req, res) => {
  res.json({ message: 'Welcome to the User Dashboard' });
});

// Admin Route to Get All Users with Role 'user'
app.get('/api/users', authenticate, authorize(['admin']), async (req, res) => {
  try {
    // Find users with role 'user'
    const users = await User.find({ role: 'user' }).select('username role'); // Customize the fields you want to return
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Home Route (Public)
app.get('/', (req, res) => {
  res.send('Welcome to the authentication server');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
