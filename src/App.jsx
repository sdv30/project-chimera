import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Menu, X, Play, ChevronRight, Shield, Zap, Eye, Users, CheckCircle, ArrowRight, User, LogOut } from 'lucide-react';
import { Button } from './components/ui/button.jsx';
import { translations } from './translations.js';
import SettingsPage from './components/SettingsPage.jsx';
import AuthModal from './components/AuthModal.jsx';

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/confirm/:token" element={<EmailConfirmation />} />
      </Routes>
    </Router>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Email Confirmation Component
function EmailConfirmation() {
  const [status, setStatus] = useState('confirming');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/confirm/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    if (token) {
      confirmEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {status === 'confirming' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        )}
        {status === 'success' && (
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        )}
        {status === 'error' && (
          <X className="w-12 h-12 text-red-600 mx-auto mb-4" />
        )}
        
        <h2 className="text-xl font-semibold mb-2">
          {status === 'confirming' && 'Confirming your email...'}
          {status === 'success' && 'Email Confirmed!'}
          {status === 'error' && 'Confirmation Failed'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        
        {status !== 'confirming' && (
          <Button onClick={() => navigate('/')} className="w-full">
            Return to Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Home Page Component
function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const t = translations[language];

  useEffect(() => {
    // Check for saved theme and language preferences
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ru' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleStartJourney = () => {
    if (user) {
      navigate('/settings');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chimera
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t.nav.features}
                </a>
                <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t.nav.howItWorks}
                </a>
                <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t.nav.about}
                </a>
              </div>

              {/* Right side controls */}
              <div className="flex items-center space-x-4">
                {/* User menu or auth button */}
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{user.username}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {t.auth.login}
                  </Button>
                )}

                {/* Language Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  {language.toUpperCase()}
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-gray-600 dark:text-gray-400"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
              >
                <div className="px-4 py-2 space-y-1">
                  <a href="#features" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    {t.nav.features}
                  </a>
                  <a href="#how-it-works" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    {t.nav.howItWorks}
                  </a>
                  <a href="#about" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    {t.nav.about}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
              >
                {t.hero.title}{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t.hero.titleHighlight}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                {t.hero.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Button
                  size="lg"
                  onClick={handleStartJourney}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t.hero.startJourney}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <DemoModal t={t} />
              </motion.div>

              {/* Hero Features */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                <FeatureCard
                  icon={<Zap className="w-8 h-8 text-blue-600" />}
                  title={t.heroFeatures.preciseFiltering.title}
                  description={t.heroFeatures.preciseFiltering.description}
                />
                <FeatureCard
                  icon={<Eye className="w-8 h-8 text-purple-600" />}
                  title={t.heroFeatures.aiSummaries.title}
                  description={t.heroFeatures.aiSummaries.description}
                />
                <FeatureCard
                  icon={<Shield className="w-8 h-8 text-green-600" />}
                  title={t.heroFeatures.adFreeReading.title}
                  description={t.heroFeatures.adFreeReading.description}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.features.title}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Zap className="w-12 h-12 text-blue-600" />}
                title={t.features.lightningFast.title}
                description={t.features.lightningFast.description}
                large
              />
              <FeatureCard
                icon={<Eye className="w-12 h-12 text-purple-600" />}
                title={t.features.aiPowered.title}
                description={t.features.aiPowered.description}
                large
              />
              <FeatureCard
                icon={<Shield className="w-12 h-12 text-green-600" />}
                title={t.features.laserFocused.title}
                description={t.features.laserFocused.description}
                large
              />
              <FeatureCard
                icon={<Users className="w-12 h-12 text-orange-600" />}
                title={t.features.completeControl.title}
                description={t.features.completeControl.description}
                large
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.howItWorks.title}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number="01"
                title={t.howItWorks.quickSetup.title}
                description={t.howItWorks.quickSetup.description}
              />
              <StepCard
                number="02"
                title={t.howItWorks.aiProcessing.title}
                description={t.howItWorks.aiProcessing.description}
              />
              <StepCard
                number="03"
                title={t.howItWorks.personalizedFeed.title}
                description={t.howItWorks.personalizedFeed.description}
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8">{t.about.title}</h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-600 dark:text-gray-400">
                <p>{t.about.description1}</p>
                <p>{t.about.description2}</p>
              </div>
            </div>

            {/* Values */}
            <div className="grid md:grid-cols-4 gap-6 mb-16">
              <ValueBadge text={t.about.badges.privacyFirst} />
              <ValueBadge text={t.about.badges.noAds} />
              <ValueBadge text={t.about.badges.openSource} />
              <ValueBadge text={t.about.badges.userControlled} />
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <StatCard text={t.about.stats.activeSources} />
              <StatCard text={t.about.stats.articlesProcessed} />
              <StatCard text={t.about.stats.timeSaved} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2">
                <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Project Chimera
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  {t.footer.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t.footer.product}</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.features}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.pricing}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.api}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">{t.footer.company}</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.about}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.privacy}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.terms}</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>{t.footer.copyright}</p>
            </div>
          </div>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          translations={t}
        />
      </div>
    </div>
  );
}

// Component definitions
const FeatureCard = ({ icon, title, description, large = false }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${large ? 'text-center' : ''}`}
  >
    <div className={`mb-4 ${large ? 'flex justify-center' : ''}`}>
      {icon}
    </div>
    <h3 className={`font-semibold mb-2 ${large ? 'text-xl' : 'text-lg'}`}>{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </motion.div>
);

const StepCard = ({ number, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="text-center"
  >
    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </motion.div>
);

const ValueBadge = ({ text }) => (
  <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full text-center font-medium shadow-md">
    {text}
  </div>
);

const StatCard = ({ text }) => (
  <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
    <div className="text-2xl font-bold text-blue-600 mb-2">{text}</div>
  </div>
);

const DemoModal = ({ t }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(true)}
        className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 px-8 py-3 rounded-full font-semibold transition-all duration-300"
      >
        <Play className="mr-2 w-5 h-5" />
        {t.hero.watchDemo}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t.hero.watchDemo}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Demo video coming soon...</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;

