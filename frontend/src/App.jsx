import React, { useState, useEffect } from 'react';

// Mock API functions with localStorage persistence
const mockAPI = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return { success: true, token: 'mock-token', user };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (email, password, fullName) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      fullName: fullName || email.split('@')[0],
      bio: 'New to Social Vibe! 👋',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=100&h=100&fit=crop&crop=face`,
      joinDate: new Date().toISOString(),
      followers: [],
      following: []
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, token: 'mock-token', user: newUser };
  },

  getPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Add user data to posts
    return posts.map(post => {
      const author = users.find(u => u.email === post.author);
      return {
        ...post,
        authorData: author
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createPost: async (content, author, image = null) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const newPost = {
      _id: Date.now().toString(),
      content: content.trim(),
      author,
      image,
      likes: 0,
      likedBy: [],
      comments: [],
      shares: 0,
      sharedBy: [],
      createdAt: new Date().toISOString()
    };
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    return newPost;
  },

  updateProfile: async (email, updates) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      return users[userIndex];
    }
    throw new Error('User not found');
  }
};

// Initialize with sample data if none exists
const initializeSampleData = () => {
  if (!localStorage.getItem('posts')) {
    const samplePosts = [
      {
        _id: '1',
        content: 'Just launched my new project! Excited to share it with the world 🚀\n\nIt\'s been months of hard work, but seeing it come together is incredibly rewarding.',
        author: 'sarah.design@example.com',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&h=300&fit=crop',
        likes: 24,
        likedBy: ['mike.photo@example.com', 'alex.dev@example.com'],
        comments: [
          {
            id: '1',
            author: 'mike.photo@example.com',
            content: 'Congratulations! This looks amazing 🎉',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            author: 'alex.dev@example.com',
            content: 'Great job Sarah! The UI is beautiful',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          }
        ],
        shares: 3,
        sharedBy: ['alex.dev@example.com'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        content: 'Beautiful sunset today! Sometimes we need to pause and appreciate the simple moments in life. Nature has a way of reminding us what really matters. 🌅✨',
        author: 'mike.photo@example.com',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        likes: 18,
        likedBy: ['sarah.design@example.com'],
        comments: [
          {
            id: '3',
            author: 'sarah.design@example.com',
            content: 'Absolutely stunning! Where was this taken?',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ],
        shares: 1,
        sharedBy: [],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        content: 'Working late again but loving every minute of it! There\'s something magical about coding when the world is quiet. 💻🌙\n\n#coding #developer #nightowl',
        author: 'alex.dev@example.com',
        image: null,
        likes: 31,
        likedBy: ['sarah.design@example.com', 'mike.photo@example.com'],
        comments: [],
        shares: 2,
        sharedBy: ['sarah.design@example.com'],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('posts', JSON.stringify(samplePosts));
  }

  if (!localStorage.getItem('users')) {
    const sampleUsers = [
      {
        id: '1',
        email: 'sarah.design@example.com',
        password: 'password123',
        fullName: 'Sarah Johnson',
        bio: 'UI/UX Designer passionate about creating beautiful experiences ✨',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        followers: ['mike.photo@example.com', 'alex.dev@example.com'],
        following: ['mike.photo@example.com']
      },
      {
        id: '2',
        email: 'mike.photo@example.com',
        password: 'password123',
        fullName: 'Mike Chen',
        bio: 'Photographer capturing life\'s beautiful moments 📸',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        joinDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        followers: ['sarah.design@example.com'],
        following: ['sarah.design@example.com', 'alex.dev@example.com']
      },
      {
        id: '3',
        email: 'alex.dev@example.com',
        password: 'password123',
        fullName: 'Alex Rivera',
        bio: 'Full-stack developer building the future 🚀',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        joinDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        followers: ['sarah.design@example.com', 'mike.photo@example.com'],
        following: ['mike.photo@example.com']
      }
    ];
    localStorage.setItem('users', JSON.stringify(sampleUsers));
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('home'); // home, profile, search
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [profileEdit, setProfileEdit] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    initializeSampleData();
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
    
    if (token && storedEmail) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === storedEmail);
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        fetchPosts();
      }
    }
  }, []);

  useEffect(() => {
    if (error || message) {
      const timer = setTimeout(() => {
        setError('');
        setMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  useEffect(() => {
    // Filter posts based on search query
    if (searchQuery.trim()) {
      const filtered = posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorData?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await mockAPI.getPosts();
      setPosts(response);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isRegistering && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = isRegistering 
        ? await mockAPI.register(email.toLowerCase().trim(), password, fullName.trim())
        : await mockAPI.login(email.toLowerCase().trim(), password);

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.user.email);
        
        setIsLoggedIn(true);
        setCurrentUser(response.user);
        setEmail('');
        setPassword('');
        setFullName('');
        setMessage(isRegistering ? 'Welcome aboard! 🎉' : 'Welcome back! ✨');
        
        fetchPosts();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPosts([]);
    setActiveView('home');
    setMessage('See you later! 👋');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setSelectedImage(e.target.result);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {    
    if (!newPost.trim() && !selectedImage) {
      setError('Please add some content or an image');
      return;
    }

    setLoading(true);
    try {
      await mockAPI.createPost(newPost, currentUser.email, selectedImage);
      setNewPost('');
      setSelectedImage(null);
      setImagePreview(null);
      setMessage('Post shared! 🎊');
      fetchPosts();
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId) => {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = posts.findIndex(p => p._id === postId);
    
    if (postIndex !== -1) {
      const hasLiked = posts[postIndex].likedBy?.includes(currentUser.email);
      
      if (hasLiked) {
        posts[postIndex].likedBy = posts[postIndex].likedBy.filter(email => email !== currentUser.email);
        posts[postIndex].likes = Math.max(0, posts[postIndex].likes - 1);
      } else {
        posts[postIndex].likedBy = [...(posts[postIndex].likedBy || []), currentUser.email];
        posts[postIndex].likes = posts[postIndex].likes + 1;
      }
      
      localStorage.setItem('posts', JSON.stringify(posts));
      fetchPosts();
    }
  };

  const handleShare = (postId) => {
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = posts.findIndex(p => p._id === postId);
    
    if (postIndex !== -1) {
      const hasShared = posts[postIndex].sharedBy?.includes(currentUser.email);
      
      if (!hasShared) {
        posts[postIndex].sharedBy = [...(posts[postIndex].sharedBy || []), currentUser.email];
        posts[postIndex].shares = posts[postIndex].shares + 1;
        localStorage.setItem('posts', JSON.stringify(posts));
        fetchPosts();
        setMessage('Post shared! 📤');
        
        // Copy link to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`Check out this post: ${posts[postIndex].content.substring(0, 50)}...`);
        }
      }
    }
  };

  const handleComment = (postId) => {
    if (!newComment[postId]?.trim()) return;
    
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = posts.findIndex(p => p._id === postId);
    
    if (postIndex !== -1) {
      const comment = {
        id: Date.now().toString(),
        author: currentUser.email,
        content: newComment[postId].trim(),
        createdAt: new Date().toISOString()
      };
      
      posts[postIndex].comments = [...(posts[postIndex].comments || []), comment];
      localStorage.setItem('posts', JSON.stringify(posts));
      
      setNewComment({ ...newComment, [postId]: '' });
      fetchPosts();
      setMessage('Comment added! 💬');
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    const posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const filteredPosts = posts.filter(post => post._id !== postId);
    localStorage.setItem('posts', JSON.stringify(filteredPosts));
    fetchPosts();
    setMessage('Post deleted');
  };

  const handleFollow = (userEmail) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUserIndex = users.findIndex(u => u.email === currentUser.email);
    const targetUserIndex = users.findIndex(u => u.email === userEmail);
    
    if (currentUserIndex !== -1 && targetUserIndex !== -1) {
      const isFollowing = users[currentUserIndex].following?.includes(userEmail);
      
      if (isFollowing) {
        users[currentUserIndex].following = users[currentUserIndex].following.filter(email => email !== userEmail);
        users[targetUserIndex].followers = users[targetUserIndex].followers.filter(email => email !== currentUser.email);
        setMessage(`Unfollowed ${users[targetUserIndex].fullName}`);
      } else {
        users[currentUserIndex].following = [...(users[currentUserIndex].following || []), userEmail];
        users[targetUserIndex].followers = [...(users[targetUserIndex].followers || []), currentUser.email];
        setMessage(`Now following ${users[targetUserIndex].fullName}`);
      }
      
      localStorage.setItem('users', JSON.stringify(users));
      setCurrentUser(users[currentUserIndex]);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileEdit.fullName?.trim()) {
      setError('Full name is required');
      return;
    }

    if (profileEdit.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await mockAPI.updateProfile(currentUser.email, profileEdit);
      setCurrentUser(updatedUser);
      setProfileEdit({});
      setMessage('Profile updated successfully! ✨');
      
      // Update current user in localStorage as well
      localStorage.setItem('email', updatedUser.email);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const PostCard = ({ post }) => {
    const hasLiked = post.likedBy?.includes(currentUser.email);
    const hasShared = post.sharedBy?.includes(currentUser.email);
    const isAuthor = post.author === currentUser.email;
    const isFollowing = currentUser.following?.includes(post.author);

    return (
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-start space-x-3 mb-4">
          <div className="relative">
            {post.authorData?.avatar ? (
              <img 
                src={post.authorData.avatar} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                {getInitials(post.authorData?.fullName || post.author)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors cursor-pointer">
                  {post.authorData?.fullName || post.author.split('@')[0]}
                </h3>
                <p className="text-sm text-gray-500">@{post.author.split('@')[0]} • {formatDate(post.createdAt)}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isAuthor && (
                  <button
                    onClick={() => handleFollow(post.author)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                
                {isAuthor && (
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        
        {post.image && (
          <div className="mb-4">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full rounded-2xl object-cover max-h-96"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                hasLiked 
                  ? 'bg-red-50 text-red-500 scale-105' 
                  : 'hover:bg-gray-50 text-gray-600 hover:text-red-500'
              }`}
            >
              <span className="text-lg">{hasLiked ? '❤️' : '🤍'}</span>
              <span className="text-sm font-medium">{post.likes || 0}</span>
            </button>
            
            <button 
              onClick={() => toggleComments(post._id)}
              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-50 text-gray-600 hover:text-blue-500 transition-all duration-200"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </button>
            
            <button 
              onClick={() => handleShare(post._id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                hasShared
                  ? 'bg-green-50 text-green-500'
                  : 'hover:bg-gray-50 text-gray-600 hover:text-green-500'
              }`}
            >
              <span className="text-lg">📤</span>
              <span className="text-sm font-medium">{post.shares || 0}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments[post._id] && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Add Comment */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
                {getInitials(currentUser.fullName)}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment[post._id] || ''}
                  onChange={(e) => setNewComment({
                    ...newComment,
                    [post._id]: e.target.value
                  })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                />
                <button
                  onClick={() => handleComment(post._id)}
                  disabled={!newComment[post._id]?.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  📩
                </button>
              </div>
            </div>

            {/* Comments List */}
            {post.comments?.map((comment) => {
              const commentAuthor = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.email === comment.author);
              return (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {getInitials(commentAuthor?.fullName || comment.author)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl px-4 py-2">
                      <p className="font-medium text-sm text-gray-900">
                        {commentAuthor?.fullName || comment.author.split('@')[0]}
                      </p>
                      <p className="text-gray-800">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ProfileView = () => {
    const userPosts = posts.filter(post => post.author === currentUser.email);
    const isEditing = Object.keys(profileEdit).length > 0;

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/50"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(currentUser.fullName)}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={profileEdit.fullName || currentUser.fullName}
                    onChange={(e) => setProfileEdit({...profileEdit, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <textarea
                    placeholder="Bio"
                    value={profileEdit.bio || currentUser.bio}
                    onChange={(e) => setProfileEdit({...profileEdit, bio: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="3"
                  />
                  <input
                    type="url"
                    placeholder="Avatar URL"
                    value={profileEdit.avatar || currentUser.avatar}
                    onChange={(e) => setProfileEdit({...profileEdit, avatar: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-all"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setProfileEdit({})}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentUser.fullName}</h1>
                  <p className="text-gray-600 mb-2">@{currentUser.email.split('@')[0]}</p>
                  <p className="text-gray-700 mb-4">{currentUser.bio}</p>
                  
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{userPosts.length}</p>
                      <p className="text-sm text-gray-600">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{currentUser.followers?.length || 0}</p>
                      <p className="text-sm text-gray-600">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{currentUser.following?.length || 0}</p>
                      <p className="text-sm text-gray-600">Following</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setProfileEdit({
                        fullName: currentUser.fullName,
                        bio: currentUser.bio,
                        avatar: currentUser.avatar
                      })}
                      className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              📅 Joined {new Date(currentUser.joinDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* User's Posts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Your Posts ({userPosts.length})</h2>
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 font-medium mb-2">No posts yet</p>
              <p className="text-gray-500">Start sharing your thoughts with the world!</p>
              <button
                onClick={() => setActiveView('home')}
                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const NotificationToast = () => {
    if (!error && !message) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-bounce">
        <div className={`px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border ${
          error 
            ? 'bg-red-50/90 border-red-200 text-red-700' 
            : 'bg-green-50/90 border-green-200 text-green-700'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-lg">{error ? '⚠️' : '✅'}</span>
            <span className="font-medium">{error || message}</span>
            <button
              onClick={() => {
                setError('');
                setMessage('');
              }}
              className="p-1 rounded-full hover:bg-black/10 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <NotificationToast />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl animate-bounce">
                ✨
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isRegistering ? 'Join Social Vibe' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isRegistering ? 'Create your account to get started' : 'Sign in to continue your journey'}
              </p>
            </div>
            
            <div className="space-y-6">
              {isRegistering && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              
              <button
                type="button"
                onClick={handleAuth}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isRegistering ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="mt-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                disabled={loading}
              >
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
            </div>
            
            {/* Demo Account Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
        
              <div className="space-y-1 text-xs text-blue-600">
                <button 
                  onClick={() => {
                    setEmail('sarah.design@example.com');
                    setPassword('password123');
                  }}
                  className="block w-full text-left hover:text-blue-800 transition-colors"
                >
                
                </button>
                <button 
                  onClick={() => {
                    setEmail('mike.photo@example.com');
                    setPassword('password123');
                  }}
                  className="block w-full text-left hover:text-blue-800 transition-colors"
                >
        
                </button>
                <button 
                  onClick={() => {
                    setEmail('alex.dev@example.com');
                    setPassword('password123');
                  }}
                  className="block w-full text-left hover:text-blue-800 transition-colors"
                >
           
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <NotificationToast />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl">
                ✨
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Social Vibe
              </h1>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveView('home')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeView === 'home' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                🏠 Home
              </button>
              <button
                onClick={() => setActiveView('search')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeView === 'search' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                🔍 Search
              </button>
              <button
                onClick={() => setActiveView('profile')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeView === 'profile' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                👤 Profile
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(currentUser.fullName)}
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {currentUser.fullName}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-200 hover:scale-105"
              >
                <span className="text-lg">🚪</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {activeView === 'profile' && <ProfileView />}
        
        {activeView === 'search' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">🔍</span>
                <input
                  type="text"
                  placeholder="Search posts, users, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-4 text-sm text-gray-600">
                  Found {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
            </div>
            
            <div className="space-y-6">
              {searchQuery ? (
                filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => <PostCard key={post._id} post={post} />)
                ) : (
                  <div className="text-center py-12 bg-white/50 rounded-2xl">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-600 font-medium mb-2">No results found</p>
                    <p className="text-gray-500">Try searching for something else</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-white/50 rounded-2xl">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-600 font-medium mb-2">Start searching</p>
                  <p className="text-gray-500">Enter keywords to find posts and users</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeView === 'home' && (
          <>
            {/* Create Post */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span className="text-2xl">✏️</span>
                <span>What's on your mind?</span>
              </h2>
              
              <div>
                <div className="mb-4">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something amazing..."
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-400 bg-gray-50"
                    rows="4"
                    maxLength={500}
                    disabled={loading}
                  />
                  <div className="text-right text-sm text-gray-500 mt-2">
                    {newPost.length}/500
                  </div>
                </div>
                
                {/* Image Upload */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                    >
                      <span className="text-lg">📷</span>
                      <span>Add Photo</span>
                    </label>
                    
                    {(newPost.trim() || selectedImage) && (
                      <div className="text-sm text-gray-500">
                        {selectedImage ? '📷 Image attached' : `📝 ${newPost.trim().split(' ').length} words`}
                      </div>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full rounded-2xl object-cover max-h-64"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedImage(null);
                          document.getElementById('image-upload').value = '';
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePostSubmit}
                    disabled={loading || (!newPost.trim() && !selectedImage)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="text-lg">📤</span>
                    <span>{loading ? 'Sharing...' : 'Share Post'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading && posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading amazing posts...</p>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => <PostCard key={post._id} post={post} />)
              ) : (
                <div className="text-center py-12 bg-white/50 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                    💬
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No posts yet!</p>
                  <p className="text-gray-500">Be the first to share something amazing.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;