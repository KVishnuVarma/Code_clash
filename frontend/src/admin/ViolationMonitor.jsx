import React, { useState, useEffect } from "react";
import { Palette, Shield, AlertTriangle, Users, MessageSquare, X, Loader2, Copy, Smartphone, ExternalLink } from "lucide-react";

const ViolationMonitor = () => {
  const [violations, setViolations] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentTheme, setCurrentTheme] = useState('slate');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('violations');

  useEffect(() => {
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchViolations(),
        fetchSuspendedUsers(),
        fetchContactMessages()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/violations`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setViolations(data.violations || []);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const fetchSuspendedUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/all-users`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        const suspended = data.users.filter(user => user.isSuspended);
        setSuspendedUsers(suspended);
      }
    } catch (error) {
      console.error('Error fetching suspended users:', error);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/contact-messages`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContactMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    }
  };

  const colorThemes = {
    slate: {
      name: 'Slate',
      primary: 'from-slate-900 via-slate-800 to-slate-700',
      secondary: 'from-slate-800 to-slate-700',
      accent: 'bg-slate-600',
      card: 'bg-slate-800/80',
      text: 'text-slate-100',
      textSecondary: 'text-slate-300',
      border: 'border-slate-600',
      button: 'bg-slate-700 hover:bg-slate-600',
      dot: 'bg-slate-500'
    },
    zinc: {
      name: 'Zinc',
      primary: 'from-zinc-900 via-zinc-800 to-zinc-700',
      secondary: 'from-zinc-800 to-zinc-700',
      accent: 'bg-zinc-600',
      card: 'bg-zinc-800/80',
      text: 'text-zinc-100',
      textSecondary: 'text-zinc-300',
      border: 'border-zinc-600',
      button: 'bg-zinc-700 hover:bg-zinc-600',
      dot: 'bg-zinc-500'
    },
    stone: {
      name: 'Stone',
      primary: 'from-stone-900 via-stone-800 to-stone-700',
      secondary: 'from-stone-800 to-stone-700',
      accent: 'bg-stone-600',
      card: 'bg-stone-800/80',
      text: 'text-stone-100',
      textSecondary: 'text-stone-300',
      border: 'border-stone-600',
      button: 'bg-stone-700 hover:bg-stone-600',
      dot: 'bg-stone-500'
    },
    gray: {
      name: 'Gray',
      primary: 'from-gray-900 via-gray-800 to-gray-700',
      secondary: 'from-gray-800 to-gray-700',
      accent: 'bg-gray-600',
      card: 'bg-gray-800/80',
      text: 'text-gray-100',
      textSecondary: 'text-gray-300',
      border: 'border-gray-600',
      button: 'bg-gray-700 hover:bg-gray-600',
      dot: 'bg-gray-500'
    }
  };

  const theme = colorThemes[currentTheme];

  const handleUnsuspendUser = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/unsuspend-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': sessionStorage.getItem('token')
        },
        body: JSON.stringify({ isSuspended: false })
      });
      if (response.ok) {
        await fetchSuspendedUsers();
        await fetchViolations();
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-900/30';
      case 'High': return 'text-orange-400 bg-orange-900/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-green-400 bg-green-900/30';
    }
  };

  const getViolationReason = (violation) => {
    if (!violation) return 'Policy violation detected';
    
    const violationData = violation.violation || violation;
    const type = violationData.type;
    const description = violationData.description;
    const reason = violationData.reason;
    
    // Return specific reason based on violation type
    switch (type) {
      case 'tab_change':
        return 'Tab switching detected - User switched to another tab/window';
      case 'copy_paste':
        return description || 'Copy-paste activity detected';
      case 'mobile_detected':
        return 'Mobile device detected - User accessed from mobile device';
      case 'exam_terminated':
        return reason || 'Exam terminated due to policy violation';
      case 'copyPaste':
        return 'Copy-paste activity detected';
      case 'tabChange':
        return 'Tab switching detected';
      case 'mobileDetected':
        return 'Mobile device detected';
      default:
        return description || reason || 'Policy violation detected';
    }
  };

  const getUserViolationReason = (user) => {
    // Check if user has any violations in the violations array
    const userViolations = violations.filter(v => v.userId?._id === user._id || v.userId === user._id);
    if (userViolations.length > 0) {
      // Get the most recent violation
      const latestViolation = userViolations[0]; // Assuming violations are sorted by date desc
      return getViolationReason(latestViolation);
    }
    
    // Fallback to user's suspension reason or default
    return user.suspensionReason || user.violationReason || 'Policy violation';
  };

  const getViolationIcon = (violation) => {
    if (!violation) return AlertTriangle;
    
    const violationData = violation.violation || violation;
    const type = violationData.type;
    
    switch (type) {
      case 'tab_change':
      case 'tabChange':
        return ExternalLink;
      case 'copy_paste':
      case 'copyPaste':
        return Copy;
      case 'mobile_detected':
      case 'mobileDetected':
        return Smartphone;
      case 'exam_terminated':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.primary} p-6 transition-all duration-700 ease-in-out relative overflow-hidden font-['Inter',_'SF_Pro_Display',_'Segoe_UI',_system-ui,_sans-serif]`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-500/5 rounded-full animate-bounce delay-500" style={{animationDuration: '3s'}}></div>
      </div>

      {/* Theme Selector */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={`${theme.card} ${theme.text} p-3 rounded-xl backdrop-blur-sm border ${theme.border} hover:scale-105 transition-all duration-300 shadow-lg`}
          >
            <Palette className="w-5 h-5" />
          </button>
          
          {showThemeSelector && (
            <div className={`absolute right-0 top-12 ${theme.card} backdrop-blur-sm border ${theme.border} rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-300 min-w-48`}>
              <div className="flex items-center gap-2 mb-3">
                <Palette className={`w-4 h-4 ${theme.text}`} />
                <span className={`${theme.text} font-medium text-sm`}>Choose Color Theme</span>
              </div>
              
              {Object.entries(colorThemes).map(([key, themeOption]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentTheme(key);
                    setShowThemeSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    currentTheme === key ? `${theme.accent} ${theme.text}` : `hover:${theme.accent}/50 ${theme.textSecondary}`
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${themeOption.dot} animate-pulse`}></div>
                  <span className="text-sm font-medium">{themeOption.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-10 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-3 mb-4">
          <Shield className={`w-8 h-8 ${theme.text} animate-pulse`} />
          <h1 className={`text-5xl font-black ${theme.text} drop-shadow-2xl tracking-tight`}>
            Violation Monitor
          </h1>
          <Shield className={`w-8 h-8 ${theme.text} animate-pulse delay-500`} />
        </div>
        <p className={`${theme.textSecondary} text-lg font-semibold tracking-wide`}>
          Advanced Security Dashboard
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
        <div className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-2 shadow-xl`}>
          {[
            { id: 'violations', label: 'Violations', icon: AlertTriangle },
            { id: 'suspended', label: 'Suspended Users', icon: Users },
            { id: 'messages', label: 'Contact Messages', icon: MessageSquare }
          // eslint-disable-next-line no-unused-vars
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold tracking-wide ${
                activeTab === id 
                  ? `${theme.accent} ${theme.text} shadow-lg transform scale-105` 
                  : `${theme.textSecondary} hover:${theme.accent}/50 hover:scale-102`
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-400">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <Loader2 className={`w-8 h-8 ${theme.text} animate-spin`} />
              <span className={`${theme.text} text-xl font-semibold tracking-wide`}>Loading data...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'violations' && (
              <div className="grid gap-6">
                {violations.length === 0 ? (
                  <div className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-8 text-center shadow-xl`}>
                    <AlertTriangle className={`w-12 h-12 ${theme.textSecondary} mx-auto mb-4`} />
                    <p className={`${theme.textSecondary} text-lg font-semibold`}>No violations found</p>
                  </div>
                ) : (
                  violations.map((violation, index) => (
                    <div
                      key={violation._id || violation.id}
                      className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-left-4`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                                             <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center gap-3">
                           {(() => {
                             const IconComponent = getViolationIcon(violation);
                             return <IconComponent className="w-6 h-6 text-red-400 animate-pulse" />;
                           })()}
                           <div>
                             <h3 className={`${theme.text} text-xl font-bold tracking-wide`}>{violation.violation?.type || violation.type || 'Policy Violation'}</h3>
                             <p className={`${theme.textSecondary} text-sm font-medium`}>User: {violation.userId?.name || violation.username || violation.userId || 'Unknown User'}</p>
                           </div>
                         </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${getSeverityColor(violation.violation?.severity || violation.severity)}`}>
                          {violation.violation?.severity || violation.severity || 'Medium'}
                        </span>
                      </div>
                                             <p className={`${theme.textSecondary} mb-3 font-medium leading-relaxed`}>{getViolationReason(violation)}</p>
                      <p className={`${theme.textSecondary} text-sm font-semibold`}>Date: {new Date(violation.timestamp || violation.date || violation.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'suspended' && (
              <div className="grid gap-6">
                {suspendedUsers.length === 0 ? (
                  <div className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-8 text-center shadow-xl`}>
                    <Users className={`w-12 h-12 ${theme.textSecondary} mx-auto mb-4`} />
                    <p className={`${theme.textSecondary} text-lg font-semibold`}>No suspended users found</p>
                  </div>
                ) : (
                  suspendedUsers.map((user, index) => (
                    <div
                      key={user._id || user.id}
                      className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-right-4`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-orange-400 animate-pulse" />
                          <div>
                            <h3 className={`${theme.text} text-xl font-bold tracking-wide`}>{user.name || 'Unknown User'}</h3>
                            <p className={`${theme.textSecondary} text-sm font-medium`}>{user.email || 'No email'}</p>
                            <p className={`${theme.textSecondary} text-sm font-medium`}>Suspended: {new Date(user.updatedAt || user.createdAt || Date.now()).toLocaleDateString()}</p>
                                                         <p className={`${theme.textSecondary} text-sm font-medium`}>Reason: {getUserViolationReason(user)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnsuspendUser(user._id || user.id)}
                          className={`${theme.button} ${theme.text} px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg tracking-wide`}
                        >
                          Unsuspend
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="grid gap-6">
                {contactMessages.length === 0 ? (
                  <div className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-8 text-center shadow-xl`}>
                    <MessageSquare className={`w-12 h-12 ${theme.textSecondary} mx-auto mb-4`} />
                    <p className={`${theme.textSecondary} text-lg font-semibold`}>No contact messages found</p>
                  </div>
                ) : (
                  contactMessages.map((message, index) => (
                    <div
                      key={message._id || message.id}
                      className={`${theme.card} backdrop-blur-sm border ${theme.border} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-4`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-400 animate-pulse" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className={`${theme.text} text-xl font-bold tracking-wide`}>{message.userId?.name || 'Unknown User'}</h3>
                              <p className={`${theme.textSecondary} text-sm font-medium`}>{message.userId?.email || 'No email'}</p>
                            </div>
                                                          <span className={`${theme.textSecondary} text-sm font-semibold`}>{new Date(message.timestamp || message.date || message.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className={`${theme.text} font-bold mb-2 tracking-wide`}>Contact Message</h4>
                          <p className={`${theme.textSecondary} font-medium leading-relaxed`}>{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Animation Elements */}
      <div className="fixed bottom-4 left-4 animate-bounce delay-1000 pointer-events-none">
        <div className={`w-3 h-3 ${theme.dot} rounded-full opacity-60`}></div>
      </div>
      <div className="fixed bottom-8 left-8 animate-bounce delay-1500 pointer-events-none">
        <div className={`w-2 h-2 ${theme.dot} rounded-full opacity-40`}></div>
      </div>
      <div className="fixed bottom-6 left-12 animate-bounce delay-2000 pointer-events-none">
        <div className={`w-4 h-4 ${theme.dot} rounded-full opacity-30`}></div>
      </div>
    </div>
  );
};

export default ViolationMonitor;