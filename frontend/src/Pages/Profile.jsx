import { useState } from "react";
import Sidebar from './sidebar';

function Profile() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <Sidebar onExpandChange={setIsSidebarExpanded} />
      <div
        className="flex-1 p-6 transition-all duration-300 text-center"
        style={{ marginLeft: isSidebarExpanded ? 240 : 85 }}
      >
       profile
      </div>
    </div>
  );
}

export default Profile;