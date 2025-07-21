import { useState } from "react";
import Sidebar from "./sidebar";

function LeaderBoard() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <Sidebar onExpandChange={setIsSidebarExpanded} />
      <div
        className="flex-1 p-6 transition-all duration-300"
        style={{ marginLeft: isSidebarExpanded ? 240 : 85 }}
      >
        LeaderBoard
      </div>
    </div>
  );
}

export default LeaderBoard;
