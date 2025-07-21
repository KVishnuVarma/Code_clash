import { useState } from "react";
import Sidebar from "./sidebar"; // Import Sidebar

function UserDashboard() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <Sidebar onExpandChange={setIsSidebarExpanded} />
      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: isSidebarExpanded ? 240 : 85 }}
      >
        <h1 className="text-center text-2xl font-bold text-white">Welcome to the User Dashboard</h1>
      </div>
    </div>
  );
}

export default UserDashboard;
