import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import RouteGuard from './RouteGuard';
import api from './api';

const Dashboard = ({ onLogout }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [activeSection, setActiveSection] = useState('services');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showClothesDonation, setShowClothesDonation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications');
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchAnimalReports();
    fetchNotifications();
  }, []);
  
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I\'m your CareBridge assistant. How can I help you today?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New medical emergency response needed', time: '2 min ago', read: false },
    { id: 2, text: 'Your clothes donation has been received', time: '1 hour ago', read: false },
    { id: 3, text: 'Education support session tomorrow', time: '3 hours ago', read: true }
  ]);
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
  
  // Clothes Donation Dashboard State
  const [clothesRequests, setClothesRequests] = useState([
    {
      id: 1,
      requesterName: 'Rahul Kumar',
      phone: '+91 98765 43210',
      address: '123 Main Street, Delhi - 110001',
      message: 'Need winter clothes for 3 children (ages 5, 8, 12)',
      clothingType: 'winter',
      urgency: 'high',
      status: 'pending',
      requestDate: '2024-03-19',
      preferredSize: ['5-6 years', '8-9 years', '12-13 years'],
      gender: 'unisex'
    },
    {
      id: 2,
      requesterName: 'Priya Sharma',
      phone: '+91 87654 32109',
      address: '456 Park Avenue, Mumbai - 400001',
      message: 'Looking for school uniforms for 2 kids',
      clothingType: 'school',
      urgency: 'medium',
      status: 'pending',
      requestDate: '2024-03-18',
      preferredSize: ['7-8 years', '10-11 years'],
      gender: 'girls'
    },
    {
      id: 3,
      requesterName: 'Amit Patel',
      phone: '+91 76543 21098',
      address: '789 Gandhi Road, Ahmedabad - 380001',
      message: 'Need clothes for elderly parents',
      clothingType: 'regular',
      urgency: 'medium',
      status: 'approved',
      requestDate: '2024-03-17',
      preferredSize: ['XL', 'XXL'],
      gender: 'male'
    }
  ]);
  
  const [donors, setDonors] = useState([
    {
      id: 1,
      donorName: 'John Smith',
      phone: '+91 99887 76543',
      address: '321 Commercial Street, Bangalore - 560001',
      message: 'Have 20+ winter clothes in good condition for children',
      clothingType: 'winter',
      availableSizes: ['2-3 years', '4-5 years', '6-7 years'],
      gender: 'unisex',
      condition: 'good',
      quantity: 25,
      availableUntil: '2024-04-30',
      status: 'available',
      donationDate: '2024-03-19'
    },
    {
      id: 2,
      donorName: 'Maria Garcia',
      phone: '+91 88776 54321',
      address: '654 MG Road, Pune - 411001',
      message: 'School uniforms and formal clothes available',
      clothingType: 'school',
      availableSizes: ['8-9 years', '10-11 years', '12-13 years'],
      gender: 'mixed',
      condition: 'excellent',
      quantity: 15,
      availableUntil: '2024-04-15',
      status: 'available',
      donationDate: '2024-03-18'
    },
    {
      id: 3,
      donorName: 'Robert Johnson',
      phone: '+91 77665 43210',
      address: '987 Nehru Place, New Delhi - 110019',
      message: 'Adult clothes for men and women, barely used',
      clothingType: 'formal',
      availableSizes: ['S', 'M', 'L', 'XL'],
      gender: 'mixed',
      condition: 'very good',
      quantity: 30,
      availableUntil: '2024-05-01',
      status: 'available',
      donationDate: '2024-03-17'
    }
  ]);
  
  const [newClothesRequest, setNewClothesRequest] = useState({
    requesterName: '',
    phone: '',
    address: '',
    message: '',
    clothingType: 'regular',
    urgency: 'medium',
    preferredSize: [],
    gender: 'unisex'
  });
  
  const [newDonor, setNewDonor] = useState({
    donorName: '',
    phone: '',
    address: '',
    message: '',
    clothingType: 'regular',
    availableSizes: [],
    gender: 'unisex',
    condition: 'good',
    quantity: 1,
    availableUntil: ''
  });
  
  const [activeClothesTab, setActiveClothesTab] = useState('requests');
  
  const [userActivities, setUserActivities] = useState([
    {
      id: 1,
      type: 'service',
      service: 'Medical Emergency Help',
      description: 'Provided emergency first aid assistance',
      date: '2024-03-19',
      time: '2:30 PM',
      status: 'completed',
      impact: 'Helped 3 people in emergency situation'
    },
    {
      id: 2,
      type: 'donation',
      service: 'Clothes Donation',
      description: 'Donated 15 winter clothes to local shelter',
      date: '2024-03-18',
      time: '10:15 AM',
      status: 'completed',
      impact: '15 families benefited'
    },
    {
      id: 3,
      type: 'volunteer',
      service: 'Education Support',
      description: 'Volunteered at weekend tutoring session',
      date: '2024-03-17',
      time: '3:00 PM',
      status: 'completed',
      impact: '8 students received tutoring'
    }
  ]);
  
  // Feedback state
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, user: 'John Doe', service: 'Medical Emergency', rating: 5, comment: 'Excellent service, very responsive!', date: '2024-03-19', helpful: 12 },
    { id: 2, user: 'Jane Smith', service: 'Clothes Donation', rating: 4, comment: 'Smooth process, good communication', date: '2024-03-18', helpful: 8 },
    { id: 3, user: 'Mike Johnson', service: 'Education Support', rating: 5, comment: 'Great tutoring program, very helpful', date: '2024-03-17', helpful: 15 }
  ]);
  
  const [newFeedback, setNewFeedback] = useState({
    service: '',
    rating: 0,
    comment: '',
    anonymous: false
  });
  
  // Enhanced user activity tracking
  const [userActivityLog, setUserActivityLog] = useState([
    { id: 1, action: 'Logged in', timestamp: '2024-03-19 09:00 AM', details: 'Dashboard access', type: 'system' },
    { id: 2, action: 'Viewed Medical Services', timestamp: '2024-03-19 09:15 AM', details: 'Browsed emergency services', type: 'navigation' },
    { id: 3, action: 'Submitted Donation Request', timestamp: '2024-03-19 10:30 AM', details: 'Clothes donation form completed', type: 'action' },
    { id: 4, action: 'Used Chat Support', timestamp: '2024-03-19 11:00 AM', details: 'Asked about volunteer opportunities', type: 'interaction' },
    { id: 5, action: 'Updated Profile', timestamp: '2024-03-19 02:00 PM', details: 'Changed phone number', type: 'system' }
  ]);
  
  // Track user activity
  const trackUserActivity = (action, details, type = 'action') => {
    const newActivity = {
      id: userActivityLog.length + 1,
      action,
      timestamp: new Date().toLocaleString(),
      details,
      type
    };
    setUserActivityLog(prev => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
  };

  const services = [
    {
      id: 1,
      title: 'Medical Emergency Help',
      icon: '🚑',
      description: 'Get immediate medical assistance and emergency healthcare services',
      color: '#e74c3c',
      bgColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      stats: '24/7 Available',
      features: ['Emergency Response', 'First Aid', 'Medical Consultation', 'Ambulance Service']
    },
    {
      id: 2,
      title: 'Adopt a Grandparent',
      icon: '👴👵',
      description: 'Connect with and support elderly individuals in your community',
      color: '#f39c12',
      bgColor: 'linear-gradient(135deg, #feca57, #ff9ff3)',
      stats: '500+ Seniors',
      features: ['Companionship', 'Daily Care', 'Medical Support', 'Social Activities']
    },
    {
      id: 3,
      title: 'Clothes Donation',
      icon: '👕',
      description: 'Donate clothes to those in need and help keep communities warm',
      color: '#27ae60',
      bgColor: 'linear-gradient(135deg, #00d2d3, #54a0ff)',
      stats: '10,000+ Donated',
      features: ['Winter Clothes', 'School Uniforms', 'Professional Attire', 'Distribution']
    },
    {
      id: 4,
      title: 'Education Support',
      icon: '📚',
      description: 'Provide educational resources and support to underprivileged students',
      color: '#3498db',
      bgColor: 'linear-gradient(135deg, #48dbfb, #0abde3)',
      stats: '1,000+ Students',
      features: ['Tutoring', 'School Supplies', 'Scholarships', 'Mentorship']
    },
    {
      id: 5,
      title: 'Animal Welfare',
      icon: '🐾',
      description: 'Support and protect animals in need through rescue and care programs',
      color: '#9b59b6',
      bgColor: 'linear-gradient(135deg, #f368e0, #ee5a6f)',
      stats: '2,000+ Animals',
      features: ['Rescue Services', 'Medical Care', 'Adoption', 'Shelter Support']
    }
  ];

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  const sendMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages([...chatMessages, 
        { sender: 'user', text: currentMessage },
        { sender: 'ai', text: 'Thank you for your message. Our team will assist you shortly.' }
      ]);
      setCurrentMessage('');
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Backend API functions for data operations
  const createServiceRequest = async (requestData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/requests', requestData);
      setRequests(prev => [response.data, ...prev]);
      trackUserActivity('Submitted Service Request', requestData.type, 'action');
      return response.data;
    } catch (err) {
      console.error('Failed to create request:', err);
      setError('Failed to submit request');
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

  const createAnimalReport = async (reportData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/animals', reportData);
      setAnimalReports(prev => [response.data, ...prev]);
      trackUserActivity('Submitted Animal Report', reportData.animal, 'action');
      return response.data;
    } catch (err) {
      console.error('Failed to create animal report:', err);
      setError('Failed to submit animal report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  // Clothes Donation Handlers (Updated to use backend API)
  const handleClothesRequestSubmit = async () => {
    if (newClothesRequest.requesterName && newClothesRequest.phone && newClothesRequest.address) {
      try {
        const requestData = {
          type: 'donation',
          title: 'Clothes Donation Request',
          requesterName: newClothesRequest.requesterName,
          phone: newClothesRequest.phone,
          address: newClothesRequest.address,
          message: newClothesRequest.message,
          clothingType: newClothesRequest.clothingType,
          urgency: newClothesRequest.urgency,
          preferredSize: newClothesRequest.preferredSize,
          gender: newClothesRequest.gender,
          status: 'pending',
          requestDate: new Date().toLocaleDateString()
        };
        
        await createServiceRequest(requestData);
        
        setNewClothesRequest({
          requesterName: '',
          phone: '',
          address: '',
          message: '',
          clothingType: 'regular',
          urgency: 'medium',
          preferredSize: [],
          gender: 'unisex'
        });
        
        alert('Your clothes request has been submitted successfully!');
      } catch (error) {
        alert('Failed to submit clothes request. Please try again.');
      }
    }
  };

  const handleDonorSubmit = () => {
    if (newDonor.donorName && newDonor.phone && newDonor.address) {
      const donor = {
        id: donors.length + 1,
        ...newDonor,
        status: 'available',
        donationDate: new Date().toLocaleDateString()
      };
      setDonors(prev => [donor, ...prev]);
      setNewDonor({
        donorName: '',
        phone: '',
        address: '',
        message: '',
        clothingType: 'regular',
        availableSizes: [],
        gender: 'unisex',
        condition: 'good',
        quantity: 1,
        availableUntil: ''
      });
      trackUserActivity('Submitted Clothes Donation', `Donated ${newDonor.quantity} items`, 'action');
      alert('Thank you for your donation! Your details have been shared.');
    }
  };

  const handleContactDonor = (donor) => {
    trackUserActivity('Contacted Donor', `Contacted ${donor.donorName}`, 'interaction');
    alert(`Contact Details:\n\nName: ${donor.donorName}\nPhone: ${donor.phone}\nAddress: ${donor.address}\n\nMessage: ${donor.message}`);
  };

  const handleContactRequester = (request) => {
    trackUserActivity('Contacted Requester', `Contacted ${request.requesterName}`, 'interaction');
    alert(`Requester Details:\n\nName: ${request.requesterName}\nPhone: ${request.phone}\nAddress: ${request.address}\n\nMessage: ${request.message}`);
  };

  const updateClothesRequestStatus = (requestId, newStatus) => {
    setClothesRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
    trackUserActivity('Updated Request Status', `Request ${requestId} marked as ${newStatus}`, 'action');
  };

  const updateDonorStatus = (donorId, newStatus) => {
    setDonors(prev => prev.map(donor => 
      donor.id === donorId ? { ...donor, status: newStatus } : donor
    ));
    trackUserActivity('Updated Donor Status', `Donor ${donorId} marked as ${newStatus}`, 'action');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeSection) {
      case 'services':
        return (
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service.id} 
                className="service-card"
                onClick={() => handleServiceClick(service)}
              >
                <div className="service-icon" style={{ background: service.bgColor }}>
                  <span className="icon-emoji">{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        );
      case 'profile':
        return (
          <div className="profile-section">
            <h2>My Profile</h2>
            <div className="profile-content">
              <div className="profile-avatar">
                <div className="avatar-circle">👤</div>
                <h4>John Doe</h4>
                <p>john.doe@example.com</p>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Services Used</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Donations</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">28</span>
                  <span className="stat-label">Hours Volunteered</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="activity-section">
            <h2>📊 My Activity</h2>
            <div className="activity-summary">
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="summary-number">{userActivities.length}</span>
                  <span className="summary-label">Total Activities</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-number">{userActivities.filter(a => a.type === 'service').length}</span>
                  <span className="summary-label">Services Used</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-number">{userActivities.filter(a => a.type === 'donation').length}</span>
                  <span className="summary-label">Donations</span>
                </div>
                <div className="summary-stat">
                  <span className="summary-number">{userActivities.filter(a => a.type === 'volunteer').length}</span>
                  <span className="summary-label">Volunteer Activities</span>
                </div>
              </div>
            </div>
            <div className="activity-timeline">
              {userActivities.map((activity) => (
                <div key={activity.id} className="timeline-item">
                  <div className="timeline-marker">
                    <span className="marker-icon">
                      {activity.type === 'service' ? '🏥' : activity.type === 'donation' ? '🎁' : '🤝'}
                    </span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{activity.service}</h4>
                      <span className="timeline-date">{activity.date} at {activity.time}</span>
                    </div>
                    <p className="timeline-description">{activity.description}</p>
                    <div className="timeline-impact">
                      <span className="impact-label">Impact:</span>
                      <span className="impact-text">{activity.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service.id} 
                className="service-card"
                onClick={() => handleServiceClick(service)}
              >
                <div className="service-icon" style={{ background: service.bgColor }}>
                  <span className="icon-emoji">{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
  <>
    <RouteGuard>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">
                <span className="logo">🏥</span> CareBridge
              </h1>
              <nav className="header-nav">
                <button 
                  className={`nav-btn ${activeSection === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveSection('services')}
                >
                  Services
                </button>
                <button 
                  className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  Profile
                </button>
                <button 
                  className={`nav-btn ${showActivity ? 'active' : ''}`}
                  onClick={() => {
                    setShowActivity(true);
                    trackUserActivity('Viewed Activity History', 'Opened activity modal', 'navigation');
                  }}
                >
                  📊 Activity
                </button>
                <button 
                  className={`nav-btn ${showFeedback ? 'active' : ''}`}
                  onClick={() => {
                    setShowFeedback(true);
                    trackUserActivity('Viewed Feedback', 'Opened feedback section', 'navigation');
                  }}
                >
                  💬 Feedback
                </button>
                <button 
                  className={`nav-btn ${showChat ? 'active' : ''}`}
                  onClick={() => {
                    setShowChat(true);
                    trackUserActivity('Opened Chat', 'Started chat session', 'interaction');
                  }}
                >
                  💭 Chat
                </button>
              </nav>
              </div>
            <div className="header-right">
              <button className="logout-btn" onClick={onLogout}>
                Logout →
              </button>
            </div>
          </div>
        </header>

      <main className="dashboard-main">
        {renderContent()}
        
        <div className="dashboard-stats">
          <div className="stats-overview">
            <h2>Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Lives Impacted</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Partner Organizations</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support Available</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">Community Rating</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Service Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: selectedService.bgColor }}>
              <div className="modal-icon">
                <span className="icon-emoji">{selectedService.icon}</span>
              </div>
              <h2>{selectedService.title}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedService.description}</p>
              <div className="modal-features">
                <h3>Services Include:</h3>
                <ul>
                  {selectedService.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowClothesDonation(true);
                    setActiveClothesTab('new-request');
                    closeModal();
                    trackUserActivity('Started Clothes Donation', 'Opened from service modal', 'action');
                  }}
                >
                  Get Started
                </button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h3>💬 AI Assistant</h3>
              <button className="modal-close" onClick={() => setShowChat(false)}>×</button>
            </div>
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notifications-header">
              <h3>🔔 Notifications</h3>
              <button className="modal-close" onClick={() => setShowNotifications(false)}>×</button>
            </div>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <p>{notification.text}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  {!notification.read && <div className="notification-dot"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <h3>👤 My Profile</h3>
              <button className="modal-close" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div className="profile-content">
              <div className="profile-avatar">
                <div className="avatar-circle">👤</div>
                <h4>John Doe</h4>
                <p>john.doe@example.com</p>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Services Used</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Donations</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-number">28</span>
                  <span className="stat-label">Hours Volunteered</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-primary">Edit Profile</button>
                <button className="btn-secondary">View History</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="modal-overlay" onClick={() => setShowRating(false)}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rating-header">
              <h3>⭐ Rate CareBridge</h3>
              <button className="modal-close" onClick={() => setShowRating(false)}>×</button>
            </div>
            <div className="rating-content">
              <p>How would you rate your experience with CareBridge?</p>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star ${star <= userRating ? 'active' : ''}`}
                    onClick={() => setUserRating(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your experience (optional)"
                className="rating-comment"
              />
              <div className="rating-actions">
                <button className="btn-primary">Submit Rating</button>
                <button className="btn-secondary" onClick={() => setShowRating(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div className="modal-overlay" onClick={() => setShowSupport(false)}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()}>
            <div className="support-header">
              <h3>📞 Support Center</h3>
              <button className="modal-close" onClick={() => setShowSupport(false)}>×</button>
            </div>
            <div className="support-content">
              <div className="support-options">
                <div className="support-option">
                  <h4>📞 Phone Support</h4>
                  <p>24/7 Helpline: 1-800-CAREBRIDGE</p>
                </div>
                <div className="support-option">
                  <h4>📧 Email Support</h4>
                  <p>support@carebridge.org</p>
                </div>
                <div className="support-option">
                  <h4>💬 Live Chat</h4>
                  <p>Available 9 AM - 9 PM</p>
                </div>
                <div className="support-option">
                  <h4>🏥 Emergency</h4>
                  <p>Dial 911 for immediate medical emergencies</p>
                </div>
              </div>
              <div className="support-actions">
                <button className="btn-primary">Start Live Chat</button>
                <button className="btn-secondary">Schedule Call</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-header">
              <h3>📝 Send Feedback</h3>
              <button className="modal-close" onClick={() => setShowFeedback(false)}>×</button>
            </div>
            <div className="feedback-content">
              <div className="feedback-form">
                <div className="form-group">
                  <label>Feedback Type</label>
                  <select className="form-control">
                    <option>Suggestion</option>
                    <option>Complaint</option>
                    <option>Compliment</option>
                    <option>Technical Issue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Your Message</label>
                  <textarea 
                    className="form-control"
                    placeholder="Tell us what you think..."
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input 
                    type="email" 
                    className="form-control"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="feedback-actions">
                  <button className="btn-primary">Send Feedback</button>
                  <button className="btn-secondary" onClick={() => setShowFeedback(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <div className="about-header">
              <h3>🏥 About CareBridge</h3>
              <button className="modal-close" onClick={() => setShowAbout(false)}>×</button>
            </div>
            <div className="about-content">
              <div className="about-section">
                <h4>Our Mission</h4>
                <p>CareBridge connects communities through compassionate healthcare and social support services. We believe everyone deserves access to quality care and support.</p>
              </div>
              <div className="about-section">
                <h4>Our Vision</h4>
                <p>To create a world where healthcare and social support are accessible to all, regardless of location or circumstance.</p>
              </div>
              <div className="about-section">
                <h4>Our Values</h4>
                <ul>
                  <li>Compassion in every interaction</li>
                  <li>Excellence in service delivery</li>
                  <li>Innovation in healthcare solutions</li>
                  <li>Community-driven approach</li>
                </ul>
              </div>
              <div className="about-stats">
                <div className="about-stat">
                  <span className="stat-number">50,000+</span>
                  <span className="stat-label">Lives Impacted</span>
                </div>
                <div className="about-stat">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Partner Organizations</span>
                </div>
                <div className="about-stat">
                  <span className="stat-number">15</span>
                  <span className="stat-label">Countries Served</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clothes Donation Modal */}
      {showClothesDonation && (
        <div className="modal-overlay" onClick={() => setShowClothesDonation(false)}>
          <div className="clothes-donation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="clothes-header">
              <h3>👕 Clothes Donation Hub</h3>
              <button className="modal-close" onClick={() => setShowClothesDonation(false)}>×</button>
            </div>
            <div className="clothes-tabs">
              <button 
                className={`tab-btn ${activeClothesTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveClothesTab('requests')}
              >
                📋 Requests ({clothesRequests.filter(r => r.status === 'pending').length})
              </button>
              <button 
                className={`tab-btn ${activeClothesTab === 'donors' ? 'active' : ''}`}
                onClick={() => setActiveClothesTab('donors')}
              >
                🎁 Donors ({donors.filter(d => d.status === 'available').length})
              </button>
              <button 
                className={`tab-btn ${activeClothesTab === 'new-request' ? 'active' : ''}`}
                onClick={() => setActiveClothesTab('new-request')}
              >
                ➕ Request Clothes
              </button>
              <button 
                className={`tab-btn ${activeClothesTab === 'new-donor' ? 'active' : ''}`}
                onClick={() => setActiveClothesTab('new-donor')}
              >
                📦 Donate Clothes
              </button>
            </div>
            <div className="clothes-content">
              {activeClothesTab === 'requests' && (
                <div className="requests-list">
                  <h4>📋 Clothes Requests</h4>
                  {clothesRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <h5>{request.requesterName}</h5>
                        <span className={`status-badge ${request.status}`}>
                          {request.status === 'pending' ? '⏳ Pending' : 
                           request.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </div>
                      <div className="request-details">
                        <p><strong>📞 Phone:</strong> {request.phone}</p>
                        <p><strong>📍 Address:</strong> {request.address}</p>
                        <p><strong>📝 Message:</strong> {request.message}</p>
                        <p><strong>👔 Type:</strong> {request.clothingType}</p>
                        <p><strong>📏 Sizes:</strong> {request.preferredSize.join(', ')}</p>
                        <p><strong>⚠️ Urgency:</strong> 
                          <span className={`urgency ${request.urgency}`}>
                            {request.urgency === 'high' ? '🔴 High' : 
                             request.urgency === 'medium' ? '🟡 Medium' : '🟢 Low'}
                          </span>
                        </p>
                        <p><strong>📅 Date:</strong> {request.requestDate}</p>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="btn-primary"
                          onClick={() => handleContactRequester(request)}
                        >
                          📞 Contact Requester
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeClothesTab === 'donors' && (
                <div className="donors-list">
                  <h4>🎁 Available Clothes Donors</h4>
                  {donors.map(donor => (
                    <div key={donor.id} className="donor-card">
                      <div className="donor-header">
                        <h5>{donor.donorName}</h5>
                        <span className={`status-badge ${donor.status}`}>
                          {donor.status === 'available' ? '✅ Available' : '❌ Not Available'}
                        </span>
                      </div>
                      <div className="donor-details">
                        <p><strong>📞 Phone:</strong> {donor.phone}</p>
                        <p><strong>📍 Address:</strong> {donor.address}</p>
                        <p><strong>📝 Message:</strong> {donor.message}</p>
                        <p><strong>👔 Type:</strong> {donor.clothingType}</p>
                        <p><strong>📏 Sizes:</strong> {donor.availableSizes.join(', ')}</p>
                        <p><strong>👥 Gender:</strong> {donor.gender}</p>
                        <p><strong>⭐ Condition:</strong> 
                          <span className={`condition ${donor.condition}`}>
                            {donor.condition === 'excellent' ? '⭐⭐⭐ Excellent' : 
                             donor.condition === 'very good' ? '⭐⭐ Very Good' : '⭐ Good'}
                          </span>
                        </p>
                        <p><strong>📦 Quantity:</strong> {donor.quantity} items</p>
                        <p><strong>📅 Available Until:</strong> {donor.availableUntil}</p>
                        <p><strong>📅 Donation Date:</strong> {donor.donationDate}</p>
                      </div>
                      <div className="donor-actions">
                        <button 
                          className="btn-primary"
                          onClick={() => handleContactDonor(donor)}
                        >
                          📞 Contact Donor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeClothesTab === 'new-request' && (
                <div className="new-request-form">
                  <h4>➕ Request Clothes</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        value={newClothesRequest.requesterName}
                        onChange={(e) => setNewClothesRequest(prev => ({ ...prev, requesterName: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={newClothesRequest.phone}
                        onChange={(e) => setNewClothesRequest(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label>Address *</label>
                      <textarea
                        value={newClothesRequest.address}
                        onChange={(e) => setNewClothesRequest(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your complete address"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        value={newClothesRequest.message}
                        onChange={(e) => setNewClothesRequest(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Describe what clothes you need and for whom"
                        rows="4"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Clothing Type</label>
                        <select
                          value={newClothesRequest.clothingType}
                          onChange={(e) => setNewClothesRequest(prev => ({ ...prev, clothingType: e.target.value }))}
                        >
                          <option value="regular">Regular Clothes</option>
                          <option value="winter">Winter Clothes</option>
                          <option value="school">School Uniform</option>
                          <option value="formal">Formal Wear</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Urgency</label>
                        <select
                          value={newClothesRequest.urgency}
                          onChange={(e) => setNewClothesRequest(prev => ({ ...prev, urgency: e.target.value }))}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          value={newClothesRequest.gender}
                          onChange={(e) => setNewClothesRequest(prev => ({ ...prev, gender: e.target.value }))}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Preferred Sizes</label>
                        <input
                          type="text"
                          value={newClothesRequest.preferredSize.join(', ')}
                          onChange={(e) => setNewClothesRequest(prev => ({ ...prev, preferredSize: e.target.value.split(', ') }))}
                          placeholder="e.g., 5-6 years, 8-9 years"
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn-primary" onClick={handleClothesRequestSubmit}>
                        Submit Request
                      </button>
                      <button className="btn-secondary" onClick={() => setNewClothesRequest({
                        requesterName: '',
                        phone: '',
                        address: '',
                        message: '',
                        clothingType: 'regular',
                        urgency: 'medium',
                        preferredSize: [],
                        gender: 'unisex'
                      })}>
                        Clear Form
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeClothesTab === 'new-donor' && (
                <div className="new-donor-form">
                  <h4>📦 Donate Clothes</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        value={newDonor.donorName}
                        onChange={(e) => setNewDonor(prev => ({ ...prev, donorName: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={newDonor.phone}
                        onChange={(e) => setNewDonor(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="form-group">
                      <label>Address *</label>
                      <textarea
                        value={newDonor.address}
                        onChange={(e) => setNewDonor(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your complete address"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        value={newDonor.message}
                        onChange={(e) => setNewDonor(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Describe what clothes you have available"
                        rows="4"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Clothing Type</label>
                        <select
                          value={newDonor.clothingType}
                          onChange={(e) => setNewDonor(prev => ({ ...prev, clothingType: e.target.value }))}
                        >
                          <option value="regular">Regular Clothes</option>
                          <option value="winter">Winter Clothes</option>
                          <option value="school">School Uniform</option>
                          <option value="formal">Formal Wear</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Condition</label>
                        <select
                          value={newDonor.condition}
                          onChange={(e) => setNewDonor(prev => ({ ...prev, condition: e.target.value }))}
                        >
                          <option value="good">Good</option>
                          <option value="very good">Very Good</option>
                          <option value="excellent">Excellent</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          value={newDonor.gender}
                          onChange={(e) => setNewDonor(prev => ({ ...prev, gender: e.target.value }))}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="mixed">Mixed</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={newDonor.quantity}
                          onChange={(e) => setNewDonor(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                          placeholder="Number of items"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Available Sizes</label>
                        <input
                          type="text"
                          value={newDonor.availableSizes.join(', ')}
                          onChange={(e) => setNewDonor(prev => ({ ...prev, availableSizes: e.target.value.split(', ') }))}
                          placeholder="e.g., S, M, L, XL or 5-6 years, 7-8 years"
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Until</label>
                        <input
                          type="date"
                          value={newDonor.availableUntil}
                          onChange={(e) => setNewDonor(prev => ({ ...prev, availableUntil: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="btn-primary" onClick={handleDonorSubmit}>
                        Submit Donation
                      </button>
                      <button className="btn-secondary" onClick={() => setNewDonor({
                        donorName: '',
                        phone: '',
                        address: '',
                        message: '',
                        clothingType: 'regular',
                        availableSizes: [],
                        gender: 'unisex',
                        condition: 'good',
                        quantity: 1,
                        availableUntil: ''
                      })}>
                        Clear Form
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivity && (
        <div className="modal-overlay" onClick={() => setShowActivity(false)}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="activity-header">
              <h3>📊 My Activity History</h3>
              <button className="modal-close" onClick={() => setShowActivity(false)}>×</button>
            </div>
            <div className="activity-content">
              <div className="activity-summary">
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="summary-number">{userActivities.length}</span>
                    <span className="summary-label">Total Activities</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-number">{userActivities.filter(a => a.type === 'service').length}</span>
                    <span className="summary-label">Services Used</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-number">{userActivities.filter(a => a.type === 'donation').length}</span>
                    <span className="summary-label">Donations</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-number">{userActivities.filter(a => a.type === 'volunteer').length}</span>
                    <span className="summary-label">Volunteer Hours</span>
                  </div>
                </div>
              </div>
              <div className="activity-filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">Services</button>
                <button className="filter-btn">Donations</button>
                <button className="filter-btn">Volunteering</button>
              </div>
              <div className="activity-timeline">
                {userActivities.map((activity, index) => (
                  <div key={activity.id} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="marker-icon">
                        {activity.type === 'service' ? '🏥' : activity.type === 'donation' ? '🎁' : '🤝'}
                      </span>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{activity.service}</h4>
                        <span className="timeline-date">{activity.date} at {activity.time}</span>
                      </div>
                      <p className="timeline-description">{activity.description}</p>
                      <div className="timeline-impact">
                        <span className="impact-label">Impact:</span>
                        <span className="impact-text">{activity.impact}</span>
                      </div>
                      <div className="timeline-status">
                        <span className={`status-badge ${activity.status}`}>
                          {activity.status === 'completed' ? '✓ Completed' : activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="activity-actions">
                <button className="btn-primary">Download History</button>
                <button className="btn-secondary">Share Impact</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </RouteGuard>
  </>
  );
};

// Component for Services Section
const ServicesSection = ({ services, onServiceClick }) => (
  <div className="services-grid">
    {services.map((service) => (
      <div
        key={service.id}
        className="service-card"
        onClick={() => onServiceClick(service)}
        style={{ background: service.bgColor }}
      >
        <div className="service-icon">
          <span className="icon-emoji">{service.icon}</span>
        </div>
        <div className="service-content">
          <h3 className="service-title">{service.title}</h3>
          <p className="service-description">{service.description}</p>
          <div className="service-stats">
            <span className="stats-number">{service.stats}</span>
          </div>
          <div className="service-action">
            <button className="service-btn">Learn More →</button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Component for About Section
const AboutSection = () => (
  <div className="about-full-page">
    <div className="about-hero">
      <h2>🏥 Welcome to CareBridge</h2>
      <p>Connecting Communities Through Compassionate Care</p>
    </div>
    <div className="about-grid">
      <div className="about-card">
        <h3>Our Mission</h3>
        <p>CareBridge connects communities through compassionate healthcare and social support services. We believe everyone deserves access to quality care and support.</p>
      </div>
      <div className="about-card">
        <h3>Our Vision</h3>
        <p>To create a world where healthcare and social support are accessible to all, regardless of location or circumstance.</p>
      </div>
      <div className="about-card">
        <h3>Our Values</h3>
        <ul>
          <li>Compassion in every interaction</li>
          <li>Excellence in service delivery</li>
          <li>Innovation in healthcare solutions</li>
          <li>Community-driven approach</li>
        </ul>
      </div>
      <div className="about-card">
        <h3>Our Impact</h3>
        <div className="impact-stats">
          <div className="impact-stat">
            <span>50,000+</span>
            <span>Lives Impacted</span>
          </div>
          <div className="impact-stat">
            <span>100+</span>
            <span>Partner Organizations</span>
          </div>
          <div className="impact-stat">
            <span>15</span>
            <span>Countries Served</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Component for Profile Section
const ProfileSection = () => (
  <div className="profile-full-page">
    <div className="profile-header-full">
      <div className="profile-avatar-large">
        <div className="avatar-circle-large">👤</div>
        <h2>John Doe</h2>
        <p>john.doe@example.com</p>
      </div>
    </div>
    <div className="profile-content-full">
      <div className="profile-section">
        <h3>Account Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Member Since</label>
            <span>January 2024</span>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="info-item">
            <label>Location</label>
            <span>New York, USA</span>
          </div>
        </div>
      </div>
      <div className="profile-section">
        <h3>Activity Summary</h3>
        <div className="activity-grid">
          <div className="activity-item">
            <span className="activity-number">12</span>
            <span className="activity-label">Services Used</span>
          </div>
          <div className="activity-item">
            <span className="activity-number">5</span>
            <span className="activity-label">Donations</span>
          </div>
          <div className="activity-item">
            <span className="activity-number">28</span>
            <span className="activity-label">Hours Volunteered</span>
          </div>
          <div className="activity-item">
            <span className="activity-number">4.8</span>
            <span className="activity-label">Average Rating</span>
          </div>
        </div>
      </div>
      <div className="profile-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-log">
            <span className="activity-time">2 days ago</span>
            <span className="activity-desc">Donated clothes to local shelter</span>
          </div>
          <div className="activity-log">
            <span className="activity-time">1 week ago</span>
            <span className="activity-desc">Volunteered at medical camp</span>
          </div>
          <div className="activity-log">
            <span className="activity-time">2 weeks ago</span>
            <span className="activity-desc">Joined education support program</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
