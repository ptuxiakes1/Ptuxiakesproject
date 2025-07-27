import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language context
const LanguageContext = createContext();

// Auth context
const AuthContext = createContext();

// System settings context
const SystemSettingsContext = createContext();

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
    notes: "Notes",
    createBid: "Create Bid",
    sendMessage: "Send Message",
    message: "Message",
    adminSettings: "Admin Settings",
    googleOAuth: "Google OAuth",
    emergentAuth: "Emergent Authentication",
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
    welcome: "Welcome",
    setPrice: "Set Price",
    adminPrices: "Admin Prices",
    pendingMessages: "Pending Messages",
    approve: "Approve",
    viewPrices: "View Prices",
    waitingApproval: "Waiting for admin approval",
    messageApproved: "Message approved",
    userManagement: "User Management",
    createUser: "Create User",
    editUser: "Edit User",
    updateUser: "Update User",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    systemSettings: "System Settings",
    siteTitle: "Site Title",
    siteDescription: "Site Description",
    headerColor: "Header Color",
    headerTextColor: "Header Text Color",
    metaKeywords: "Meta Keywords",
    metaDescription: "Meta Description",
    questions: "Questions",
    askQuestion: "Ask Question",
    questionTitle: "Question Title",
    questionText: "Question",
    category: "Category",
    answer: "Answer",
    answered: "Answered",
    search: "Search",
    filter: "Filter",
    allCategories: "All Categories",
    noResults: "No results found",
    searchRequests: "Search requests..."
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
    notes: "Σημειώσεις",
    createBid: "Δημιουργία Προσφοράς",
    sendMessage: "Αποστολή Μηνύματος",
    message: "Μήνυμα",
    adminSettings: "Ρυθμίσεις Διαχειριστή",
    googleOAuth: "Google OAuth",
    emergentAuth: "Emergent Authentication",
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
    welcome: "Καλώς ήρθατε",
    setPrice: "Ορισμός Τιμής",
    adminPrices: "Τιμές Διαχειριστή",
    pendingMessages: "Μηνύματα σε Αναμονή",
    approve: "Έγκριση",
    viewPrices: "Προβολή Τιμών",
    waitingApproval: "Αναμονή έγκρισης διαχειριστή",
    messageApproved: "Μήνυμα εγκρίθηκε",
    userManagement: "Διαχείριση Χρηστών",
    createUser: "Δημιουργία Χρήστη",
    editUser: "Επεξεργασία Χρήστη",
    updateUser: "Ενημέρωση Χρήστη",
    forgotPassword: "Ξεχάσατε τον κωδικό;",
    resetPassword: "Επαναφορά Κωδικού",
    systemSettings: "Ρυθμίσεις Συστήματος",
    siteTitle: "Τίτλος Ιστότοπου",
    siteDescription: "Περιγραφή Ιστότοπου",
    headerColor: "Χρώμα Κεφαλίδας",
    headerTextColor: "Χρώμα Κειμένου Κεφαλίδας",
    metaKeywords: "Λέξεις-Κλειδιά Meta",
    metaDescription: "Περιγραφή Meta",
    questions: "Ερωτήσεις",
    askQuestion: "Κάντε Ερώτηση",
    questionTitle: "Τίτλος Ερώτησης",
    questionText: "Ερώτηση",
    category: "Κατηγορία",
    answer: "Απάντηση",
    answered: "Απαντήθηκε",
    search: "Αναζήτηση",
    filter: "Φίλτρο",
    allCategories: "Όλες οι Κατηγορίες",
    noResults: "Δεν βρέθηκαν αποτελέσματα",
    searchRequests: "Αναζήτηση αιτημάτων..."
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

// Question categories
const questionCategories = [
  "general",
  "technical",
  "billing",
  "account",
  "support"
];

// System Settings Provider
const SystemSettingsProvider = ({ children }) => {
  const [systemSettings, setSystemSettings] = useState({
    site_title: "Essay Bid Submission System",
    site_description: "Professional essay writing and bidding platform",
    header_color: "#1e3a8a",
    header_text_color: "#ffffff",
    meta_keywords: "essay, writing, academic, bidding, students, supervisors",
    meta_description: "Professional essay writing and bidding platform connecting students with qualified supervisors"
  });

  const fetchSystemSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/system-settings`);
      setSystemSettings(response.data);
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  return (
    <SystemSettingsContext.Provider value={{ systemSettings, setSystemSettings, fetchSystemSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: formData.email });
      alert('Password reset instructions sent to your email');
      setShowForgotPassword(false);
    } catch (error) {
      alert('Error sending reset email');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {t('resetPassword')}
            </h2>
          </div>
          <form className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl" onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                {t('resetPassword')}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                {t('back')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {t('appTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? t('login') : t('register')}
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder={t('name')}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            )}
            <input
              type="email"
              placeholder={t('email')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <input
              type="password"
              placeholder={t('password')}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            {!isLogin && (
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-500 transition-colors text-sm sm:text-base"
            >
              {isLogin ? 'Χρειάζεστε να εγγραφείτε;' : 'Έχετε ήδη λογαριασμό;'}
            </button>
            {isLogin && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-500 transition-colors text-sm"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}
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
  const { systemSettings } = useContext(SystemSettingsContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav 
      className="text-white p-4 shadow-lg"
      style={{ 
        backgroundColor: systemSettings.header_color,
        color: systemSettings.header_text_color 
      }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left leading-tight">
          {systemSettings.site_title}
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 bg-blue-700 text-white rounded-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            style={{ 
              backgroundColor: `${systemSettings.header_color}dd`,
              borderColor: `${systemSettings.header_color}aa`
            }}
          >
            <option value="gr">{t('greek')}</option>
            <option value="en">{t('english')}</option>
          </select>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-sm">{t('welcome')}, {user?.name}</span>
            {unreadCount > 0 && (
              <div className="relative">
                <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </div>
              </div>
            )}
          </div>
          {/* Mobile: Use logout icon instead of button */}
          <div className="sm:hidden">
            <button
              onClick={logout}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
              title={t('logout')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          {/* Desktop: Use logout button */}
          <div className="hidden sm:block">
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              {t('logout')}
            </button>
          </div>
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
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, assignedRes, notificationsRes, questionsRes] = await Promise.all([
        axios.get(`${API}/requests`),
        axios.get(`${API}/requests/assigned`),
        axios.get(`${API}/notifications`),
        axios.get(`${API}/questions`)
      ]);
      
      setRequests(requestsRes.data);
      setAssignedRequests(assignedRes.data);
      setNotifications(notificationsRes.data);
      setQuestions(questionsRes.data);

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
      case 'questions':
        return <QuestionsView questions={questions} onRefresh={fetchData} />;
      case 'settings':
        return user?.role === 'admin' ? <AdminSettings /> : <div>Access denied</div>;
      case 'systemSettings':
        return user?.role === 'admin' ? <SystemSettings /> : <div>Access denied</div>;
      case 'users':
        return user?.role === 'admin' ? <UserManagement /> : <div>Access denied</div>;
      case 'pendingMessages':
        return user?.role === 'admin' ? <PendingMessages /> : <div>Access denied</div>;
      default:
        return <DashboardHome requests={requests} assignedRequests={assignedRequests} bids={bids} notifications={notifications} questions={questions} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Navigation />
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 bg-white p-4 rounded-2xl shadow-lg mb-4 md:mb-0 md:mr-4">
            <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('dashboard')}
              </button>
              <button
                onClick={() => setCurrentView('requests')}
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'requests' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('essayRequests')}
              </button>
              <button
                onClick={() => setCurrentView('assigned')}
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'assigned' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('assignedEssays')}
              </button>
              {(user?.role === 'supervisor' || user?.role === 'admin') && (
                <button
                  onClick={() => setCurrentView('bids')}
                  className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'bids' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                >
                  {t('bids')}
                </button>
              )}
              <button
                onClick={() => setCurrentView('questions')}
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'questions' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
              >
                {t('questions')}
              </button>
              <button
                onClick={() => setCurrentView('notifications')}
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'notifications' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'} relative`}
              >
                {t('notifications')} 
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              {user?.role === 'admin' && (
                <>
                  <button
                    onClick={() => setCurrentView('pendingMessages')}
                    className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'pendingMessages' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                  >
                    {t('pendingMessages')}
                  </button>
                  <button
                    onClick={() => setCurrentView('settings')}
                    className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'settings' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                  >
                    {t('settings')}
                  </button>
                  <button
                    onClick={() => setCurrentView('systemSettings')}
                    className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'systemSettings' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
                  >
                    {t('systemSettings')}
                  </button>
                  <button
                    onClick={() => setCurrentView('users')}
                    className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-200 text-sm sm:text-base ${currentView === 'users' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-gray-700 hover:bg-blue-50'}`}
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
const DashboardHome = ({ requests, assignedRequests, bids, notifications, questions }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const stats = {
    totalRequests: requests.length,
    assignedRequests: assignedRequests.length,
    totalBids: bids.length,
    unreadNotifications: notifications.filter(n => !n.read).length,
    pendingQuestions: questions.filter(q => q.status === 'pending').length
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('dashboard')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">{t('essayRequests')}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalRequests}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-4 sm:p-6 rounded-xl shadow-sm border border-teal-200">
          <h3 className="font-semibold text-teal-800 mb-2 text-sm sm:text-base">{t('assignedEssays')}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-teal-600">{stats.assignedRequests}</p>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 sm:p-6 rounded-xl shadow-sm border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">{t('bids')}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalBids}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 sm:p-6 rounded-xl shadow-sm border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">{t('questions')}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.pendingQuestions}</p>
        </div>
        <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 sm:p-6 rounded-xl shadow-sm border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">{t('notifications')}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.unreadNotifications}</p>
        </div>
      </div>
    </div>
  );
};

// Essay Requests View Component with Search and Filter
const EssayRequestsView = ({ requests, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.field_of_study.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.assignment_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(request => request.field_of_study === selectedCategory);
    }

    setFilteredRequests(filtered);
  };

  const handleSearch = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await axios.get(`${API}/requests`, { params });
      onRefresh();
    } catch (error) {
      console.error('Error searching requests:', error);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('essayRequests')}</h2>
        {user?.role === 'student' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base"
          >
            {t('createRequest')}
          </button>
        )}
      </div>

      {/* Search and Filter Section */}
      {(user?.role === 'supervisor' || user?.role === 'admin') && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('searchRequests')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
            <div className="flex-1 sm:flex-none sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm sm:text-base"
            >
              {t('search')}
            </button>
          </div>
        </div>
      )}

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
        {(user?.role === 'supervisor' || user?.role === 'admin' ? filteredRequests : requests).length === 0 ? (
          <div className="text-center text-gray-500 py-8">{t('noResults')}</div>
        ) : (
          (user?.role === 'supervisor' || user?.role === 'admin' ? filteredRequests : requests).map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onRefresh={onRefresh}
              onViewDetails={() => setSelectedRequest(request)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Questions View Component
const QuestionsView = ({ questions, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [answerForm, setAnswerForm] = useState({ questionId: null, answer: '' });

  const handleAnswerQuestion = async (questionId, answer) => {
    try {
      await axios.put(`${API}/admin/questions/${questionId}/answer`, { answer });
      onRefresh();
      setAnswerForm({ questionId: null, answer: '' });
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('questions')}</h2>
        {(user?.role === 'student' || user?.role === 'supervisor') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base"
          >
            {t('askQuestion')}
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateQuestionForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            onRefresh();
          }}
        />
      )}

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">{question.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                question.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                question.status === 'answered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {t(question.status)}
              </span>
            </div>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">{question.question}</p>
            
            {question.answer && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">{t('answer')}:</h4>
                <p className="text-blue-700 text-sm sm:text-base">{question.answer}</p>
              </div>
            )}
            
            {user?.role === 'admin' && question.status === 'pending' && (
              <div className="border-t pt-4">
                {answerForm.questionId === question.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={answerForm.answer}
                      onChange={(e) => setAnswerForm({...answerForm, answer: e.target.value})}
                      placeholder={t('answer')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      rows="3"
                    />
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleAnswerQuestion(question.id, answerForm.answer)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                      >
                        {t('submit')}
                      </button>
                      <button
                        onClick={() => setAnswerForm({ questionId: null, answer: '' })}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAnswerForm({ questionId: question.id, answer: '' })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    {t('answer')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Create Question Form Component
const CreateQuestionForm = ({ onClose, onSuccess }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    category: 'general'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/questions`, formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Error creating question');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{t('askQuestion')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('questionTitle')}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            {questionCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <textarea
            placeholder={t('questionText')}
            value={formData.question}
            onChange={(e) => setFormData({...formData, question: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            rows="4"
            required
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// System Settings Component
const SystemSettings = () => {
  const { t } = useContext(LanguageContext);
  const { systemSettings, fetchSystemSettings } = useContext(SystemSettingsContext);
  const [settings, setSettings] = useState(systemSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSettings(systemSettings);
  }, [systemSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/admin/system-settings`, settings);
      await fetchSystemSettings();
      alert('System settings updated successfully');
    } catch (error) {
      console.error('Error updating system settings:', error);
      alert('Error updating system settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('systemSettings')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('siteTitle')}
            </label>
            <input
              type="text"
              value={settings.site_title}
              onChange={(e) => setSettings({...settings, site_title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('siteDescription')}
            </label>
            <input
              type="text"
              value={settings.site_description}
              onChange={(e) => setSettings({...settings, site_description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('headerColor')}
            </label>
            <input
              type="color"
              value={settings.header_color}
              onChange={(e) => setSettings({...settings, header_color: e.target.value})}
              className="w-full h-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('headerTextColor')}
            </label>
            <input
              type="color"
              value={settings.header_text_color}
              onChange={(e) => setSettings({...settings, header_text_color: e.target.value})}
              className="w-full h-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('metaKeywords')}
            </label>
            <input
              type="text"
              value={settings.meta_keywords}
              onChange={(e) => setSettings({...settings, meta_keywords: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('metaDescription')}
            </label>
            <textarea
              value={settings.meta_description}
              onChange={(e) => setSettings({...settings, meta_description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              rows="3"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base disabled:opacity-50"
          >
            {loading ? 'Saving...' : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

// Assigned Essays View Component
const AssignedEssaysView = ({ requests, onRefresh }) => {
  const { t } = useContext(LanguageContext);
  const [showChat, setShowChat] = useState(null);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('assignedEssays')}</h2>
      
      {showChat && (
        <ChatModal
          requestId={showChat.id}
          requestTitle={showChat.title}
          onClose={() => setShowChat(null)}
        />
      )}

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800">{request.title}</h3>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-800 border border-green-200">
                {t('accepted')}
              </span>
            </div>
            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              {assignmentTypes[request.assignment_type]} • {request.field_of_study} • {request.word_count} words
            </p>
            <p className="text-gray-500 mb-4 text-sm">Due: {new Date(request.due_date).toLocaleDateString()}</p>
            
            <button
              onClick={() => setShowChat(request)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm font-medium text-sm sm:text-base"
            >
              {t('chat')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Request Details Modal with Admin Pricing
const RequestDetailsModal = ({ request, onClose, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [bids, setBids] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [adminPrices, setAdminPrices] = useState([]);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [priceData, setPriceData] = useState({ price: '' });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBids();
      fetchSupervisors();
    }
    if (user?.role === 'student' || user?.role === 'admin') {
      fetchAdminPrices();
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

  const fetchAdminPrices = async () => {
    try {
      const response = await axios.get(`${API}/prices/request/${request.id}`);
      setAdminPrices(response.data);
    } catch (error) {
      console.error('Error fetching admin prices:', error);
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

  const handleSetPrice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/prices`, {
        request_id: request.id,
        price: parseFloat(priceData.price)
      });
      setShowPriceForm(false);
      setPriceData({ price: '' });
      fetchAdminPrices();
    } catch (error) {
      console.error('Error setting price:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-4xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">{request.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl">×</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-gray-700 text-sm sm:text-base">Request Details</h4>
            <div className="space-y-2 text-sm sm:text-base">
              <p><strong>Type:</strong> {assignmentTypes[request.assignment_type]}</p>
              <p><strong>Field:</strong> {request.field_of_study}</p>
              <p><strong>Word Count:</strong> {request.word_count}</p>
              <p><strong>Due Date:</strong> {new Date(request.due_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {t(request.status)}</p>
            </div>
            {request.extra_information && (
              <div className="mt-4">
                <strong className="text-sm sm:text-base">Extra Information:</strong>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{request.extra_information}</p>
              </div>
            )}
            
            {/* Student/Admin View: Admin Prices */}
            {(user?.role === 'student' || user?.role === 'admin') && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-gray-700 text-sm sm:text-base">{t('adminPrices')}</h4>
                {adminPrices.length > 0 ? (
                  <div className="space-y-2">
                    {adminPrices.map((price) => (
                      <div key={price.id} className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-800 text-sm sm:text-base">${price.price}</p>
                        <p className="text-xs text-gray-600">Set: {new Date(price.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No admin prices set</p>
                )}
              </div>
            )}
          </div>
          
          {user?.role === 'admin' && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-700 text-sm sm:text-base">Admin Actions</h4>
              
              {/* Set Price Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowPriceForm(!showPriceForm)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm sm:text-base"
                >
                  {t('setPrice')}
                </button>
                
                {showPriceForm && (
                  <form onSubmit={handleSetPrice} className="mt-2 space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter price"
                      value={priceData.price}
                      onChange={(e) => setPriceData({...priceData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Set
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPriceForm(false)}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Assign Supervisor */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('assignToSupervisor')}
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                  className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                >
                  {t('assign')}
                </button>
              </div>
              
              {/* Bids Management */}
              <h4 className="font-semibold mb-2 text-gray-700 text-sm sm:text-base">Bids ({bids.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bids.map((bid) => (
                  <div key={bid.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm sm:text-base">${bid.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(bid.status)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{bid.notes}</p>
                    {bid.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleBidAction(bid.id, 'accepted')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm"
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md max-h-96 overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{t('createRequest')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('title')}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <input
            type="datetime-local"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <input
            type="number"
            placeholder={t('wordCount')}
            value={formData.word_count}
            onChange={(e) => setFormData({...formData, word_count: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <select
            value={formData.assignment_type}
            onChange={(e) => setFormData({...formData, assignment_type: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            {Object.entries(assignmentTypes).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
          <select
            value={formData.field_of_study}
            onChange={(e) => setFormData({...formData, field_of_study: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          >
            <option value="">{t('fieldOfStudy')}</option>
            {fieldsOfStudy.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
          <textarea
            placeholder={t('extraInfo')}
            value={formData.extra_information}
            onChange={(e) => setFormData({...formData, extra_information: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            rows="3"
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
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
  const [adminPrices, setAdminPrices] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchAdminPrices();
    }
  }, []);

  const fetchAdminPrices = async () => {
    try {
      const response = await axios.get(`${API}/prices/request/${request.id}`);
      setAdminPrices(response.data);
    } catch (error) {
      console.error('Error fetching admin prices:', error);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800">{request.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm border ${statusColor[request.status]}`}>
          {t(request.status)}
        </span>
      </div>
      <p className="text-gray-600 mb-2 text-sm sm:text-base">
        {assignmentTypes[request.assignment_type]} • {request.field_of_study} • {request.word_count} words
      </p>
      <p className="text-gray-500 mb-4 text-sm">Due: {new Date(request.due_date).toLocaleDateString()}</p>
      
      {/* Show admin prices to students */}
      {user?.role === 'student' && adminPrices.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Admin Prices:</h4>
          <div className="space-y-2">
            {adminPrices.map((price) => (
              <div key={price.id} className="bg-blue-50 p-2 rounded-lg">
                <p className="font-medium text-blue-800 text-sm sm:text-base">${price.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={onViewDetails}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-sm font-medium text-sm sm:text-base"
        >
          {t('viewDetails')}
        </button>
        {user?.role === 'supervisor' && request.status === 'pending' && (
          <button
            onClick={() => setShowBidForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm font-medium text-sm sm:text-base"
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

// Create Bid Form Component (Updated - removed time requirement)
const CreateBidForm = ({ requestId, onClose, onSuccess }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    price: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        request_id: requestId,
        price: parseFloat(formData.price)
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
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{t('createBid')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.01"
            placeholder={t('price')}
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <textarea
            placeholder={t('notes')}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            rows="4"
            required
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Chat Modal Component with Admin Approval
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
      alert(t('waitingApproval'));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md h-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">{requestTitle}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl">×</button>
        </div>
        
        <div className="h-64 overflow-y-auto mb-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center text-sm sm:text-base">{t('noMessages')}</p>
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
                {message.approved && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    {t('messageApproved')}
                  </span>
                )}
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm sm:text-base"
          >
            {t('sendMessage')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Pending Messages Component (Admin)
const PendingMessages = () => {
  const { t } = useContext(LanguageContext);
  const [pendingMessages, setPendingMessages] = useState([]);

  useEffect(() => {
    fetchPendingMessages();
  }, []);

  const fetchPendingMessages = async () => {
    try {
      const response = await axios.get(`${API}/admin/messages/pending`);
      setPendingMessages(response.data);
    } catch (error) {
      console.error('Error fetching pending messages:', error);
    }
  };

  const approveMessage = async (messageId) => {
    try {
      await axios.put(`${API}/admin/messages/${messageId}/approve`);
      fetchPendingMessages();
    } catch (error) {
      console.error('Error approving message:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/admin/messages/${messageId}`);
      fetchPendingMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('pendingMessages')}</h2>
      <div className="space-y-4">
        {pendingMessages.map((message) => (
          <div key={message.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <p className="text-sm sm:text-base text-gray-800 mb-2">{message.message}</p>
            <p className="text-xs text-gray-500 mb-4">
              {new Date(message.timestamp).toLocaleString()}
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => approveMessage(message.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                {t('approve')}
              </button>
              <button
                onClick={() => deleteMessage(message.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bids View Component
const BidsView = ({ bids, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('bids')}</h2>
      <div className="space-y-4">
        {bids.map((bid) => (
          <div key={bid.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
              <div>
                <p className="font-semibold text-base sm:text-lg text-gray-800">{t('price')}: ${bid.price}</p>
                <p className="text-gray-600 text-sm sm:text-base">Created: {new Date(bid.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm border ${
                bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                bid.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {t(bid.status)}
              </span>
            </div>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">{bid.notes}</p>
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
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('notifications')}</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-xl p-4 ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start space-y-2 sm:space-y-0">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{notification.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium whitespace-nowrap"
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

  if (loading) return <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">Loading...</div>;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">{t('adminSettings')}</h2>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">Authentication Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <span className="text-gray-700 text-sm sm:text-base">{t('emergentAuth')}</span>
              <button
                onClick={() => updateSettings({ emergent_auth_enabled: !settings.emergent_auth_enabled })}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                  settings.emergent_auth_enabled 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {settings.emergent_auth_enabled ? t('enabled') : t('disabled')}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <span className="text-gray-700 text-sm sm:text-base">{t('googleOAuth')}</span>
              <button
                onClick={() => updateSettings({ google_oauth_enabled: !settings.google_oauth_enabled })}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
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

        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">Email Settings</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <span className="text-gray-700 text-sm sm:text-base">{t('emailNotifications')}</span>
            <button
              onClick={() => updateSettings({ email_notifications_enabled: !settings.email_notifications_enabled })}
              className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                settings.email_notifications_enabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {settings.email_notifications_enabled ? t('enabled') : t('disabled')}
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">System Settings</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <span className="text-gray-700 text-sm sm:text-base">{t('language')}</span>
            <select
              value={settings.system_language}
              onChange={(e) => updateSettings({ system_language: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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

// User Management Component with Full CRUD
const UserManagement = () => {
  const { t } = useContext(LanguageContext);
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  const updateUser = async (userId, userData) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, userData);
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t('userManagement')}</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base"
        >
          {t('createUser')}
        </button>
      </div>
      
      {showCreateForm && (
        <UserForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={createUser}
          title={t('createUser')}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(userData) => updateUser(editingUser.id, userData)}
          title={t('editUser')}
        />
      )}
      
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{user.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
              <p className="text-xs sm:text-sm text-gray-500">{t(user.role)}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingUser(user)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-xs sm:text-sm"
              >
                {t('edit')}
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-xs sm:text-sm"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// User Form Component (Create/Edit)
const UserForm = ({ user, onClose, onSubmit, title }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-md">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('name')}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <input
            type="email"
            placeholder={t('email')}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          />
          <input
            type="password"
            placeholder={user ? "Leave blank to keep current password" : t('password')}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required={!user}
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="student">{t('student')}</option>
            <option value="supervisor">{t('supervisor')}</option>
            <option value="admin">{t('admin')}</option>
          </select>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-sm sm:text-base"
            >
              {user ? t('updateUser') : t('createUser')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-sm sm:text-base"
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
      <SystemSettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SystemSettingsProvider>
    </LanguageProvider>
  );
}

export default AppWithProviders;