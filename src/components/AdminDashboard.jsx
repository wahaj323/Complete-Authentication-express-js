// components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessage(response.data.message);
      } catch (error) {
        setError('Failed to fetch admin data: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Admin Dashboard</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <div className="mt-4">
          <h3>Admin Information</h3>
          <p><strong>User ID:</strong> {user?.userId}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
        <div className="mt-4">
          <h3>Admin Functions</h3>
          <p>This is a protected admin area. You can add admin-specific functionality here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;