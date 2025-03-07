import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaTrophy, FaCode, FaUsers, FaUserShield } from "react-icons/fa";
import codeclashLogo from "../assets/codeclash.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${codeclashLogo})` }}
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl relative z-10"
      >
        <motion.img
          src={codeclashLogo}
          alt="CodeClash Logo"
          className="w-96 h-96 md:w-[450px] md:h-[450px] rounded-full shadow-2xl border-4 border-indigo-500 p-4 mb-6 md:mb-0"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1, y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="text-center md:text-left space-y-6 max-w-lg"
        >
          <h1 className="text-5xl font-bold text-white leading-tight">
            Welcome to <span className="text-indigo-400">CodeClash</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Compete in thrilling contests, enhance your coding skills, and rise through the ranks.
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/register")}
            className="mt-5 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-600 transition duration-300"
          >
            Register Now
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-16 w-full max-w-6xl p-10 rounded-lg shadow-lg relative z-10"
      >
        <h2 className="text-4xl text-center text-indigo-400 font-bold mb-8">
          CodeClash Overview
        </h2>

        <div className="space-y-10">
          {[
            {
              icon: <FaTrophy className="text-yellow-400 text-6xl" />, 
              title: "Step 1: Join Contests",
              desc: "Dive into a world of competitive programming where you can challenge yourself against coders from across the globe.",
            },
            {
              icon: <FaCode className="text-blue-400 text-6xl" />, 
              title: "Step 2: Solve Coding Problems",
              desc: "Tackle a vast collection of programming challenges designed to enhance your logical thinking and algorithmic skills.",
            },
            {
              icon: <FaUsers className="text-green-400 text-6xl" />, 
              title: "Step 3: Track Your Rank",
              desc: "Stay motivated by tracking your progress on the leaderboard. Compete with friends, challenge top coders, and climb the rankings.",
            },
            {
              icon: <FaUserShield className="text-red-400 text-6xl" />, 
              title: "Step 4: Admin Panel",
              desc: "CodeClash isn’t just for participants—administrators play a key role in shaping the experience.",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.3 }}
              className="flex items-center space-x-6 bg-transparent p-6 rounded-lg shadow-lg backdrop-blur-md"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                {step.icon}
              </motion.div>
              <div>
                <h3 className="text-xl text-white font-semibold">{step.title}</h3>
                <p className="text-white text-md">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
