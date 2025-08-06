import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserNavbar from '../Components/UserNavbar';
import { useTheme } from '../context/ThemeContext';
import {
  User as UserIcon,
  Award,
  Flame,
  Code,
  Shield,
  AlertCircle,
  Globe,
  Github,
  Linkedin,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

function PublicProfile() {
  const { name } = useParams();
  const { getThemeColors } = useTheme();
  const themeColors = getThemeColors();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile/name/${encodeURIComponent(name)}`;
        const response = await fetch(url);
        if (!response.ok) {
          let errorMsg = 'Failed to fetch user profile';
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) errorMsg = errorData.message;
          } catch {
            // ignore JSON parse error
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching public profile:', error);
        setError(error.message || 'Failed to load user profile. The user may not exist.');
      } finally {
        setLoading(false);
      }
    };
    if (name) {
      fetchPublicProfile();
    }
  }, [name]);

  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'premium': return 'text-purple-500';
      default: return themeColors.textSecondary;
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
            <AlertCircle className="mr-3 h-5 w-5 text-red-500" />
            {error}
          </div>
        )}

        {!error && profileData && (
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
                  </div>
                  
                  <h2 className={`text-xl font-semibold ${themeColors.text} mt-4`}>
                    {profileData?.name || 'User'}
                  </h2>
                  <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                    @{profileData?.username || name}
                  </p>
                  {profileData?.rank > 0 && (
                    <p className={`text-sm ${themeColors.textSecondary} mt-1`}>
                      Rank {profileData.rank.toLocaleString()}
                    </p>
                  )}
                  
                  <p className={`text-sm ${themeColors.textSecondary} mt-3 text-center`}>
                    {profileData?.bio || "Passionate developer with a strong foundation in programming."}
                  </p>
                </div>
                
                <div className="mt-6 space-y-3 text-sm">
                  {profileData?.location && (
                    <div className={`flex items-center gap-2 ${themeColors.textSecondary}`}>
                      <Globe size={16} />
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
                      {profileData?.points || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${themeColors.textSecondary}`}>Current Streak</span>
                    <span className={`font-semibold ${themeColors.text}`}>
                      {profileData?.streak?.currentStreak || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${themeColors.textSecondary}`}>Badge</span>
                    <span className={`font-semibold capitalize ${getBadgeColor(profileData?.streak?.badge)}`}>
                      {profileData?.streak?.badge || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {profileData?.skills && profileData.skills.length > 0 && (
                <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6`}>
                  <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 ${themeColors.accentBg} ${themeColors.text} text-sm rounded-full`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Problem Solving Stats */}
              <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6 mb-6`}>
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Problem Solving Stats</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`${themeColors.cardBg} p-4 rounded-lg border ${themeColors.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-orange-500" />
                        <span className={`font-medium ${themeColors.text}`}>Total Points</span>
                      </div>
                      <span className={`text-xl font-bold ${themeColors.text}`}>{profileData?.points || 0}</span>
                    </div>
                    <p className={`text-xs ${themeColors.textSecondary}`}>Earned from solving problems</p>
                  </div>
                  
                  <div className={`${themeColors.cardBg} p-4 rounded-lg border ${themeColors.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className={`font-medium ${themeColors.text}`}>Current Streak</span>
                      </div>
                      <span className={`text-xl font-bold ${themeColors.text}`}>{profileData?.streak?.currentStreak || 0}</span>
                    </div>
                    <p className={`text-xs ${themeColors.textSecondary}`}>Consecutive days solving problems</p>
                  </div>
                  
                  <div className={`${themeColors.cardBg} p-4 rounded-lg border ${themeColors.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-orange-500" />
                        <span className={`font-medium ${themeColors.text}`}>Problems Solved</span>
                      </div>
                      <span className={`text-xl font-bold ${themeColors.text}`}>{profileData?.solvedProblems?.length || 0}</span>
                    </div>
                    <p className={`text-xs ${themeColors.textSecondary}`}>Total problems completed</p>
                  </div>
                </div>
                
                {/* Problem Difficulty Breakdown */}
                <div className="mb-6">
                  <h4 className={`text-md font-medium ${themeColors.text} mb-3`}>Problems by Difficulty</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${profileData?.solvedProblems?.filter(p => p.problemId?.difficulty === 'Easy').length / (profileData?.solvedProblems?.length || 1) * 100}%` }}></div>
                      </div>
                      <span className={`text-sm ${themeColors.text} ml-2`}>Easy</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${profileData?.solvedProblems?.filter(p => p.problemId?.difficulty === 'Medium').length / (profileData?.solvedProblems?.length || 1) * 100}%` }}></div>
                      </div>
                      <span className={`text-sm ${themeColors.text} ml-2`}>Medium</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${profileData?.solvedProblems?.filter(p => p.problemId?.difficulty === 'Hard').length / (profileData?.solvedProblems?.length || 1) * 100}%` }}></div>
                      </div>
                      <span className={`text-sm ${themeColors.text} ml-2`}>Hard</span>
                    </div>
                  </div>
                </div>
                
                {/* Topics Solved */}
                <div>
                  <h4 className={`text-md font-medium ${themeColors.text} mb-3`}>Topics Solved</h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(profileData?.solvedProblems?.map(p => p.problemId?.category).filter(Boolean) || [])).map((topic, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 ${themeColors.buttonBg} ${themeColors.text} text-sm rounded-full`}
                      >
                        {topic}
                      </span>
                    ))}
                    
                    {(!profileData?.solvedProblems || profileData.solvedProblems.length === 0) && (
                      <p className={`text-sm ${themeColors.textSecondary}`}>No topics solved yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className={`${themeColors.bg} rounded-lg shadow-sm border ${themeColors.border} p-6`}>
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Recent Activity</h3>
                
                {profileData?.solvedProblems && profileData.solvedProblems.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.solvedProblems.slice(0, 5).map((problem, index) => (
                      <div key={index} className={`p-3 border ${themeColors.border} rounded-lg`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className={`font-medium ${themeColors.text}`}>{problem.problemId?.title || 'Problem'}</h4>
                            <p className={`text-xs ${themeColors.textSecondary}`}>
                              {new Date(problem.solvedAt).toLocaleDateString()} • {problem.problemId?.difficulty || 'Unknown'} • {problem.problemId?.category || 'General'}
                            </p>
                          </div>
                          <div className={`px-2 py-1 text-xs rounded ${problem.problemId?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : problem.problemId?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {problem.problemId?.difficulty || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${themeColors.textSecondary}`}>No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;