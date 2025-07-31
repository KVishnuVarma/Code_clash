// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStreak, useStreakFreeze } from '../services/streakService';
import toast from 'react-hot-toast';

const StreakTest = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const testGetStreak = async () => {
    try {
      setLoading(true);
      const data = await getUserStreak(token);
      setStreakData(data);
      toast.success('Streak data fetched successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to fetch streak data');
    } finally {
      setLoading(false);
    }
  };

  const testUseFreeze = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await useStreakFreeze(token);
      toast.success('Streak freeze used successfully!');
      await testGetStreak(); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to use streak freeze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Streak System Test</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <p><strong>User ID:</strong> {user?._id}</p>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={testGetStreak}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Streak Data'}
            </button>
            
            <button
              onClick={testUseFreeze}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Use Streak Freeze'}
            </button>
          </div>
        </div>

        {streakData && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Streak Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(streakData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakTest; 