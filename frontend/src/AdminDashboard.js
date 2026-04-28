import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import RouteGuard from './RouteGuard';
import api from './api';

const AdminDashboard = ({ onLogout }) => {
  const [adminSection, setAdminSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [animalReports, setAnimalReports] = useState([]);

  // Backend API data fetching functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/requests');
      setRequests(response.data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimalReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/animals');
      setAnimalReports(response.data || []);
    } catch (err) {
      console.error('Failed to fetch animal reports:', err);
      setError('Failed to load animal reports');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchAnimalReports();
  }, []);

  // Backend API functions for admin operations
  const updateUserStatus = async (userId, status, reason = null) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/users/${userId}`, { status, reason });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
      return response.data;
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/requests/${requestId}`, { status });
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));
      return response.data;
    } catch (err) {
      console.error('Failed to update request:', err);
      setError('Failed to update request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAnimalReportStatus = async (reportId, status) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/animals/${reportId}`, { status });
      setAnimalReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status } : report
      ));
      return response.data;
    } catch (err) {
      console.error('Failed to update animal report:', err);
      setError('Failed to update animal report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      switch(action) {
        case 'view':
          const user = users.find(u => u.id === userId);
          alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}\nJoin Date: ${user.joinDate}\nLast Active: ${user.lastActive}`);
          break;
        case 'suspend':
          await updateUserStatus(userId, 'suspended', 'Administrative suspension');
          alert(`User ${userId} has been suspended`);
          break;
        case 'activate':
          await updateUserStatus(userId, 'active');
          alert(`User ${userId} has been activated`);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user?')) {
            await api.delete(`/api/users/${userId}`);
            setUsers(prev => prev.filter(user => user.id !== userId));
            alert(`User ${userId} has been deleted`);
          }
          break;
        default:
          alert(`${action} action for user ${userId}`);
      }
    } catch (error) {
      alert(`Failed to ${action} user: ${error.message}`);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      switch(action) {
        case 'approve':
          await updateRequestStatus(requestId, 'approved');
          alert(`Request ${requestId} has been approved`);
          break;
        case 'reject':
          await updateRequestStatus(requestId, 'rejected');
          alert(`Request ${requestId} has been rejected`);
          break;
        case 'investigate':
          await updateRequestStatus(requestId, 'investigating');
          alert(`Request ${requestId} is now under investigation`);
          break;
        default:
          alert(`${action} action for request ${requestId}`);
      }
    } catch (error) {
      alert(`Failed to ${action} request: ${error.message}`);
    }
  };

  const handleAnimalAction = async (reportId, action) => {
    try {
      switch(action) {
        case 'assign':
          await updateAnimalReportStatus(reportId, 'in-progress');
          alert(`Animal report ${reportId} has been assigned to rescue team`);
          break;
        case 'resolve':
          await updateAnimalReportStatus(reportId, 'resolved');
          alert(`Animal report ${reportId} has been resolved`);
          break;
        case 'investigate':
          await updateAnimalReportStatus(reportId, 'investigating');
          alert(`Animal report ${reportId} is now under investigation`);
          break;
        default:
          alert(`${action} action for animal report ${reportId}`);
      }
    } catch (error) {
      alert(`Failed to ${action} animal report: ${error.message}`);
    }
  };

  const renderAdminContent = () => {
    switch(adminSection) {
      case 'users':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>👥 User Management</h2>
              <p>View and manage user accounts</p>
            </div>
            <div className="admin-content">
              <div className="user-actions">
                <button className="admin-btn-primary">Add New User</button>
                <button className="admin-btn-secondary">Export Users</button>
                <button className="admin-btn-secondary">Bulk Actions</button>
              </div>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className={user.suspicious ? 'suspicious' : ''}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                          {user.suspicious && <span className="suspicious-badge">⚠️ Suspicious</span>}
                        </td>
                        <td>{user.joinDate}</td>
                        <td>{user.lastActive}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleUserAction(user.id, 'view')}>View</button>
                            <button onClick={() => handleUserAction(user.id, 'edit')}>Edit</button>
                            {user.role === 'user' ? (
                              <button onClick={() => handleUserAction(user.id, 'promote')} className="admin-action">Promote</button>
                            ) : (
                              <button onClick={() => handleUserAction(user.id, 'demote')} className="danger">Demote</button>
                            )}
                            {user.status === 'active' ? (
                              <button onClick={() => handleUserAction(user.id, 'suspend')} className="warning">Suspend</button>
                            ) : (
                              <button onClick={() => handleUserAction(user.id, 'activate')} className="success">Activate</button>
                            )}
                            {user.suspicious && (
                              <button onClick={() => handleUserAction(user.id, 'block')} className="danger">Block</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'requests':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>📋 Request Verification</h2>
              <p>Approve/reject medical cases, donations, and adoption requests</p>
            </div>
            <div className="admin-content">
              <div className="request-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Medical</button>
                <button className="filter-btn">Donations</button>
                <button className="filter-btn">Adoptions</button>
                <button className="filter-btn">Animals</button>
              </div>
              <div className="requests-grid">
                {requests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3>{request.title}</h3>
                      <span className={`priority-badge ${request.priority}`}>
                        {request.priority} priority
                      </span>
                    </div>
                    <div className="request-meta">
                      <span className="request-type">{request.type}</span>
                      <span className="request-user">by {request.user}</span>
                      <span className="request-date">{request.date}</span>
                    </div>
                    <p className="request-description">{request.description}</p>
                    <div className="request-actions">
                      <button 
                        onClick={() => handleRequestAction(request.id, 'approve')}
                        className="btn-success"
                        disabled={request.status === 'approved'}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        className="btn-danger"
                        disabled={request.status === 'rejected'}
                      >
                        ✗ Reject
                      </button>
                      <button 
                        onClick={() => handleRequestAction(request.id, 'investigate')}
                        className="btn-secondary"
                      >
                        🔍 Investigate
                      </button>
                    </div>
                    <div className="request-status">
                      Status: <span className={`status-text ${request.status}`}>{request.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'animals':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>🐾 Animal & Welfare Monitoring</h2>
              <p>Track reports and assign actions for animal welfare</p>
            </div>
            <div className="admin-content">
              <div className="animal-stats">
                <div className="stat-card">
                  <span className="stat-number">{animalReports.length}</span>
                  <span className="stat-label">Total Reports</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{animalReports.filter(r => r.status === 'pending').length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{animalReports.filter(r => r.status === 'resolved').length}</span>
                  <span className="stat-label">Resolved</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{animalReports.filter(r => r.urgency === 'high').length}</span>
                  <span className="stat-label">High Priority</span>
                </div>
              </div>
              <div className="animal-reports">
                {animalReports.map(report => (
                  <div key={report.id} className="animal-report-card">
                    <div className="report-header">
                      <h3>{report.animal} Report</h3>
                      <span className={`urgency-badge ${report.urgency}`}>
                        {report.urgency} urgency
                      </span>
                    </div>
                    <div className="report-details">
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{report.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Report Date:</span>
                        <span className="detail-value">{report.reportDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Assigned To:</span>
                        <span className="detail-value">{report.assignedTo}</span>
                      </div>
                    </div>
                    <p className="report-description">{report.description}</p>
                    <div className="report-actions">
                      <button 
                        onClick={() => handleAnimalAction(report.id, 'assign')}
                        className="btn-primary"
                      >
                        Assign Team
                      </button>
                      <button 
                        onClick={() => handleAnimalAction(report.id, 'resolve')}
                        className="btn-success"
                        disabled={report.status === 'resolved'}
                      >
                        ✓ Mark Resolved
                      </button>
                      <button 
                        onClick={() => handleAnimalAction(report.id, 'escalate')}
                        className="btn-secondary"
                      >
                        ⬆ Escalate
                      </button>
                    </div>
                    <div className="report-status">
                      Status: <span className={`status-text ${report.status}`}>{report.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'fraud':
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>🔍 Fraud Prevention</h2>
              <p>Detect duplicate/fake requests and maintain transparency</p>
            </div>
            <div className="admin-content">
              <div className="fraud-stats">
                <div className="stat-card">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Suspicious Activities</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Duplicate Requests</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">8</span>
                  <span className="stat-label">Blocked Users</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Detection Accuracy</span>
                </div>
              </div>
              <div className="fraud-alerts">
                <h3>Recent Fraud Alerts</h3>
                <div className="alert-list">
                  <div className="alert-item high">
                    <div className="alert-header">
                      <span className="alert-title">Duplicate Donation Request</span>
                      <span className="alert-time">2 hours ago</span>
                    </div>
                    <p>Multiple donation requests from same IP address detected</p>
                    <button className="btn-danger">Block User</button>
                  </div>
                  <div className="alert-item medium">
                    <div className="alert-header">
                      <span className="alert-title">Suspicious Medical Claim</span>
                      <span className="alert-time">5 hours ago</span>
                    </div>
                    <p>Medical emergency claim lacks proper verification</p>
                    <button className="btn-secondary">Investigate</button>
                  </div>
                  <div className="alert-item low">
                    <div className="alert-header">
                      <span className="alert-title">Fake Animal Report</span>
                      <span className="alert-time">1 day ago</span>
                    </div>
                    <p>Animal report appears to be fabricated</p>
                    <button className="btn-secondary">Review</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="admin-section">
            <div className="section-header">
              <h2>📊 Dashboard & Reports</h2>
              <p>View activity statistics and monitor system usage</p>
            </div>
            <div className="admin-content">
              <div className="dashboard-overview">
                <div className="overview-cards">
                  <div className="overview-card">
                    <span className="card-number">1,234</span>
                    <span className="card-label">Total Users</span>
                    <span className="card-change">+12% this month</span>
                  </div>
                  <div className="overview-card">
                    <span className="card-number">456</span>
                    <span className="card-label">Active Requests</span>
                    <span className="card-change">+8% this week</span>
                  </div>
                  <div className="overview-card">
                    <span className="card-number">89</span>
                    <span className="card-label">Animal Reports</span>
                    <span className="card-change">+15% this month</span>
                  </div>
                  <div className="overview-card">
                    <span className="card-number">98.5%</span>
                    <span className="card-label">System Uptime</span>
                    <span className="card-change">Excellent</span>
                  </div>
                </div>
              </div>
              <div className="admin-charts">
                <div className="chart-container">
                  <h3>User Activity Over Time</h3>
                  <div className="chart-placeholder">📈 Chart visualization here</div>
                </div>
                <div className="chart-container">
                  <h3>Service Usage Distribution</h3>
                  <div className="chart-placeholder">📊 Chart visualization here</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <RouteGuard>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">
                <span className="logo">🛠</span> Admin Panel
              </h1>
              <p className="dashboard-subtitle">System Administration & Control</p>
            </div>
            <div className="header-right">
              <button className="logout-btn" onClick={onLogout}>
                Logout →
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="admin-panel">
            <div className="admin-sidebar">
              <div className="sidebar-header">
                <h3>🛠 Admin Panel</h3>
              </div>
              <nav className="admin-nav">
                <button 
                  className={`admin-nav-btn ${adminSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setAdminSection('dashboard')}
                >
                  📊 Dashboard & Reports
                </button>
                <button 
                  className={`admin-nav-btn ${adminSection === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminSection('users')}
                >
                  👥 User Management
                </button>
                <button 
                  className={`admin-nav-btn ${adminSection === 'requests' ? 'active' : ''}`}
                  onClick={() => setAdminSection('requests')}
                >
                  📋 Request Verification
                </button>
                <button 
                  className={`admin-nav-btn ${adminSection === 'animals' ? 'active' : ''}`}
                  onClick={() => setAdminSection('animals')}
                >
                  🐾 Animal & Welfare
                </button>
                <button 
                  className={`admin-nav-btn ${adminSection === 'fraud' ? 'active' : ''}`}
                  onClick={() => setAdminSection('fraud')}
                >
                  🔍 Fraud Prevention
                </button>
              </nav>
            </div>
            <div className="admin-main">
              {renderAdminContent()}
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
};

export default AdminDashboard;
