import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Trophy, List, BarChart, LogOut } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  // Mock data - replace with real data from your backend
  const contestData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    participants: [65, 89, 103, 87, 120, 150],
    submissions: [45, 76, 88, 72, 98, 130],
    completionRates: [70, 85, 85, 83, 82, 87],
  };

  const skillDistribution = {
    labels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    data: [30, 45, 20, 5],
  };

  const problemCategories = {
    labels: ['Arrays', 'Strings', 'Dynamic Programming', 'Trees', 'Graphs'],
    submissions: [250, 180, 120, 200, 150],
    successRate: [75, 65, 45, 60, 55],
  };

  // Enhanced chart options and styling
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderDash: [5, 5]
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-6">
      <h1 className="text-4xl font-extrabold text-white mb-10 text-center drop-shadow-lg">
        Admin Dashboard
      </h1>
      
      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Contest Participation Trends</h2>
          <Line
            data={{
              labels: contestData.labels,
              datasets: [
                {
                  label: 'Participants',
                  data: contestData.participants,
                  borderColor: '#00ff87',
                  backgroundColor: 'rgba(0, 255, 135, 0.1)',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#00ff87',
                  pointBorderColor: '#00ff87',
                  pointHoverRadius: 6,
                },
                {
                  label: 'Submissions',
                  data: contestData.submissions,
                  borderColor: '#ff3366',
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#ff3366',
                  pointBorderColor: '#ff3366',
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={lineChartOptions}
          />
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Problem Category Analysis</h2>
          <Bar
            data={{
              labels: problemCategories.labels,
              datasets: [
                {
                  label: 'Total Submissions',
                  data: problemCategories.submissions,
                  backgroundColor: 'rgba(64, 185, 255, 0.8)',
                  borderRadius: 8,
                  borderSkipped: false,
                },
                {
                  label: 'Success Rate (%)',
                  data: problemCategories.successRate,
                  backgroundColor: 'rgba(255, 199, 0, 0.8)',
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              ...lineChartOptions,
              barPercentage: 0.7,
              categoryPercentage: 0.7,
            }}
          />
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">User Skill Distribution</h2>
          <div className="w-full max-w-md mx-auto">
            <Doughnut
              data={{
                labels: skillDistribution.labels,
                datasets: [
                  {
                    data: skillDistribution.data,
                    backgroundColor: [
                      '#FF6B6B',  // Vibrant red
                      '#4ECDC4',  // Turquoise
                      '#45B7D1',  // Sky blue
                      '#96CEB4',  // Mint green
                    ],
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: 'white',
                      font: {
                        size: 12,
                        weight: 'bold'
                      },
                      padding: 20
                    }
                  }
                },
                cutout: '60%',
                radius: '90%'
              }}
            />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Contest Completion Rates</h2>
          <Line
            data={{
              labels: contestData.labels,
              datasets: [
                {
                  label: 'Completion Rate (%)',
                  data: contestData.completionRates,
                  borderColor: '#9d4edd',
                  backgroundColor: 'rgba(157, 78, 221, 0.2)',
                  fill: true,
                  borderWidth: 3,
                  tension: 0.4,
                  pointBackgroundColor: '#9d4edd',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={{
              ...lineChartOptions,
              scales: {
                ...lineChartOptions.scales,
                y: {
                  ...lineChartOptions.scales.y,
                  max: 100,
                }
              }
            }}
          />
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <DashboardCard
          title="Manage Users"
          description="View, edit, and manage user accounts."
          to="/admin-dashboard/users"
          icon={<Users size={32} />}
        />
        <DashboardCard
          title="Manage Contests"
          description="Create and update coding contests."
          to="/admin-dashboard/contests"
          icon={<Trophy size={32} />}
        />
        <DashboardCard
          title="Manage Problems"
          description="Add, edit, and organize coding problems."
          to="/admin-dashboard/problems"
          icon={<List size={32} />}
        />
        <DashboardCard
          title="Leaderboard"
          description="Track top performers in contests."
          to="/admin-dashboard/leaderboard"
          icon={<BarChart size={32} />}
        />
        <DashboardCard
          title="Logout"
          description="Exit admin panel securely."
          to="/login"
          icon={<LogOut size={32} />}
          customClass="bg-gray-500 text-white"
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, to, icon, customClass = "" }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate(to);
    }, 2000);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-xl bg-gray-800 bg-opacity-40 backdrop-blur-md transition-all transform hover:scale-105 hover:bg-opacity-60 border-2 border-gray-500 hover:border-white hover:shadow-2xl cursor-pointer ${customClass}`}
      onClick={handleClick}
    >
      {loading ? (
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <div className="mb-4 text-gray-300">{icon}</div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-gray-400 text-sm text-center">{description}</p>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;