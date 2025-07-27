import React, { useState, useEffect } from "react";
import ViolationMonitorComponent from "../Components/ViolationMonitor";

const ViolationMonitor = () => {
  const [violations, setViolations] = useState([]);
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  useEffect(() => {
    fetchViolations();
    fetchSuspendedUsers();
    fetchContactMessages();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/violations`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setViolations(data.violations);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const fetchSuspendedUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/all-users`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        const suspended = data.users.filter(user => user.isSuspended);
        setSuspendedUsers(suspended);
      }
    } catch (error) {
      console.error('Error fetching suspended users:', error);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/contact-messages`, {
        headers: {
          'x-auth-token': sessionStorage.getItem('token')
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContactMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-6">
      <h1 className="text-4xl font-extrabold text-white mb-10 text-center drop-shadow-lg">
        Violation Monitor
      </h1>
      
      <ViolationMonitorComponent
        violations={violations}
        suspendedUsers={suspendedUsers}
        contactMessages={contactMessages}
        onUnsuspendUser={async (userId) => {
          try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/unsuspend-user/${userId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': sessionStorage.getItem('token')
              },
              body: JSON.stringify({ isSuspended: false })
            });
            if (response.ok) {
              fetchViolations();
              fetchSuspendedUsers();
            }
          } catch (error) {
            console.error('Error unsuspending user:', error);
          }
        }}
      />
    </div>
  );
};

export default ViolationMonitor; 