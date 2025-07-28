import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  return (
    <footer className={`${colors.bg} ${colors.text} py-8`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Left Section - Brand Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-bold border border-black">
                CC
              </div>
              <span className="text-xl font-bold">CodeClash</span>
            </div>
            <p className={`${colors.textSecondary} text-sm`}>
              Master competitive programming with structured problems and real-time contests.
            </p>
                         <button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-shadow">
               <span>Sponsor Us</span>
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                 <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7z" />
               </svg>
             </button>
          </div>

          {/* Middle Section - Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="/problems" className={`block ${colors.text} hover:${colors.activeText} transition-colors`}>Problems</a>
              <a href="/contests" className={`block ${colors.text} hover:${colors.activeText} transition-colors`}>Contests</a>
              <a href="/leaderboard" className={`block ${colors.text} hover:${colors.activeText} transition-colors`}>Leaderboard</a>
              <a href="/profile" className={`block ${colors.text} hover:${colors.activeText} transition-colors`}>Profile</a>
            </div>
          </div>

          {/* Right Section - Developer Information */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-lg mb-4">Developed and Maintained By</h3>
            <div className="space-y-4">
              {/* First Developer */}
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-medium">
                  Vishnu Varma
                </span>
                <div className="flex space-x-2">
                  <a href="#" className={`w-8 h-8 ${colors.border} ${colors.accentBg} flex items-center justify-center ${colors.accentHover} transition-colors`}>
                    <span className="text-xs font-bold">in</span>
                  </a>
                  <a href="#" className={`w-8 h-8 ${colors.border} ${colors.accentBg} flex items-center justify-center ${colors.accentHover} transition-colors`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className={`w-8 h-8 ${colors.border} ${colors.accentBg} flex items-center justify-center ${colors.accentHover} transition-colors`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                  <a href="#" className={`w-8 h-8 ${colors.border} ${colors.accentBg} flex items-center justify-center ${colors.accentHover} transition-colors`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright and Legal */}
        <div className={`border-t ${colors.border} pt-6 text-center`}>
          <p className={`${colors.textSecondary} text-sm mb-2`}>
            © {new Date().getFullYear()} CodeClash. All rights reserved.
          </p>
          <div className={`${colors.textSecondary} text-sm`}>
            <a href="/privacy" className={`hover:${colors.activeText} transition-colors`}>Privacy Policy</a>
            <span className="mx-2">|</span>
            <a href="/terms" className={`hover:${colors.activeText} transition-colors`}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  