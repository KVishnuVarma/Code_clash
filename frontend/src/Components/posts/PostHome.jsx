import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import UserNavbar from "../UserNavbar";
import { useInView } from "../../hooks/useInView";

const PostHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: [] });
  const [tagInput, setTagInput] = useState("");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { getThemeColors, theme, isDarkMode } = useTheme();
  const themeColors = getThemeColors();

  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleView = async (postId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/view`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPosts(currentPosts => 
          currentPosts.map(post => 
            post._id === postId ? { ...post, views: data.views } : post
          )
        );
      }
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.posts)) {
        const validatedPosts = data.posts.map((post) => ({
          ...post,
          likes: Array.isArray(post.likes) ? post.likes : [],
          likeCount: Array.isArray(post.likes) ? post.likes.length : 0,
          isLiked:
            user && Array.isArray(post.likes)
              ? post.likes.some((like) => like.toString() === user.id)
              : false,
        }));
        setPosts(validatedPosts);
      } else {
        console.error("Failed to fetch posts:", data);
        toast.error(data.message || "Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const url = editingPost
        ? `${import.meta.env.VITE_BACKEND_URL}/api/posts/${editingPost._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/posts/create`;

      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(newPost),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(
          editingPost
            ? "Post updated successfully!"
            : "Post created successfully!"
        );
        
        // Update posts state directly with new/updated post
        if (editingPost) {
          setPosts(currentPosts => 
            currentPosts.map(post => 
              post._id === editingPost._id ? data.post : post
            )
          );
        } else {
          // Add new post to the beginning of the list
          setPosts(currentPosts => [data.post, ...currentPosts]);
        }

        setNewPost({ title: "", content: "", tags: [] });
        setTagInput("");
        setShowPostForm(false);
        setEditingPost(null);
      }
    } catch (error) {
      console.error("Error with post:", error);
      toast.error(
        editingPost ? "Failed to update post" : "Failed to create post"
      );
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      tags: post.tags || [],
    });
    setShowPostForm(true);
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Post deleted successfully!");
        // Update posts state directly by filtering out the deleted post
        setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!newPost.tags.includes(tagInput.trim())) {
        setNewPost((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleLike = async (postId) => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    try {
      const currentPost = posts.find((p) => p._id === postId);
      if (!currentPost) return;

      const previousPosts = [...posts];
      const hasLiked = currentPost.likes.some((id) => id === user.id);

      setPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              likes: hasLiked
                ? post.likes.filter((id) => id !== user.id)
                : [...post.likes, user.id],
              likeCount: hasLiked ? post.likeCount - 1 : post.likeCount + 1,
              isLiked: !hasLiked,
            };
          }
          return post;
        })
      );

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPosts(previousPosts);
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (data.success) {
        const updatedLikes = Array.isArray(data.likes) ? data.likes : [];

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: updatedLikes,
                  likeCount: data.likesCount || updatedLikes.length,
                  isLiked: data.isLiked || updatedLikes.includes(user.id),
                }
              : post
          )
        );

        toast.success(
          data.message || (data.isLiked ? "Post liked!" : "Post unliked!")
        );
      } else {
        console.error("Like update failed:", {
          response: data,
          postId,
          userId: user?.id,
        });

        setPosts(previousPosts);
        throw new Error(data.message || "Failed to update like status");
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error(error.message || "Failed to like post");
    }
  };

  const handleComment = async (postId, comment) => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: comment }),
        }
      );
      if (response.ok) {
        fetchPosts();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className={`min-h-screen ${themeColors.bg} ${themeColors.text}`}>
      <UserNavbar />
      <div className="max-w-2xl mx-auto py-8 px-4 mt-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <h1 className="text-4xl font-light text-gray-100 tracking-wide">
            Posts
          </h1>
          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPostForm(true)}
              className={`px-6 py-2.5 ${themeColors.buttonBg} ${themeColors.buttonHover} border ${themeColors.border} rounded-xl ${themeColors.text} font-medium transition-all duration-200`}
            >
              New Post
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-gray-200 font-medium transition-all duration-200"
            >
              Sign In
            </motion.button>
          )}
        </motion.div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showPostForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowPostForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${themeColors.secondaryBg} border ${themeColors.border} rounded-2xl p-8 max-w-2xl w-full shadow-2xl`}
              >
                <h2 className="text-2xl font-light mb-6 text-gray-100">
                  {editingPost ? "Edit Post" : "Create Post"}
                </h2>
                <form onSubmit={handleSubmitPost} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <input
                      type="text"
                      placeholder="Post title..."
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                      className={`w-full p-4 ${themeColors.inputBg} border ${themeColors.border} rounded-xl ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200`}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <textarea
                      placeholder="What's on your mind?"
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost({ ...newPost, content: e.target.value })
                      }
                      className={`w-full p-4 ${themeColors.inputBg} border ${themeColors.border} rounded-xl min-h-[200px] ${themeColors.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200 resize-none`}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <input
                      type="text"
                      placeholder="Add tags (press Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInput}
                      className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-200"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newPost.tags.map((tag, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-lg text-sm flex items-center gap-2 border border-gray-600"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-400 transition-colors duration-200"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                  <div className="flex justify-end gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowPostForm(false)}
                      className="px-6 py-2.5 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className={`px-8 py-2.5 ${themeColors.buttonBg} ${themeColors.buttonHover} ${themeColors.text} rounded-xl transition-all duration-200`}
                    >
                      {editingPost ? "Update" : "Post"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-gray-600 border-t-gray-400 rounded-full mx-auto"
            />
            <p className="text-gray-500 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {posts.map((post, index) => (
              <PostCard
                key={post._id}
                post={post}
                index={index}
                themeColors={themeColors}
                user={user}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleLike={handleLike}
                showComments={showComments}
                setShowComments={setShowComments}
                newComment={newComment}
                setNewComment={setNewComment}
                handleComment={handleComment}
                handleView={handleView}
                useInView={useInView}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({
  post,
  index,
  themeColors,
  user,
  handleEdit,
  handleDelete,
  handleLike,
  showComments,
  setShowComments,
  newComment,
  setNewComment,
  handleComment,
  handleView,
  useInView,
}) => {
  const [postRef] = useInView({
    threshold: 0.5,
    onEnterView: () => handleView(post._id),
  });

  return (
    <motion.div
      ref={postRef}
      key={post._id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${themeColors.secondaryBg} backdrop-blur-sm border ${themeColors.border} rounded-2xl p-6 hover:border-opacity-70 transition-all duration-300`}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${post.userId}`} className="flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-gray-200 font-medium overflow-hidden border-2 border-gray-700"
            >
              {post.profilePicture ? (
                <img
                  src={post.profilePicture}
                  alt={`${post.username}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.textContent =
                      post.username?.charAt(0)?.toUpperCase() || "U";
                  }}
                />
              ) : (
                post.username?.charAt(0)?.toUpperCase() || "U"
              )}
            </motion.div>
          </Link>
          <div>
            <Link
              to={`/profile/${post.userId}`}
              className="font-medium text-gray-200 hover:text-white transition-colors duration-200"
            >
              {post.username}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {user && (post.userId === user.id || user.username === post.username) && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleEdit(post)}
              className="p-2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDelete(post._id)}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>

      {/* Post Title */}
      {post.title && (
        <h3 className="text-xl font-medium text-gray-100 mb-4">
          {post.title}
        </h3>
      )}

      {/* Post Content */}
      <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLike(post._id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                user && post.isLiked
                  ? "text-red-400 bg-red-950/30"
                  : "text-gray-400 hover:text-red-400 hover:bg-red-950/20"
              }`}
            >
              <motion.svg
                animate={user && post.isLiked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="w-5 h-5"
                fill={user && post.isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </motion.svg>
              <span className="text-sm font-medium">{post.likeCount || 0}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setShowComments((prev) => ({
                  ...prev,
                  [post._id]: !prev[post._id],
                }))
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
            </motion.button>
            <div className="flex items-center gap-2 px-4 py-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium">{post.views || 0}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments[post._id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Comment Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleComment(post._id, newComment[post._id]);
                    setNewComment((prev) => ({
                      ...prev,
                      [post._id]: "",
                    }));
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={newComment[post._id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    placeholder="Add a comment..."
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all duration-200"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-xl transition-all duration-200"
                  >
                    Post
                  </motion.button>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {post.comments?.map((comment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${themeColors.commentBg} rounded-xl p-4 border ${themeColors.border}`}
                    >
                      <div className="flex gap-3">
                        <Link
                          to={`/profile/${comment.userId}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-gray-200 text-sm font-medium overflow-hidden">
                            {comment.profilePicture ? (
                              <img
                                src={comment.profilePicture}
                                alt={`${comment.username}'s avatar`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.textContent =
                                    comment.username
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U";
                                }}
                              />
                            ) : (
                              comment.username
                                ?.charAt(0)
                                ?.toUpperCase() || "U"
                            )}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              to={`/profile/${comment.userId}`}
                              className="text-sm font-medium text-gray-200 hover:text-white transition-colors duration-200"
                            >
                              {comment.username}
                            </Link>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PostHome;