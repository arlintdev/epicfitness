import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      // Check for iOS standalone
      const iosStandalone = (window.navigator as any).standalone === true;
      
      // Check for Android/Chrome standalone (PWA)
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const pwaStandalone = mediaQuery.matches;
      
      // Check URL parameter (some browsers)
      const urlStandalone = window.location.search.includes('mode=standalone');
      
      setIsStandalone(iosStandalone || pwaStandalone || urlStandalone);
    };

    // Check if iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      setIsIOS(isIOSDevice && isSafari);
    };

    checkStandalone();
    checkIOS();

    // Listen for the beforeinstallprompt event (Chrome/Edge/Samsung)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app was previously installed (for returning users)
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        if (apps.length > 0) {
          setIsInstalled(true);
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  };

  // Determine if we should show the install button
  const shouldShowInstall = !isStandalone && !isInstalled && (!!installPrompt || isIOS);

  return {
    promptInstall,
    isInstalled,
    isStandalone,
    isIOS,
    shouldShowInstall,
    canInstall: !!installPrompt,
  };
}