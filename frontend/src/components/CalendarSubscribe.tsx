import { useState } from 'react';
import { FaCalendarAlt, FaApple, FaGoogle, FaMicrosoft, FaSpinner, FaCheck, FaCopy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function CalendarSubscribe() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarUrls, setCalendarUrls] = useState<{
    subscriptionUrl?: string;
    webcalUrl?: string;
  }>({});

  const generateCalendarSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/calendar/token');
      const urls = response.data.data;
      
      // Store the URLs
      setCalendarUrls(urls);
      
      // Also store in localStorage for persistence
      localStorage.setItem('calendarSubscription', JSON.stringify({
        ...urls,
        generatedAt: Date.now()
      }));
      
      setIsOpen(true);
    } catch (error) {
      toast.error('Failed to generate calendar subscription');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToCalendar = (type: 'apple' | 'google' | 'outlook' | 'other') => {
    if (!calendarUrls.webcalUrl || !calendarUrls.subscriptionUrl) {
      toast.error('Please generate a subscription first');
      return;
    }

    const webcalUrl = calendarUrls.webcalUrl;
    const httpUrl = calendarUrls.subscriptionUrl;

    switch (type) {
      case 'apple':
        // For iOS/Mac, use the webcal:// protocol
        window.location.href = webcalUrl;
        toast.success('Opening Calendar app...');
        break;
      
      case 'google':
        // Google Calendar subscription URL
        const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(httpUrl)}`;
        window.open(googleUrl, '_blank');
        toast.success('Opening Google Calendar...');
        break;
      
      case 'outlook':
        // Outlook.com subscription URL
        const outlookUrl = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpUrl)}&name=Epic%20Fitness%20Workouts`;
        window.open(outlookUrl, '_blank');
        toast.success('Opening Outlook...');
        break;
      
      case 'other':
        // Copy the URL for manual subscription
        navigator.clipboard.writeText(httpUrl);
        toast.success('Calendar URL copied to clipboard!');
        break;
    }
  };

  return (
    <>
      {/* Subscribe Button */}
      <button
        onClick={generateCalendarSubscription}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaCalendarAlt />
        )}
        <span>Subscribe to Calendar</span>
      </button>

      {/* Subscription Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Subscribe to Your Workouts
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your workout schedule will automatically sync and update in your calendar app
              </p>

              <div className="space-y-3">
                {/* Apple Calendar */}
                <button
                  onClick={() => subscribeToCalendar('apple')}
                  className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaApple className="text-2xl" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Apple Calendar
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      iPhone, iPad, Mac
                    </div>
                  </div>
                  <FaCheck className="text-green-500" />
                </button>

                {/* Google Calendar */}
                <button
                  onClick={() => subscribeToCalendar('google')}
                  className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaGoogle className="text-2xl text-blue-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Google Calendar
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Android, Web
                    </div>
                  </div>
                </button>

                {/* Outlook */}
                <button
                  onClick={() => subscribeToCalendar('outlook')}
                  className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaMicrosoft className="text-2xl text-blue-600" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Outlook
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Outlook.com, Office 365
                    </div>
                  </div>
                </button>

                {/* Other / Copy URL */}
                <button
                  onClick={() => subscribeToCalendar('other')}
                  className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FaCopy className="text-2xl text-gray-500" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Copy Calendar URL
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      For other calendar apps
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Auto-sync enabled:</strong> Your calendar will automatically update with new workouts and schedule changes every 4 hours.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}