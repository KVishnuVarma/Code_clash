import React from 'react';
import PostsFeed from '../Components/posts/PostsFeed';

const PostPage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-4xl mx-auto py-8">
                <h1 className="text-3xl font-bold mb-8 px-4">Community Posts</h1>
                <PostsFeed />
            </div>
        </div>
    );
};

export default PostPage;
