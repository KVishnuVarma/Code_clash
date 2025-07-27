import React from "react";
import { AlertTriangle, Users, Shield } from "lucide-react";

const ViolationMonitor = ({ violations, suspendedUsers, contactMessages, onUnsuspendUser }) => {
  return (
    <div>
      {/* Violations and Suspensions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Violations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-2" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Recent Violations</h2>
          </div>
          <div className="space-y-3">
            {violations.length > 0 ? (
              violations.map((violation) => (
                <div key={violation._id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-red-800">{violation.violation.reason || violation.violation.type}</p>
                      <p className="text-sm text-red-600">User: {violation.userId?.name || violation.userId?.email || violation.userId}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(violation.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {violation.violation.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent violations</p>
            )}
          </div>
        </div>

        {/* Suspended Users */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="text-orange-500 mr-2" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Suspended Users</h2>
          </div>
          <div className="space-y-3">
            {suspendedUsers.length > 0 ? (
              suspendedUsers.map((user) => (
                <div key={user._id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-orange-800">{user.name}</p>
                      <p className="text-sm text-orange-600">{user.email}</p>
                    </div>
                    {onUnsuspendUser && (
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full transition-colors"
                        onClick={() => onUnsuspendUser(user._id)}
                      >
                        Restore Access
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No suspended users</p>
            )}
          </div>
        </div>
      </div>
      {/* Contact Messages Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <Users className="text-blue-500 mr-2" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Contact Messages from Users</h2>
        </div>
        <div className="space-y-3">
          {contactMessages.length > 0 ? (
            contactMessages.map((msg) => (
              <div key={msg._id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="mb-1">
                  <span className="font-semibold text-blue-800">{msg.name}</span>
                  <span className="ml-2 text-sm text-blue-600">{msg.email}</span>
                  <span className="ml-2 text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-gray-800 text-sm">{msg.message}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No contact messages</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViolationMonitor; 