import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, X, Globe, Rss, Hash, Bell, Filter, Clock, Save, Trash2, 
  Play, CheckCircle, AlertCircle, Settings, User, LogOut, Sun, Moon 
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { Switch } from './ui/switch.jsx';
import { Badge } from './ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.jsx';
import { translations } from '../translations.js';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('idle'); // 'idle', 'parsing', 'success', 'error'
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings state
  const [newsSources, setNewsSources] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [preferences, setPreferences] = useState({
    updateFrequency: 'daily',
    summaryLength: 'medium',
    notifications: true,
    autoFilter: true,
    showImages: true,
    language: 'en'
  });

  // Form state
  const [newSource, setNewSource] = useState({ name: '', url: '', category: '' });
  const [newKeyword, setNewKeyword] = useState({ text: '', priority: 'medium' });

  const t = translations[language];

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
      return;
    }

    // Load user settings
    loadUserSettings();
  }, [navigate]);

  const loadUserSettings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      // Load news sources
      const sourcesResponse = await fetch('http://localhost:5000/api/settings/news-sources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sourcesResponse.ok) {
        const sourcesData = await sourcesResponse.json();
        setNewsSources(sourcesData);
      }

      // Load keywords
      const keywordsResponse = await fetch('http://localhost:5000/api/settings/keywords', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (keywordsResponse.ok) {
        const keywordsData = await keywordsResponse.json();
        setKeywords(keywordsData);
      }

      // Load preferences
      const preferencesResponse = await fetch('http://localhost:5000/api/settings/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        setPreferences(preferencesData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    }
  };

  const handleAddNewsSource = async () => {
    if (!newSource.name || !newSource.url || !newSource.category) {
      setMessage({ type: 'error', text: t.auth.errors.fieldsRequired });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/settings/news-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSource)
      });

      const data = await response.json();

      if (response.ok) {
        setNewsSources([...newsSources, data.source]);
        setNewSource({ name: '', url: '', category: '' });
        setMessage({ type: 'success', text: 'News source added successfully' });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add news source' });
    }
  };

  const handleRemoveNewsSource = async (sourceId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/settings/news-sources/${sourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNewsSources(newsSources.filter(source => source.id !== sourceId));
        setMessage({ type: 'success', text: 'News source removed successfully' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove news source' });
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.text) {
      setMessage({ type: 'error', text: 'Keyword text is required' });
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/settings/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newKeyword)
      });

      const data = await response.json();

      if (response.ok) {
        setKeywords([...keywords, data.keyword]);
        setNewKeyword({ text: '', priority: 'medium' });
        setMessage({ type: 'success', text: 'Keyword added successfully' });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add keyword' });
    }
  };

  const handleRemoveKeyword = async (keywordId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/settings/keywords/${keywordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setKeywords(keywords.filter(keyword => keyword.id !== keywordId));
        setMessage({ type: 'success', text: 'Keyword removed successfully' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove keyword' });
    }
  };

  const handleSavePreferences = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Preferences saved successfully' });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartMyFeed = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    if (newsSources.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one news source before starting your feed' });
      return;
    }

    setParsingStatus('parsing');
    setMessage({ type: 'info', text: 'Starting to parse your feeds. This may take a few minutes...' });

    try {
      const response = await fetch('http://localhost:5000/api/feed/start-parsing', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        setParsingStatus('success');
        setMessage({ type: 'success', text: data.message });
        
        // Redirect to feed page after a delay
        setTimeout(() => {
          navigate('/feed');
        }, 2000);
      } else {
        setParsingStatus('error');
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setParsingStatus('error');
      setMessage({ type: 'error', text: 'Failed to start feed parsing' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
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

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'science', label: 'Science' },
    { value: 'politics', label: 'Politics' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'world', label: 'World News' }
  ];

  const priorities = [
    { value: 'high', label: t.settings.priority.high, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    { value: 'medium', label: t.settings.priority.medium, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'low', label: t.settings.priority.low, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.settings.backToHome}</span>
              </Button>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chimera
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
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
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-gray-600 dark:text-gray-400"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language.toUpperCase()}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-400"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.settings.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.settings.subtitle}
          </p>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                  : message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              {message.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {message.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {message.type === 'info' && <Settings className="w-4 h-4 flex-shrink-0" />}
              <span className="text-sm">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources" className="flex items-center space-x-2">
              <Rss className="w-4 h-4" />
              <span>{t.settings.newsSources}</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>{t.settings.keywords}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>{t.settings.preferences}</span>
            </TabsTrigger>
          </TabsList>

          {/* News Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rss className="w-5 h-5" />
                  <span>{t.settings.newsSourcesTitle}</span>
                </CardTitle>
                <CardDescription>
                  {t.settings.newsSourcesSubtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new source form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label htmlFor="sourceName">Source Name</Label>
                    <Input
                      id="sourceName"
                      placeholder={t.settings.sourceName}
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceUrl">Source URL</Label>
                    <Input
                      id="sourceUrl"
                      placeholder={t.settings.sourceUrl}
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceCategory">Category</Label>
                    <Select value={newSource.category} onValueChange={(value) => setNewSource({ ...newSource, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.settings.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddNewsSource} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.settings.addSource}
                    </Button>
                  </div>
                </div>

                {/* Sources list */}
                <div className="space-y-2">
                  {newsSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{source.name}</h4>
                          <Badge variant="secondary">{source.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{source.url}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNewsSource(source.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {newsSources.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No news sources added yet. Add your first source above.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="w-5 h-5" />
                  <span>{t.settings.keywordsTitle}</span>
                </CardTitle>
                <CardDescription>
                  {t.settings.keywordsSubtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new keyword form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label htmlFor="keywordText">Keyword</Label>
                    <Input
                      id="keywordText"
                      placeholder={t.settings.keywordPlaceholder}
                      value={newKeyword.text}
                      onChange={(e) => setNewKeyword({ ...newKeyword, text: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywordPriority">Priority</Label>
                    <Select value={newKeyword.priority} onValueChange={(value) => setNewKeyword({ ...newKeyword, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddKeyword} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.settings.addKeyword}
                    </Button>
                  </div>
                </div>

                {/* Keywords list */}
                <div className="space-y-2">
                  {keywords.map((keyword) => {
                    const priority = priorities.find(p => p.value === keyword.priority);
                    return (
                      <div key={keyword.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{keyword.text}</span>
                          <Badge className={priority?.color}>{priority?.label}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKeyword(keyword.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {keywords.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No keywords added yet. Add your first keyword above.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>{t.settings.preferencesTitle}</span>
                </CardTitle>
                <CardDescription>
                  {t.settings.preferencesSubtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t.settings.updateFrequency}</Label>
                    <Select 
                      value={preferences.updateFrequency} 
                      onValueChange={(value) => setPreferences({ ...preferences, updateFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">{t.settings.frequencies.realtime}</SelectItem>
                        <SelectItem value="hourly">{t.settings.frequencies.hourly}</SelectItem>
                        <SelectItem value="daily">{t.settings.frequencies.daily}</SelectItem>
                        <SelectItem value="weekly">{t.settings.frequencies.weekly}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.settings.summaryLength}</Label>
                    <Select 
                      value={preferences.summaryLength} 
                      onValueChange={(value) => setPreferences({ ...preferences, summaryLength: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">{t.settings.summaryLengths.short}</SelectItem>
                        <SelectItem value="medium">{t.settings.summaryLengths.medium}</SelectItem>
                        <SelectItem value="long">{t.settings.summaryLengths.long}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.settings.notifications}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications when new articles are available
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.settings.autoFilter}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically filter out duplicate articles
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoFilter}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, autoFilter: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.settings.showImages}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Display article images in your feed
                      </p>
                    </div>
                    <Switch
                      checked={preferences.showImages}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, showImages: checked })}
                    />
                  </div>
                </div>

                <Button onClick={handleSavePreferences} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : t.settings.saveSettings}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleStartMyFeed}
            disabled={loading || parsingStatus === 'parsing' || newsSources.length === 0}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-3"
          >
            {parsingStatus === 'parsing' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Parsing feeds...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                {t.settings.startMyFeed}
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

