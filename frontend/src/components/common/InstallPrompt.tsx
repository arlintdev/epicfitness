import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaApple, FaAndroid, FaChrome, FaShareAlt } from 'react-icons/fa';
import useInstallPrompt from '../../hooks/useInstallPrompt';

export default function InstallPrompt() {
  const { promptInstall, isIOS, shouldShowInstall, canInstall } = useInstallPrompt();
  const [showBanner, setShowBanner] = useState(true);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!shouldShowInstall || !showBanner) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (canInstall) {
      const installed = await promptInstall();
      if (installed) {
        setShowBanner(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage with expiry (e.g., 7 days)
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('installPromptDismissed', dismissedUntil.toString());
  };

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-xl">
                    <FaDownload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Install Epic Fitness
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add to your home screen for the best experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                {isIOS ? (
                  <>
                    <FaApple className="h-5 w-5" />
                    <span>Add to Home Screen</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="h-4 w-4" />
                    <span>Install App</span>
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center space-x-1">
                  <FaChrome className="h-3 w-3" />
                  <span>No app store needed</span>
                </span>
                <span>•</span>
                <span>Instant access</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add to Home Screen
                </h3>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mt-1">
                    <FaShareAlt className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      1. Tap the Share button
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Find the share icon in your Safari toolbar
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg mt-1">
                    <FaDownload className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      2. Select "Add to Home Screen"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Scroll down and tap this option
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg mt-1">
                    <FaApple className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      3. Tap "Add"
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Epic Fitness will be added to your home screen
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full mt-6 bg-primary-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}