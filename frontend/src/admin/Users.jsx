import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Access Denied! No Token Provided. Please log in.");
                setLoading(false);
                navigate("/login");
                return;
            }

            const res = await fetch("http://localhost:5000/api/auth/admin/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
            });

            const text = await res.text();

            try {
                const data = JSON.parse(text);
                if (!res.ok) throw new Error(data.message || "Failed to fetch users");

                const filteredUsers = data.filter(user => user.role !== "admin");
                setUsers(filteredUsers);
            } catch (jsonError) {
                throw new Error("Invalid JSON response from server");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSuspendUser = async (userId, isSuspended) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Access Denied! No Token Provided. Please log in.");
                navigate("/login");
                return;
            }

            const res = await fetch(`http://localhost:5000/api/admin/suspend-user/${userId}`, { 
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ isSuspended: !isSuspended }),
            });

            const text = await res.text();

            try {
                const data = JSON.parse(text);
                if (!res.ok) throw new Error(data.message || "Failed to update user status");

                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId ? { ...user, isSuspended: !isSuspended } : user
                    )
                );
            } catch (jsonError) {
                throw new Error("Invalid JSON response from server");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <p className="text-center text-blue-400 text-lg animate-pulse">Loading users...</p>;
    if (error) return <p className="text-center text-red-500 font-bold">{error}</p>;

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col items-center p-6">
            <h2 className="text-4xl font-extrabold mb-6 text-center">Admin User Manager</h2>
            <div className="w-full max-w-5xl overflow-x-auto bg-gray-800 p-4 rounded-lg shadow-xl">
                <table className="w-full border-collapse border border-gray-600 shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-700 text-gray-300">
                            <th className="border border-gray-600 px-4 py-2">Name</th>
                            <th className="border border-gray-600 px-4 py-2">Email</th>
                            <th className="border border-gray-600 px-4 py-2">Role</th>
                            <th className="border border-gray-600 px-4 py-2">Activity Log</th>
                            <th className="border border-gray-600 px-4 py-2">Status</th>
                            <th className="border border-gray-600 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id} className="border border-gray-600 text-center transition-all duration-300 hover:bg-gray-700">
                                    <td className="border border-gray-600 px-4 py-2">{user.name}</td>
                                    <td className="border border-gray-600 px-4 py-2">{user.email}</td>
                                    <td className="border border-gray-600 px-4 py-2">{user.role}</td>
                                    <td className="border border-gray-600 px-4 py-2">
                                        {user.activityLog && user.activityLog.length > 0 ? (
                                            <ul className="list-disc text-left pl-5 text-gray-400">
                                                {user.activityLog.map((log, index) => (
                                                    <li key={index} className="transition-all duration-300 hover:text-gray-200">{log}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-500">No activity recorded</span>
                                        )}
                                    </td>
                                    <td className="border border-gray-600 px-4 py-2 font-bold">
                                        {user.isSuspended ? (
                                            <span className="text-red-400 animate-pulse">Suspended</span>
                                        ) : (
                                            <span className="text-green-400">Active</span>
                                        )}
                                    </td>
                                    <td className="border border-gray-600 px-4 py-2">
                                        <button
                                            onClick={() => toggleSuspendUser(user._id, user.isSuspended)}
                                            className={`px-3 py-1 rounded text-white transition-all duration-300 shadow-md transform hover:scale-105 ${
                                                user.isSuspended 
                                                    ? "bg-green-500 hover:bg-green-600" 
                                                    : "bg-red-500 hover:bg-red-600"
                                            }`}
                                        >
                                            {user.isSuspended ? "Unsuspend" : "Suspend"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-gray-400 py-4">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
