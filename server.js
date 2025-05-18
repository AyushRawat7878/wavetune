const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/playlist-covers')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Playlist Schema
const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        required: true
    },
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: String,
        required: true
    }
});

const Playlist = mongoose.model('Playlist', playlistSchema);

// User Schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Routes
// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await user.save();
        
        // Send success response with user data (excluding password)
        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email
        };
        
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ error: 'Error creating user account' });
    }
});

// Playlist routes
app.post('/api/playlists', upload.single('coverImage'), async (req, res) => {
    try {
        const { name, description, privacy, userId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Cover image is required' });
        }

        const playlist = new Playlist({
            name,
            description,
            coverImage: `/uploads/playlist-covers/${req.file.filename}`,
            privacy,
            userId
        });

        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Error creating playlist' });
    }
});

// Get all playlists
app.get('/api/playlists', async (req, res) => {
    try {
        const playlists = await Playlist.find({ privacy: 'public' });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching playlists' });
    }
});

// Get user's playlists
app.get('/api/playlists/user/:userId', async (req, res) => {
    try {
        const playlists = await Playlist.find({ userId: req.params.userId });
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user playlists' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 