import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';

const AuthModal = ({ isOpen, onClose, onSuccess, translations }) => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'confirm'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
    setShowPassword(false);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    if (mode === 'register') {
      if (!formData.username || formData.username.length < 3) {
        setMessage({ type: 'error', text: translations.auth.errors.usernameRequired });
        return false;
      }
      if (!formData.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
        setMessage({ type: 'error', text: translations.auth.errors.emailInvalid });
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setMessage({ type: 'error', text: translations.auth.errors.passwordWeak });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: translations.auth.errors.passwordMismatch });
        return false;
      }
    } else if (mode === 'login') {
      if (!formData.email || !formData.password) {
        setMessage({ type: 'error', text: translations.auth.errors.fieldsRequired });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register' 
        ? {
            username: formData.username,
            email: formData.email,
            password: formData.password
          }
        : {
            email: formData.email,
            password: formData.password
          };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'register') {
          setMessage({ 
            type: 'success', 
            text: translations.auth.messages.registrationSuccess 
          });
          // Switch to confirmation mode
          setTimeout(() => {
            setMode('confirm');
            resetForm();
          }, 2000);
        } else {
          // Login successful
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setMessage({ 
            type: 'success', 
            text: translations.auth.messages.loginSuccess 
          });
          setTimeout(() => {
            onSuccess(data.user, data.token);
            onClose();
          }, 1000);
        }
      } else {
        setMessage({ type: 'error', text: data.error || translations.auth.errors.general });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ type: 'error', text: translations.auth.errors.network });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: translations.auth.errors.emailRequired });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: translations.auth.messages.confirmationSent });
      } else {
        setMessage({ type: 'error', text: data.error || translations.auth.errors.general });
      }
    } catch (error) {
      setMessage({ type: 'error', text: translations.auth.errors.network });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'login' && translations.auth.login}
              {mode === 'register' && translations.auth.register}
              {mode === 'confirm' && translations.auth.confirmEmail}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {mode === 'confirm' ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {translations.auth.checkEmail}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {translations.auth.confirmationInstructions}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Input
                    type="email"
                    name="email"
                    placeholder={translations.auth.emailPlaceholder}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <Button
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? translations.auth.sending : translations.auth.resendConfirmation}
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={() => handleModeChange('login')}
                    className="text-sm text-blue-600 dark:text-blue-400"
                  >
                    {translations.auth.backToLogin}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="username">{translations.auth.username}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder={translations.auth.usernamePlaceholder}
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{translations.auth.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={translations.auth.emailPlaceholder}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{translations.auth.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={translations.auth.passwordPlaceholder}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{translations.auth.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder={translations.auth.confirmPasswordPlaceholder}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Message */}
                {message.text && (
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    message.type === 'error' 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                      : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  }`}>
                    {message.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-sm">{message.text}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? translations.auth.processing : (
                    mode === 'register' ? translations.auth.register : translations.auth.login
                  )}
                </Button>
              </form>
            )}

            {/* Footer */}
            {mode !== 'confirm' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mode === 'login' ? translations.auth.noAccount : translations.auth.haveAccount}
                  {' '}
                  <Button
                    variant="link"
                    onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                    className="text-blue-600 dark:text-blue-400 p-0 h-auto font-medium"
                  >
                    {mode === 'login' ? translations.auth.register : translations.auth.login}
                  </Button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;

