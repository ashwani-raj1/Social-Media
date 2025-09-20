import React, { useState, useEffect } from 'react';

// Mock API functions (replace with your actual API calls)
const mockAPI = {
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, token: 'mock-token', user: { email } };
  },
  register: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, token: 'mock-token', user: { email } };
  },
  getPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        _id: '1',
        content: 'Just launched my new project! Excited to share it with the world 🚀',
        author: 'sarah.design@example.com',
        likes: 24,
        likedBy: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      },
      {
        _id: '2',
        content: 'Beautiful sunset today! Sometimes we need to pause and appreciate the simple moments in life. Nature has a way of reminding us what really matters.',
        author: 'mike.photo@example.com',
        likes: 18,
        likedBy: [],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      {
        _id: '3',
        content: 'Working late again but loving every minute of it! There\'s something magical about coding when the world is quiet.',
        author: 'alex.dev@example.com',
        likes: 31,
        likedBy: [],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      }
    ];
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for demo user
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');
    
    if (token && storedEmail) {
      setIsLoggedIn(true);
      setCurrentUserEmail(storedEmail);
      fetchPosts();
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
    setLoading(true);
    setError('');

    try {
      const response = isRegistering 
        ? await mockAPI.register(email, password)
        : await mockAPI.login(email, password);

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.user.email);
        
        setIsLoggedIn(true);
        setCurrentUserEmail(response.user.email);
        setEmail('');
        setPassword('');
        setMessage(isRegistering ? 'Welcome aboard! 🎉' : 'Welcome back! ✨');
        
        fetchPosts();
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    setCurrentUserEmail('');
    setPosts([]);
    setMessage('See you later! 👋');
  };

  const handlePostSubmit = async () => {    
    if (!newPost.trim()) return;

    const tempPost = {
      _id: Date.now().toString(),
      content: newPost.trim(),
      author: currentUserEmail,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
    };

    setPosts(prev => [tempPost, ...prev]);
    setNewPost('');
    setMessage('Post shared! 🎊');
  };

  const handleLike = (postId) => {
    setPosts(prev =>
      prev.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likedBy?.includes(currentUserEmail);
          return {
            ...post,
            likes: hasLiked ? post.likes - 1 : post.likes + 1,
            likedBy: hasLiked 
              ? post.likedBy.filter(email => email !== currentUserEmail)
              : [...(post.likedBy || []), currentUserEmail]
          };
        }
        return post;
      })
    );
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
    setMessage('Post deleted');
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getInitials = (email) => {
    return email?.split('@')[0]?.slice(0, 2)?.toUpperCase() || 'U';
  };

  const PostCard = ({ post }) => {
    const hasLiked = post.likedBy?.includes(currentUserEmail);
    const isAuthor = post.author === currentUserEmail;

    return (
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-start space-x-3 mb-4">
          <div className="relative">
            {post.avatar ? (
              <img 
                src={post.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                {getInitials(post.author)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {post.author.split('@')[0]}
                </h3>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
              
              {isAuthor && (
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        
        <div className="flex items-center space-x-6 pt-2 border-t border-gray-100">
          <button
            onClick={() => handleLike(post._id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
              hasLiked 
                ? 'bg-red-50 text-red-500 scale-105' 
                : 'hover:bg-gray-50 text-gray-600 hover:text-red-500'
            }`}
          >
            <span className="text-lg">{hasLiked ? '❤️' : '🤍'}</span>
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-50 text-gray-600 hover:text-blue-500 transition-all duration-200">
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">Reply</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-50 text-gray-600 hover:text-green-500 transition-all duration-200">
            <span className="text-lg">📤</span>
            <span className="text-sm font-medium">Share</span>
          </button>
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
        </div>
        
        <div className="relative w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                ✨
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isRegistering ? 'Join Vibe' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isRegistering ? 'Create your account to get started' : 'Sign in to continue your journey'}
              </p>
            </div>
            
            <div className="space-y-6">
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
                }}
                className="mt-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                disabled={loading}
              >
                {isRegistering ? 'Sign In' : 'Create Account'}
              </button>
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-xl">
              ✨
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Social Vibe
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getInitials(currentUserEmail)}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {currentUserEmail.split('@')[0]}
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
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
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
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePostSubmit}
                disabled={loading || !newPost.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-lg">📤</span>
                <span>Share Post</span>
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
      </main>
    </div>
  );
}

export default App;