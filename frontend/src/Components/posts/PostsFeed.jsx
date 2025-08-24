import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Post from './Post';
import { Plus, Image } from 'react-feather';
import toast from 'react-hot-toast';

const PostsFeed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedImage) {
            toast.error('Post cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const newPost = await response.json();
                setPosts(prev => [newPost, ...prev]);
                setNewPostContent('');
                setSelectedImage(null);
                setIsCreatingPost(false);
                toast.success('Post created successfully');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setPosts(prev => prev.map(post =>
                    post._id === postId
                        ? {
                            ...post,
                            likes: data.likes
                        }
                        : post
                ));
            }
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (postId, comment) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ content: comment })
            });

            if (response.ok) {
                const newComment = await response.json();
                setPosts(prev => prev.map(post =>
                    post._id === postId
                        ? { ...post, comments: [...post.comments, newComment] }
                        : post
                ));
            }
        } catch (error) {
            console.error('Error commenting on post:', error);
            toast.error('Failed to add comment');
        }
    };

    const handleShare = async (postId) => {
        try {
            await navigator.clipboard.writeText(
                `${window.location.origin}/posts/${postId}`
            );
            toast.success('Post link copied to clipboard');
        } catch (error) {
            console.error('Error sharing post:', error);
            toast.error('Failed to share post');
        }
    };

    const handleBookmark = async (postId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/bookmark`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setPosts(prev => prev.map(post =>
                    post._id === postId
                        ? {
                            ...post,
                            bookmarks: post.bookmarks.includes(user.id)
                                ? post.bookmarks.filter(id => id !== user.id)
                                : [...post.bookmarks, user.id]
                        }
                        : post
                ));
            }
        } catch (error) {
            console.error('Error bookmarking post:', error);
            toast.error('Failed to bookmark post');
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                {!isCreatingPost ? (
                    <button
                        onClick={() => setIsCreatingPost(true)}
                        className="w-full p-4 text-left text-gray-500 hover:bg-gray-50"
                    >
                        What's on your mind?
                    </button>
                ) : (
                    <div className="p-4">
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />
                        
                        {selectedImage && (
                            <div className="mt-2 relative">
                                <img
                                    src={URL.createObjectURL(selectedImage)}
                                    alt="Selected"
                                    className="max-h-48 rounded"
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer text-gray-500 hover:text-blue-500">
                                    <Image size={20} />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) setSelectedImage(file);
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsCreatingPost(false);
                                        setNewPostContent('');
                                        setSelectedImage(null);
                                    }}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={isLoading || (!newPostContent.trim() && !selectedImage)}
                                    className={`px-4 py-2 rounded-lg ${
                                        isLoading || (!newPostContent.trim() && !selectedImage)
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >
                                    {isLoading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
                {posts.map(post => (
                    <Post
                        key={post._id}
                        post={post}
                        currentUser={user}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onBookmark={handleBookmark}
                    />
                ))}
            </div>
        </div>
    );
};

export default PostsFeed;
