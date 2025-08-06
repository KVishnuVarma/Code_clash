import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Trophy, 
  Target, 
  Calendar,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Award,
  Flame,
  Code,
  Clock,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Globe,
  Github,
  Linkedin,
  GraduationCap,
  ExternalLink,
  Upload,
  Plus,
  Minus
} from 'lucide-react';
import UserNavbar from '../Components/UserNavbar';
import CalendarHeatmap from '../Components/CalendarHeatmap';
import { useTheme } from '../context/ThemeContext';
import useAuth from '../hooks/useAuth';
import { profileService } from '../services/authService';

function Profile() {
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  const { token } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    education: '',
    portfolio: '',
    github: '',
    linkedin: '',
    skills: []
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile picture upload
  const [profilePicture, setProfilePicture] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (token) {
      fetchProfileData();
      fetchStatistics();
    } else {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await profileService.getUserProfile(token);
      setProfileData(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        bio: data.bio || '',
        location: data.location || '',
        education: data.education || '',
        portfolio: data.portfolio || '',
        github: data.github || '',
        linkedin: data.linkedin || '',
        skills: data.skills || []
      });
      setProfilePicture(data.profilePicture || '');
    } catch (error) {
      setError(`Failed to load profile data: ${error.message}`);
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await profileService.getUserStatistics(token);
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      console.error('Error details:', error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      setError('');
      setSuccess('');
      
      console.log('Updating profile with data:', formData);
      console.log('Token exists:', !!token);
      
      const response = await profileService.updateEnhancedProfile(token, formData);
      console.log('Profile update response:', response);
      setProfileData(prev => ({ ...prev, ...response.user }));
      setEditing(false);
      setSuccess('Profile updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error details:', error.message);
      setError(error.message);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setError('');
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      
      await profileService.changePassword(token, passwordData.currentPassword, passwordData.newPassword);
      setPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleProfilePictureUpdate = async () => {
    try {
      setError('');
      setSuccess('');
      await profileService.updateProfilePicture(token, profilePicture);
      await fetchProfileData(); // Refetch profile data after update
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-orange-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'premium': return 'text-yellow-500';
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-400';
      case 'bronze': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getDifficultyCount = (difficulty) => {
    if (!statistics) return 0;
    switch (difficulty) {
      case 'easy': return statistics.easyProblems;
      case 'medium': return statistics.mediumProblems;
      case 'hard': return statistics.hardProblems;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-orange-500 ${themeColors.border}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeColors.bg}`}>
      <UserNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center"
          >
            <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
            {success}
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center"
          >
            <AlertCircle className="mr-3 h-5 w-5 text-red-500" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6 mb-6`}>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {profileData?.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      profileData?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  {profileData?.role === 'admin' && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1">
                      <Shield size={12} />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const url = prompt('Enter profile picture URL:');
                      if (url) {
                        setProfilePicture(url);
                        handleProfilePictureUpdate();
                      }
                    }}
                    className="absolute -bottom-1 -right-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full p-1 transition-colors"
                  >
                    <Upload size={12} />
                  </button>
                </div>
                
                <h2 className={`text-xl font-semibold ${themeColors.text} mt-4`}>
                  {profileData?.name || 'User'}
                </h2>
                <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                  {profileData?.email || ''}
                </p>
                {profileData?.rank > 0 && (
                  <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                    Rank {profileData.rank.toLocaleString()}
                  </p>
                )}
                
                <p className={`text-sm ${themeColors.textSecondary} mt-3 text-center`}>
                  {profileData?.bio || "Passionate developer with a strong foundation in programming."}
                </p>
                
                <button
                  onClick={() => setEditing(true)}
                  className={`mt-4 w-full ${themeColors.bg} hover:${themeColors.accentHover} ${themeColors.text} border ${themeColors.border} font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
              
              <div className="mt-6 space-y-3 text-sm">
                {profileData?.location && (
                  <div className={`flex items-center gap-2 ${themeColors.textSecondary}`}>
                    <MapPin size={16} />
                    {profileData.location}
                  </div>
                )}
                {profileData?.education && (
                  <div className={`flex items-center gap-2 ${themeColors.textSecondary}`}>
                    <GraduationCap size={16} />
                    {profileData.education}
                  </div>
                )}
                {profileData?.github && (
                  <a 
                    href={`https://github.com/${profileData.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${themeColors.textSecondary} hover:${themeColors.text} transition-colors`}
                  >
                    <Github size={16} />
                    {profileData.github}
                  </a>
                )}
                {profileData?.linkedin && (
                  <a 
                    href={`https://linkedin.com/in/${profileData.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${themeColors.textSecondary} hover:${themeColors.text} transition-colors`}
                  >
                    <Linkedin size={16} />
                    {profileData.linkedin}
                  </a>
                )}
                {profileData?.portfolio && (
                  <a 
                    href={profileData.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${themeColors.textSecondary} hover:${themeColors.text} transition-colors`}
                  >
                    <ExternalLink size={16} />
                    Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Community Stats */}
            <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6 mb-6`}>
              <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeColors.textSecondary}`}>Points</span>
                  <span className={`font-semibold ${themeColors.text}`}>
                    {statistics?.points || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeColors.textSecondary}`}>Current Streak</span>
                  <span className={`font-semibold ${themeColors.text}`}>
                    {statistics?.currentStreak || 0} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${themeColors.textSecondary}`}>Badge</span>
                  <span className={`font-semibold capitalize ${getBadgeColor(statistics?.badge)}`}>
                    {statistics?.badge || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${themeColors.text}`}>Badges</h3>
                <span className={`text-2xl font-bold ${themeColors.text}`}>
                  {profileData?.badges?.length || 0}
                </span>
              </div>
              <div className={`text-sm ${themeColors.textSecondary}`}>
                <div className="mb-2">Locked Badge</div>
                <div className={`${themeColors.text} font-medium`}>Aug Clash Coding Challenge</div>
              </div>
            </div>

            {/* Skills */}
            {profileData?.skills && profileData.skills.length > 0 && (
              <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6 mt-6`}>
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 ${themeColors.accentBg} ${themeColors.text} text-sm rounded-full border ${themeColors.border}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Solved Problems Stats */}
            <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Progress Circle */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    {/* This would be a proper circular progress chart */}
                    <div className={`w-32 h-32 rounded-full border-8 ${themeColors.border} relative`}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-3xl font-bold ${themeColors.text}`}>
                          {statistics?.totalProblems || 12}
                        </div>
                        <div className={`text-sm ${themeColors.textSecondary}`}>
                          /{(statistics?.totalEasy || 0) + (statistics?.totalMedium || 0) + (statistics?.totalHard || 0) || 3641}
                        </div>
                        <div className={`text-xs ${themeColors.textSecondary}`}>Solved</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-sm ${themeColors.textSecondary}`}>
                    0 Attempting
                  </div>
                </div>

                {/* Difficulty Stats */}
                <div className="flex-1 max-w-md">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <span className={`text-sm ${themeColors.textSecondary}`}>Easy</span>
                      </div>
                      <div className={`text-sm font-medium ${themeColors.text}`}>
                        {statistics?.easyProblems || 9}/{statistics?.totalEasy || 888}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                        <span className={`text-sm ${themeColors.textSecondary}`}>Med</span>
                      </div>
                      <div className={`text-sm font-medium ${themeColors.text}`}>
                        {statistics?.mediumProblems || 2}/{statistics?.totalMedium || 1894}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                        <span className={`text-sm ${themeColors.textSecondary}`}>Hard</span>
                      </div>
                      <div className={`text-sm font-medium ${themeColors.text}`}>
                        {statistics?.hardProblems || 1}/{statistics?.totalHard || 859}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission History */}
            <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${themeColors.text}`}>
                  {profileData?.submissionStats?.totalSubmissions || 19} submissions in the past one year
                </h3>
                <div className={`flex items-center gap-4 text-sm ${themeColors.textSecondary}`}>
                  <span>Total active days: {profileData?.submissionStats?.activeDays || 6}</span>
                  <span>Max streak: {profileData?.submissionStats?.maxStreak || 3}</span>
                </div>
              </div>
              
              {/* Calendar Heatmap */}
              <div className="mb-6">
                <CalendarHeatmap 
                  data={profileData?.submissionStats?.submissionHistory?.reduce((acc, entry) => {
                    const dateStr = new Date(entry.date).toISOString().split('T')[0];
                    acc[dateStr] = entry.submissions;
                    return acc;
                  }, {}) || {}}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border}`}>
              <div className={`border-b ${themeColors.border} px-6 py-4`}>
                <div className="flex space-x-8">
                  {[
                    { key: 'recent', label: 'Recent AC', icon: '📋' },
                    { key: 'list', label: 'List', icon: '📝' },
                    { key: 'solutions', label: 'Solutions', icon: '💡' },
                    { key: 'discuss', label: 'Discuss', icon: '💬' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? 'text-orange-600 border-b-2 border-orange-600'
                          : `${themeColors.textSecondary} hover:${themeColors.text}`
                      }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'recent' && (
                  <div className="space-y-3">
                    {profileData?.solvedProblems?.slice(-5).reverse().map((problem, index) => (
                      <div key={index} className={`${themeColors.accentBg} flex items-center justify-between py-3 px-4 rounded-lg`}>
                        <div>
                          <p className={`font-medium ${themeColors.text} text-sm`}>
                            {problem.problemId?.title || 'Two Sum'}
                          </p>
                          <p className={`text-xs ${themeColors.textSecondary}`}>
                            {problem.solvedAt ? new Date(problem.solvedAt).toLocaleDateString() : '14 days ago'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(problem.problemId?.difficulty)} bg-opacity-10`}>
                            {problem.problemId?.difficulty || 'Easy'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {(!profileData?.solvedProblems || profileData.solvedProblems.length === 0) && (
                      <div className="text-center py-12">
                        <p className={`${themeColors.textSecondary}`}>No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab !== 'recent' && (
                  <div className="text-center py-12">
                    <p className={`${themeColors.textSecondary}`}>No content available for this tab</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Profile Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeColors.bg} rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            <h3 className={`text-xl font-semibold ${themeColors.text} mb-6`}>Edit Profile</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Your location"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Your education"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="https://portfolio.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="username"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    LinkedIn Username
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 ${themeColors.accentBg} ${themeColors.text} text-sm rounded-full border ${themeColors.border} flex items-center`}
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className={`ml-2 ${themeColors.textSecondary} hover:${themeColors.text}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className={`flex-1 p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={addSkill}
                    className={`px-4 py-2 ${themeColors.accentBg} ${themeColors.text} rounded-lg hover:${themeColors.accentHover} transition-colors`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleProfileUpdate}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: profileData?.name || '',
                    email: profileData?.email || '',
                    bio: profileData?.bio || '',
                    location: profileData?.location || '',
                    education: profileData?.education || '',
                    portfolio: profileData?.portfolio || '',
                    github: profileData?.github || '',
                    linkedin: profileData?.linkedin || '',
                    skills: profileData?.skills || []
                  });
                }}
                className={`flex-1 ${themeColors.accentBg} hover:${themeColors.accentHover} ${themeColors.text} font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center border ${themeColors.border}`}
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${themeColors.bg} rounded-lg shadow-xl p-6 w-full max-w-md`}
          >
            <h3 className={`text-xl font-semibold ${themeColors.text} mb-4`}>Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeColors.textSecondary} hover:${themeColors.text}`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full p-3 border ${themeColors.border} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePasswordUpdate}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setError('');
                }}
                className={`flex-1 ${themeColors.accentBg} hover:${themeColors.accentHover} ${themeColors.text} font-medium py-2 px-4 rounded-lg transition-colors border ${themeColors.border}`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Profile;