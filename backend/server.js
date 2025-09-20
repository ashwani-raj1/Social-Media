require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Environment variables with fallbacks
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://newuser:<db_password>@cluster0.xuvvfrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const PORT = process.env.PORT || 5000;

// MongoDB Connection with better error handling
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('🌐 Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// User Schema with validation
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// Post Schema with validation
const PostSchema = new mongoose.Schema({
  author: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  likedBy: [{
    type: String // Store email addresses of users who liked
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', PostSchema);

// Enhanced authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      msg: 'No token, authorization denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ 
      success: false,
      msg: 'Token is not valid' 
    });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// @route   POST /api/register
// @desc    Register a new user
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: 'Please provide both email and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        msg: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ 
        success: false,
        msg: 'User already exists with this email' 
      });
    }

    // Create new user
    user = new User({ 
      email: email.toLowerCase(), 
      password 
    });

    // Hash password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();
    console.log('✅ New user registered:', email);

    // Create JWT token
    const payload = {
      user: { 
        id: user.id,
        email: user.email
      },
    };

    jwt.sign(
      payload, 
      JWT_SECRET, 
      { expiresIn: '24h' }, 
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          throw err;
        }
        res.json({ 
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during registration' 
    });
  }
});

// @route   POST /api/login
// @desc    Authenticate user & get token
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: 'Please provide both email and password' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    console.log('✅ User logged in:', email);

    // Create JWT token
    const payload = {
      user: { 
        id: user.id,
        email: user.email
      },
    };

    jwt.sign(
      payload, 
      JWT_SECRET, 
      { expiresIn: '24h' }, 
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          throw err;
        }
        res.json({ 
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error during login' 
    });
  }
});

// @route   GET /api/posts
// @desc    Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 posts for performance

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching posts' 
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
app.post('/api/posts', authMiddleware, async (req, res) => {
  const { content } = req.body;

  try {
    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'Post content cannot be empty' 
      });
    }

    if (content.length > 500) {
      return res.status(400).json({ 
        success: false,
        msg: 'Post content cannot exceed 500 characters' 
      });
    }

    // Get user info
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Create new post
    const newPost = new Post({
      author: user.email,
      content: content.trim(),
    });

    const post = await newPost.save();
    console.log('✅ New post created by:', user.email);

    res.json({ 
      success: true,
      post 
    });
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while creating post' 
    });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post
app.put('/api/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid post ID' 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        msg: 'Post not found' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    const userEmail = user.email;
    const hasLiked = post.likedBy.includes(userEmail);

    if (hasLiked) {
      // Unlike the post
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(email => email !== userEmail);
    } else {
      // Like the post
      post.likes += 1;
      post.likedBy.push(userEmail);
    }

    await post.save();

    res.json({ 
      success: true,
      post,
      action: hasLiked ? 'unliked' : 'liked'
    });
  } catch (error) {
    console.error('Like post error:', error.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while liking post' 
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (only by author)
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid post ID' 
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        msg: 'Post not found' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Check if user is the author
    if (post.author !== user.email) {
      return res.status(403).json({ 
        success: false,
        msg: 'Not authorized to delete this post' 
      });
    }

    await Post.findByIdAndDelete(postId);
    console.log('🗑️ Post deleted by:', user.email);

    res.json({ 
      success: true,
      msg: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error('Delete post error:', error.message);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while deleting post' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    success: false,
    msg: 'Something went wrong!' 
  });
});

// 404 handler - Express 5 compatible
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    msg: 'Route not found' 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('📊 Database connection closed.');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});