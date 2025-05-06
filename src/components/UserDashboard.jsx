import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessage(response.data.message);
      } catch (error) {
        setError('Failed to fetch user data: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">User Dashboard</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <div className="mt-4">
          <h3>User Information</h3>
          <p><strong>User ID:</strong> {user?.userId}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        <div className="mt-4">
          <h3>User Content</h3>
          <p>This is your personalized dashboard. All authenticated users can see this content.</p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
