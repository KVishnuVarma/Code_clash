import UserNavbar from "../Components/UserNavbar";

function LeaderBoard() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        LeaderBoard
      </div>
    </div>
  );
}

export default LeaderBoard;
