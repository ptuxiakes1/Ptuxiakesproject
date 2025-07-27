import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language context
const LanguageContext = createContext();

// Auth context
const AuthContext = createContext();

// Translation object
const translations = {
  en: {
    appTitle: "Essay Bid Submission System",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Name",
    role: "Role",
    student: "Student",
    supervisor: "Supervisor",
    admin: "Admin",
    dashboard: "Dashboard",
    essayRequests: "Essay Requests",
    assignedEssays: "Assigned Essays",
    bids: "Bids",
    chat: "Chat",
    notifications: "Notifications",
    settings: "Settings",
    logout: "Logout",
    createRequest: "Create New Request",
    title: "Title",
    dueDate: "Due Date",
    wordCount: "Word Count",
    assignmentType: "Assignment Type",
    fieldOfStudy: "Field of Study",
    extraInfo: "Extra Information",
    submit: "Submit",
    cancel: "Cancel",
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    price: "Price",
    proposal: "Proposal",
    estimatedCompletion: "Estimated Completion",
    createBid: "Create Bid",
    sendMessage: "Send Message",
    message: "Message",
    adminSettings: "Admin Settings",
    googleOAuth: "Google OAuth",
    emergentAuth: "Emergent Auth",
    emailNotifications: "Email Notifications",
    enabled: "Enabled",
    disabled: "Disabled",
    save: "Save",
    users: "Users",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    assign: "Assign",
    language: "Language",
    english: "English",
    greek: "Greek",
    viewDetails: "View Details",
    back: "Back",
    assignToSupervisor: "Assign to Supervisor",
    chatHistory: "Chat History",
    noMessages: "No messages yet",
    welcome: "Welcome"
  },
  gr: {
    appTitle: "Σύστημα Υποβολής Προσφορών για Δοκίμια",
    login: "Σύνδεση",
    register: "Εγγραφή",
    email: "Email",
    password: "Κωδικός",
    name: "Όνομα",
    role: "Ρόλος",
    student: "Φοιτητής",
    supervisor: "Επιβλέπων",
    admin: "Διαχειριστής",
    dashboard: "Πίνακας Ελέγχου",
    essayRequests: "Αιτήματα Δοκιμίων",
    assignedEssays: "Ανατεθέντα Δοκίμια",
    bids: "Προσφορές",
    chat: "Συνομιλία",
    notifications: "Ειδοποιήσεις",
    settings: "Ρυθμίσεις",
    logout: "Αποσύνδεση",
    createRequest: "Δημιουργία Νέου Αιτήματος",
    title: "Τίτλος",
    dueDate: "Ημερομηνία Παράδοσης",
    wordCount: "Αριθμός Λέξεων",
    assignmentType: "Τύπος Εργασίας",
    fieldOfStudy: "Πεδίο Μελέτης",
    extraInfo: "Επιπλέον Πληροφορίες",
    submit: "Υποβολή",
    cancel: "Ακύρωση",
    pending: "Σε Αναμονή",
    accepted: "Αποδεκτό",
    rejected: "Απορρίφθηκε",
    price: "Τιμή",
    proposal: "Πρόταση",
    estimatedCompletion: "Εκτιμώμενη Ολοκλήρωση",
    createBid: "Δημιουργία Προσφοράς",
    sendMessage: "Αποστολή Μηνύματος",
    message: "Μήνυμα",
    adminSettings: "Ρυθμίσεις Διαχειριστή",
    googleOAuth: "Google OAuth",
    emergentAuth: "Emergent Auth",
    emailNotifications: "Ειδοποιήσεις Email",
    enabled: "Ενεργοποιημένο",
    disabled: "Απενεργοποιημένο",
    save: "Αποθήκευση",
    users: "Χρήστες",
    delete: "Διαγραφή",
    edit: "Επεξεργασία",
    create: "Δημιουργία",
    assign: "Ανάθεση",
    language: "Γλώσσα",
    english: "Αγγλικά",
    greek: "Ελληνικά",
    viewDetails: "Προβολή Λεπτομερειών",
    back: "Πίσω",
    assignToSupervisor: "Ανάθεση σε Επιβλέποντα",
    chatHistory: "Ιστορικό Συνομιλίας",
    noMessages: "Δεν υπάρχουν μηνύματα ακόμα",
    welcome: "Καλώς ήρθατε"
  }
};

// Assignment types
const assignmentTypes = {
  essay: "Essay",
  dissertation_qualitative: "Dissertation (Qualitative)",
  dissertation_quantitative: "Dissertation (Quantitative)",
  statistical_analysis: "Statistical Analysis",
  paraphrase: "Paraphrase",
  ai_detection: "AI Detection",
  translation: "Translation"
};

// Fields of study
const fieldsOfStudy = [
  "Engineering",
  "Computer Science",
  "Business",
  "Literature",
  "Psychology",
  "Medicine",
  "Law",
  "Education",
  "Arts",
  "Sciences"
];

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-turquoise-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Language Provider
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('gr'); // Default to Greek

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Login/Register Component
const AuthForm = () => {
  const { login, register } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = isLogin 
      ? await login(formData.email, formData.password)
      : await register(formData);
    
    if (!success) {
      alert(isLogin ? 'Login failed' : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-turquoise-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('appTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? t('login') : t('register')}
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder={t('name')}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            )}
            <input
              type="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder={t('password')}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {!isLogin && (
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">{t('student')}</option>
                <option value="supervisor">{t('supervisor')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            )}
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {isLogin ? t('login') : t('register')}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isLogin ? 'Need to register?' : 'Already have an account?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext);

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">{t('appTitle')}</h1>
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 bg-blue-700 text-white rounded-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="gr">{t('greek')}</option>
            <option value="en">{t('english')}</option>
          </select>
          <span className="text-sm">{t('welcome')}, {user?.name}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [currentView, setCurrentView] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [bids, setBids] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, assignedRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/requests`),
        axios.get(`${API}/requests/assigned`),
        axios.get(`${API}/notifications`)
      ]);
      
      setRequests(requestsRes.data);
      setAssignedRequests(assignedRes.data);
      setNotifications(notificationsRes.data);

      // Fetch bids only for supervisors and admins
      if (user?.role === 'supervisor' || user?.role === 'admin') {
        const bidsRes = await axios.get(`${API}/bids`);
        setBids(bidsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'requests':
        return <EssayRequestsView requests={requests} onRefresh={fetchData} />;
      case 'assigned':
        return <AssignedEssaysView requests={assignedRequests} onRefresh={fetchData} />;
      case 'bids':
        return <BidsView bids={bids} onRefresh={fetchData} />;
      case 'notifications':
        return <NotificationsView notifications={notifications} onRefresh={fetchData} />;
      case 'settings':
        return user?.role === 'admin' ? <AdminSettings /> : <div>Access denied</div>;
      case 'users':
        return user?.role === 'admin' ? <UserManagement /> : <div>Access denied</div>;
      default:
        return <DashboardHome requests={requests} assignedRequests={assignedRequests} bids={bids} notifications={notifications} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-turquoise-50">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 bg-white p-4 rounded-2xl shadow-lg mb-4 md:mb-0 md:mr-4">
            <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('dashboard')}
              </button>
              <button
                onClick={() => setCurrentView('requests')}
                className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'requests' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('essayRequests')}
              </button>
              <button
                onClick={() => setCurrentView('assigned')}
                className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'assigned' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('assignedEssays')}
              </button>
              {(user?.role === 'supervisor' || user?.role === 'admin') && (
                <button
                  onClick={() => setCurrentView('bids')}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'bids' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                >
                  {t('bids')}
                </button>
              )}
              <button
                onClick={() => setCurrentView('notifications')}
                className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'notifications' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('notifications')} {notifications.filter(n => !n.read).length > 0 && <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2">{notifications.filter(n => !n.read).length}</span>}
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => setCurrentView('settings')}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'settings' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                  >
                    {t('settings')}
                  </button>
                  <button
                    onClick={() => setCurrentView('users')}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${currentView === 'users' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                  >
                    {t('users')}
                  </button>
                </>
              )}
            </nav>
          </div>
          <div className="w-full md:w-3/4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ requests, assignedRequests, bids, notifications }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const stats = {
    totalRequests: requests.length,
    assignedRequests: assignedRequests.length,
    totalBids: bids.length,
    unreadNotifications: notifications.filter(n => !n.read).length
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('dashboard')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl shadow-sm border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">{t('essayRequests')}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalRequests}</p>
        </div>
        <div className="bg-gradient-to-br from-turquoise-100 to-turquoise-200 p-6 rounded-xl shadow-sm border border-turquoise-200">
          <h3 className="font-semibold text-turquoise-800 mb-2">{t('assignedEssays')}</h3>
          <p className="text-3xl font-bold text-turquoise-600">{stats.assignedRequests}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-sm border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">{t('bids')}</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalBids}</p>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-xl shadow-sm border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">{t('notifications')}</h3>
          <p className="text-3xl font-bold text-red-600">{stats.unreadNotifications}</p>
        </div>
      </div>
    </div>
  );
};

// Essay Requests View Component
const EssayRequestsView = ({ requests, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('essayRequests')}</h2>
        {user?.role === 'student' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium"
          >
            {t('createRequest')}
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateRequestForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            onRefresh();
          }}
        />
      )}

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={onRefresh}
        />
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <RequestCard 
            key={request.id} 
            request={request} 
            onRefresh={onRefresh}
            onViewDetails={() => setSelectedRequest(request)}
          />
        ))}
      </div>
    </div>
  );
};

// Assigned Essays View Component
const AssignedEssaysView = ({ requests, onRefresh }) => {
  const { t } = useContext(LanguageContext);
  const [showChat, setShowChat] = useState(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('assignedEssays')}</h2>
      
      {showChat && (
        <ChatModal
          requestId={showChat.id}
          requestTitle={showChat.title}
          onClose={() => setShowChat(null)}
        />
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-gray-800">{request.title}</h3>
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                {t('accepted')}
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              {assignmentTypes[request.assignment_type]} • {request.field_of_study} • {request.word_count} words
            </p>
            <p className="text-gray-500 mb-4">Due: {new Date(request.due_date).toLocaleDateString()}</p>
            
            <button
              onClick={() => setShowChat(request)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm font-medium"
            >
              {t('chat')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Request Details Modal
const RequestDetailsModal = ({ request, onClose, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [bids, setBids] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBids();
      fetchSupervisors();
    }
  }, []);

  const fetchBids = async () => {
    try {
      const response = await axios.get(`${API}/bids/request/${request.id}`);
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await axios.get(`${API}/admin/supervisors`);
      setSupervisors(response.data);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleBidAction = async (bidId, action) => {
    try {
      await axios.put(`${API}/bids/${bidId}/status`, null, {
        params: { status_value: action }
      });
      fetchBids();
      onRefresh();
    } catch (error) {
      console.error('Error updating bid:', error);
    }
  };

  const handleAssignSupervisor = async () => {
    if (!selectedSupervisor) return;
    
    try {
      await axios.put(`${API}/requests/${request.id}/assign`, null, {
        params: { supervisor_id: selectedSupervisor }
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error assigning supervisor:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-4xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{request.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-gray-700">Request Details</h4>
            <p><strong>Type:</strong> {assignmentTypes[request.assignment_type]}</p>
            <p><strong>Field:</strong> {request.field_of_study}</p>
            <p><strong>Word Count:</strong> {request.word_count}</p>
            <p><strong>Due Date:</strong> {new Date(request.due_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {t(request.status)}</p>
            {request.extra_information && (
              <div className="mt-4">
                <strong>Extra Information:</strong>
                <p className="text-gray-600 mt-1">{request.extra_information}</p>
              </div>
            )}
          </div>
          
          {user?.role === 'admin' && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Admin Actions</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('assignToSupervisor')}
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select supervisor</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignSupervisor}
                  disabled={!selectedSupervisor}
                  className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
                >
                  {t('assign')}
                </button>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-700">Bids ({bids.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bids.map((bid) => (
                  <div key={bid.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">${bid.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(bid.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{bid.proposal}</p>
                    {bid.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleBidAction(bid.id, 'accepted')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Request Form Component
const CreateRequestForm = ({ onClose, onSuccess }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    title: '',
    due_date: '',
    word_count: '',
    assignment_type: 'essay',
    field_of_study: '',
    attachments: [],
    extra_information: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        due_date: new Date(formData.due_date).toISOString(),
        word_count: parseInt(formData.word_count)
      };

      await axios.post(`${API}/requests`, submitData);
      onSuccess();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error creating request');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, response.data.data]
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{t('createRequest')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('title')}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="datetime-local"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder={t('wordCount')}
            value={formData.word_count}
            onChange={(e) => setFormData({...formData, word_count: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={formData.assignment_type}
            onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(assignmentTypes).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          <select
            value={formData.field_of_study}
            onChange={(e) => setFormData({...formData, field_of_study: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">{t('fieldOfStudy')}</option>
            {fieldsOfStudy.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder={t('extraInfo')}
            value={formData.extra_information}
            onChange={(e) => setFormData({...formData, extra_information: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, onRefresh, onViewDetails }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [showBidForm, setShowBidForm] = useState(false);

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-800">{request.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm border ${statusColor[request.status]}`}>
          {t(request.status)}
        </span>
      </div>
      <p className="text-gray-600 mb-2">
        {assignmentTypes[request.assignment_type]} • {request.field_of_study} • {request.word_count} words
      </p>
      <p className="text-gray-500 mb-4">Due: {new Date(request.due_date).toLocaleDateString()}</p>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={onViewDetails}
          className="px-4 py-2 bg-gradient-to-r from-turquoise-600 to-turquoise-700 text-white rounded-lg hover:from-turquoise-700 hover:to-turquoise-800 transition-all duration-200 shadow-sm font-medium"
        >
          {t('viewDetails')}
        </button>
        {user?.role === 'supervisor' && request.status === 'pending' && (
          <button
            onClick={() => setShowBidForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium"
          >
            {t('createBid')}
          </button>
        )}
      </div>

      {showBidForm && (
        <CreateBidForm
          requestId={request.id}
          onClose={() => setShowBidForm(false)}
          onSuccess={() => {
            setShowBidForm(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

// Create Bid Form Component
const CreateBidForm = ({ requestId, onClose, onSuccess }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    price: '',
    estimated_completion: '',
    proposal: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        request_id: requestId,
        price: parseFloat(formData.price),
        estimated_completion: new Date(formData.estimated_completion).toISOString()
      };

      await axios.post(`${API}/bids`, submitData);
      onSuccess();
    } catch (error) {
      console.error('Error creating bid:', error);
      alert('Error creating bid');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{t('createBid')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.01"
            placeholder={t('price')}
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="datetime-local"
            value={formData.estimated_completion}
            onChange={(e) => setFormData({...formData, estimated_completion: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder={t('proposal')}
            value={formData.proposal}
            onChange={(e) => setFormData({...formData, proposal: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Chat Modal Component
const ChatModal = ({ requestId, requestTitle, onClose }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [requestId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/chat/${requestId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API}/chat/send`, {
        request_id: requestId,
        receiver_id: 'placeholder',
        message: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md h-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{requestTitle}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <div className="h-64 overflow-y-auto mb-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">{t('noMessages')}</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`mb-3 p-3 rounded-xl ${
                message.sender_id === user.id 
                  ? 'bg-blue-600 text-white ml-4' 
                  : 'bg-white border border-gray-200 mr-4'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={sendMessage} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('message')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            {t('sendMessage')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Bids View Component
const BidsView = ({ bids, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('bids')}</h2>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div key={bid.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-lg text-gray-800">{t('price')}: ${bid.price}</p>
                <p className="text-gray-600">{t('estimatedCompletion')}: {new Date(bid.estimated_completion).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm border ${
                bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                bid.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {t(bid.status)}
              </span>
            </div>
            <p className="text-gray-700 mb-4">{bid.proposal}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Notifications View Component
const NotificationsView = ({ notifications, onRefresh }) => {
  const { t } = useContext(LanguageContext);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`);
      onRefresh();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('notifications')}</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-xl p-4 ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Settings Component
const AdminSettings = () => {
  const { t } = useContext(LanguageContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    try {
      await axios.put(`${API}/admin/settings`, updates);
      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) return <div className="bg-white p-6 rounded-2xl shadow-lg">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('adminSettings')}</h2>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Authentication Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('emergentAuth')}</span>
              <button
                onClick={() => updateSettings({ emergent_auth_enabled: !settings.emergent_auth_enabled })}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  settings.emergent_auth_enabled 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {settings.emergent_auth_enabled ? t('enabled') : t('disabled')}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{t('googleOAuth')}</span>
              <button
                onClick={() => updateSettings({ google_oauth_enabled: !settings.google_oauth_enabled })}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  settings.google_oauth_enabled 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {settings.google_oauth_enabled ? t('enabled') : t('disabled')}
              </button>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Email Settings</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t('emailNotifications')}</span>
            <button
              onClick={() => updateSettings({ email_notifications_enabled: !settings.email_notifications_enabled })}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                settings.email_notifications_enabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {settings.email_notifications_enabled ? t('enabled') : t('disabled')}
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">System Settings</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{t('language')}</span>
            <select
              value={settings.system_language}
              onChange={(e) => updateSettings({ system_language: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gr">{t('greek')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const { t } = useContext(LanguageContext);
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API}/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const createUser = async (userData) => {
    try {
      await axios.post(`${API}/admin/users`, userData);
      fetchUsers();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('users')}</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg font-medium"
        >
          {t('create')} {t('users')}
        </button>
      </div>
      
      {showCreateForm && (
        <CreateUserForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={createUser}
        />
      )}
      
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">{t(user.role)}</p>
            </div>
            <button
              onClick={() => deleteUser(user.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
            >
              {t('delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create User Form Component
const CreateUserForm = ({ onClose, onSuccess }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSuccess(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{t('create')} {t('users')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('name')}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder={t('email')}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder={t('password')}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="student">{t('student')}</option>
            <option value="supervisor">{t('supervisor')}</option>
            <option value="admin">{t('admin')}</option>
          </select>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
            >
              {t('create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="App">
      {user ? <Dashboard /> : <AuthForm />}
    </div>
  );
}

// App with providers
function AppWithProviders() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default AppWithProviders;