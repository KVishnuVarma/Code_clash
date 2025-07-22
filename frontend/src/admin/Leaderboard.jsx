import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/auth/api/leaderboard");
                if (!response.ok) throw new Error("Failed to fetch leaderboard data");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Rank-based neon styles
    const getRankStyle = (index) => {
        if (index === 0) return "bg-[#0A192F] text-[#00E5FF] shadow-[0_0_25px_#00E5FF] font-extrabold"; // Electric Blue
        if (index === 1) return "bg-[#260F26] text-[#FF00FF] shadow-[0_0_25px_#FF00FF] font-bold"; // Neon Magenta
        if (index === 2) return "bg-[#102A10] text-[#00FF00] shadow-[0_0_25px_#00FF00] font-semibold"; // Neon Green
        return "bg-[#111827] text-gray-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]"; // Default Grayish-White
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-5">
            <motion.div
                className="w-full h-full max-w-7xl p-6 rounded-xl bg-black/30 backdrop-blur-lg border border-gray-700 shadow-2xl"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.h2
                    className="text-5xl font-extrabold text-center mb-6 text-[#00E5FF] tracking-widest uppercase"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    Leaderboard
                </motion.h2>

                {loading ? (
                    <p className="text-center text-xl text-gray-400 animate-pulse">Loading...</p>
                ) : (
                    <motion.div
                        className="w-full h-[70vh] overflow-auto"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                    >
                        <table className="w-full text-center border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-[#121212] text-[#00E5FF] border-b-2 border-[#00E5FF] uppercase tracking-widest">
                                    <th className="px-8 py-4">Rank</th>
                                    <th className="px-8 py-4">Name</th>
                                    <th className="px-8 py-4">Department</th>
                                    <th className="px-8 py-4">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <motion.tr
                                            key={user._id}
                                            className={`text-center hover:scale-105 hover:shadow-2xl transition-all duration-500 ease-in-out ${getRankStyle(index)}`}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.2, duration: 0.8 }}
                                        >
                                            <td className="px-8 py-4 font-semibold text-2xl">
                                                {index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : index + 1}
                                            </td>
                                            <td className="px-8 py-4 text-xl">{user.name}</td>
                                            <td className="px-8 py-4 text-gray-300">{user.department || "N/A"}</td>
                                            <td className="px-8 py-4 font-bold text-2xl">{user.points}</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-4 text-center text-gray-400">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Leaderboard;
