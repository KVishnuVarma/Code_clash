import UserNavbar from "../Components/UserNavbar";

function UserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
      <UserNavbar />
      <div className="p-6 transition-all duration-300 pt-20">
        <h1 className="text-center text-2xl font-bold text-white">Welcome to the User Dashboard</h1>
      </div>
    </div>
  );
}

export default UserDashboard;
