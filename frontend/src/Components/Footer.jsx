import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  return (
    <footer className={`${colors.bg} ${colors.text} border-t ${colors.border}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-lg font-bold rounded-lg shadow-lg">
                CC
              </div>
              <span className={`text-2xl font-bold ${colors.text}`}>
                CodeClash
              </span>
            </div>
            
            <p className={`${colors.textSecondary} text-base leading-relaxed max-w-md`}>
              Master competitive programming with structured problems and real-time contests. 
              Join thousands of developers improving their coding skills daily.
            </p>
            
            <button className="bg-gradient-to-r from-orange-500 to-orange-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              <span>Sponsor Us</span>
            </button>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h3 className={`font-bold text-lg ${colors.text} mb-4 relative group cursor-pointer`}>
              Quick Links
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
            </h3>
            <nav className="space-y-3">
              <a href="/userDashboard/user-problems" 
                 className={`block ${colors.textSecondary} hover:${colors.text} hover:translate-x-2 transition-all duration-300 flex items-center space-x-2 group`}>
                <span className="w-1 h-1 bg-orange-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                <span>Problems</span>
              </a>
              <a href="/userDashboard/user-contests" 
                 className={`block ${colors.textSecondary} hover:${colors.text} hover:translate-x-2 transition-all duration-300 flex items-center space-x-2 group`}>
                <span className="w-1 h-1 bg-orange-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                <span>Contests</span>
              </a>
              <a href="/userDashboard/user-leaderboard" 
                 className={`block ${colors.textSecondary} hover:${colors.text} hover:translate-x-2 transition-all duration-300 flex items-center space-x-2 group`}>
                <span className="w-1 h-1 bg-orange-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                <span>Leaderboard</span>
              </a>
              <a href="/userDashboard/user-profile" 
                 className={`block ${colors.textSecondary} hover:${colors.text} hover:translate-x-2 transition-all duration-300 flex items-center space-x-2 group`}>
                <span className="w-1 h-1 bg-orange-500 rounded-full group-hover:w-2 transition-all duration-300"></span>
                <span>Profile</span>
              </a>
            </nav>
          </div>

          {/* Developer Section */}
          <div className="space-y-6">
            <h3 className={`font-bold text-lg ${colors.text} mb-4 relative group cursor-pointer`}>
            DevCrux
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
            </h3>
            
            <div className="space-y-4">
              {/* Developer Card */}
              <div className={`${colors.border} border rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-opacity-50 backdrop-blur-sm`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center ${colors.text} font-bold text-sm`}>
                    VV
                  </div>
                  <div>
                    <span className={`block font-semibold ${colors.text}`}>Vishnu Varma</span>
                    <span className={`text-sm ${colors.textSecondary}`}>Full Stack Developer</span>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="flex space-x-6 justify-center">
                  <a href="https://www.linkedin.com/in/vishnu-varma-kalidindi/" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className={`w-8 h-8 bg-blue-600 hover:bg-blue-700 ${colors.text} flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  
                  <a href="https://github.com/KVishnuVarma" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className={`w-8 h-8 bg-gray-800 hover:bg-gray-900 ${colors.text} flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  
                  <a href="mailto:raghuvarmakalidindi12345@gmail.com" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className={`w-8 h-8 bg-red-600 hover:bg-red-700 ${colors.text} flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-1.147.51-2.376.855-3.672 1.01 1.321-.791 2.336-2.046 2.815-3.541-1.236.731-2.605 1.26-4.061 1.548-1.166-1.243-2.826-2.017-4.663-2.017-3.531 0-6.389 2.858-6.389 6.39 0 .5.058.99.169 1.459-5.313-.267-10.024-2.812-13.177-6.68-.55.944-.864 2.042-.864 3.213 0 2.218 1.129 4.175 2.846 5.321-1.05-.034-2.037-.322-2.901-.803v.081c0 3.098 2.204 5.683 5.133 6.269-.538.146-1.103.225-1.688.225-.413 0-.813-.04-1.205-.116.814 2.544 3.176 4.395 5.972 4.448-2.187 1.714-4.947 2.734-7.944 2.734-.516 0-1.025-.03-1.526-.089 2.83 1.815 6.194 2.876 9.806 2.876 11.765 0 18.204-9.747 18.204-18.204 0-.278-.006-.555-.018-.831 1.249-.9 2.332-2.025 3.188-3.307z"/>
                    </svg>
                  </a>
                  
                  <a href="https://www.instagram.com/kalidindi_vishnu_varma_219/?next=%2F" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className={`w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 ${colors.text} flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Enhanced */}
        <div className={`border-t ${colors.border} pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className={`${colors.text} text-sm`}>
                © {new Date().getFullYear()} CodeClash. All rights reserved.
              </p>
              <div className="hidden md:block w-px h-4 bg-gray-600"></div>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="/privacy" 
                 className={`${colors.textSecondary} hover:${colors.text} transition-colors text-sm hover:underline`}>
                Privacy Policy
              </a>
              <a href="/terms" 
                 className={`${colors.textSecondary} hover:${colors.text} transition-colors text-sm hover:underline`}>
                Terms of Service
              </a>
              <a href="/contact" 
                 className={`${colors.textSecondary} hover:${colors.text} transition-colors text-sm hover:underline`}>
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;