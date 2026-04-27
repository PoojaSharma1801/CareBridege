import React, { useState } from 'react';
import './Dashboard.css';
import RouteGuard from './RouteGuard';

const AdminDashboard = ({ onLogout }) => {
  const [adminSection, setAdminSection] = useState('dashboard');
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joinDate: '2024-01-15', lastActive: '2024-03-19', suspicious: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', joinDate: '2024-02-01', lastActive: '2024-03-18', suspicious: false },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'suspended', joinDate: '2024-01-20', lastActive: '2024-03-10', suspicious: true },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'admin', status: 'active', joinDate: '2024-02-15', lastActive: '2024-03-19', suspicious: false },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'user', status: 'pending', joinDate: '2024-03-10', lastActive: '2024-03-17', suspicious: false }
  ]);
  const [requests, setRequests] = useState([
    { id: 1, type: 'medical', title: 'Emergency Medical Assistance', user: 'John Doe', date: '2024-03-19', status: 'pending', priority: 'high', description: 'Need immediate medical help for elderly patient' },
    { id: 2, type: 'donation', title: 'Clothes Donation Request', user: 'Jane Smith', date: '2024-03-18', status: 'approved', priority: 'medium', description: 'Donating 50 winter clothes to shelter' },
    { id: 3, type: 'adoption', title: 'Elderly Care Application', user: 'Mike Johnson', date: '2024-03-17', status: 'pending', priority: 'high', description: 'Request to adopt elderly community member for care' },
    { id: 4, type: 'animal', title: 'Animal Rescue Report', user: 'Sarah Wilson', date: '2024-03-16', status: 'investigating', priority: 'medium', description: 'Stray dog needs medical attention' }
  ]);
  const [animalReports, setAnimalReports] = useState([
    { id: 1, animal: 'Dog', location: 'Downtown Park', reportDate: '2024-03-19', status: 'pending', urgency: 'high', description: 'Injured dog found near playground', assignedTo: 'Not assigned' },
    { id: 2, animal: 'Cat', location: 'Oak Street', reportDate: '2024-03-18', status: 'resolved', urgency: 'medium', description: 'Abandoned cat rescued and taken to shelter', assignedTo: 'Animal Control' },
    { id: 3, animal: 'Bird', location: 'River Bridge', reportDate: '2024-03-17', status: 'in-progress', urgency: 'low', description: 'Injured pigeon needs assistance', assignedTo: 'Wildlife Rescue' }
  ]);

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`);
    
    switch(action) {
      case 'view':
        alert(`Viewing user ${userId} details`);
        break;
      case 'edit':
        alert(`Editing user ${userId}`);
        break;
      case 'suspend':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'suspended' } : user
        ));
        alert(`User ${userId} has been suspended`);
        break;
      case 'block':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'blocked', suspicious: true } : user
        ));
        alert(`User ${userId} has been blocked`);
        break;
      case 'activate':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'active', suspicious: false } : user
        ));
        alert(`User ${userId} has been activated`);
        break;
      case 'promote':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: 'admin' } : user
        ));
        alert(`User ${userId} has been promoted to admin`);
        break;
      case 'demote':
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: 'user' } : user
        ));
        alert(`User ${userId} has been demoted to user`);
        break;
    }
  };

  const handleRequestAction = (requestId, action) => {
    console.log(`${action} request ${requestId}`);
    
    setRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        switch(action) {
          case 'approve':
            return { ...request, status: 'approved' };
          case 'reject':
            return { ...request, status: 'rejected' };
          case 'investigate':
            return { ...request, status: 'investigating' };
          default:
            return request;
        }
      }
      return request;
    }));
    
    alert(`Request ${requestId} has been ${action}d`);
  };

  const handleAnimalAction = (reportId, action) => {
    console.log(`${action} animal report ${reportId}`);
    
    setAnimalReports(prev => prev.map(report => {
      if (report.id === reportId) {
        switch(action) {
          case 'assign':
            return { ...report, assignedTo: 'Animal Rescue Team', status: 'in-progress' };
          case 'resolve':
            return { ...report, status: 'resolved' };
          case 'escalate':
            return { ...report, assignedTo: 'Emergency Services', status: 'escalated' };
          default:
            return report;
        }
      }
      return report;
    }));
    
    alert(`Animal report ${reportId} has been ${action}d`);
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
