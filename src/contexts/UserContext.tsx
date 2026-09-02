import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { db } from '@/utils/storageDB';

export interface UserData {
  name: string;
  usn: string;
  collegeName: string;
  course: string;
  academicYear: string;
  pin: string;
  isPinEnabled: boolean;
  isFirstTime: boolean;
  darkMode: boolean;
  theme?: 'light' | 'dark';
  isOnboarded: boolean;
  profileImage?: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoggedIn: boolean;
  isOffline: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  setUserData: (data: UserData) => void;
  login: (pin: string) => boolean;
  logout: () => void;
  updateUserData: (data: Partial<UserData>) => void;
  calculateOverallAttendance: () => number;
  changePin: (currentPin: string, newPin: string) => void;
  togglePinProtection: (enabled: boolean, pin?: string) => void;
  completeOnboarding: (partial?: Partial<UserData>) => void;
  resetAllData: () => void;
}

const initialUserData: UserData = {
  name: '',
  usn: '',
  collegeName: '',
  course: '',
  academicYear: '',
  pin: '',
  isPinEnabled: false,
  isFirstTime: true,
  darkMode: false,
  theme: 'light',
  isOnboarded: false,
  profileImage: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  const applyTheme = (t: 'light' | 'dark') => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('bunkbuddy_theme') as 'light' | 'dark') || 'light';
    setThemeState(savedTheme);
    applyTheme(savedTheme);

    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "Online Mode",
        description: "Your network connection is restored.",
        variant: "default",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "Offline Mode Active",
        description: "Your data is safely stored locally in IndexedDB.",
        variant: "default",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('bunkbuddy_theme', newTheme);
    applyTheme(newTheme);
    if (userData) {
      updateUserData({ darkMode: newTheme === 'dark', theme: newTheme });
    }
  };

  useEffect(() => {
    try {
      const storedData = db.getSync<UserData | null>('bunkbuddy_user', null);
      if (storedData) {
        setUserDataState(storedData);
        if (storedData.theme) {
          setThemeState(storedData.theme);
          applyTheme(storedData.theme);
        }
        
        if (storedData.isOnboarded || !storedData.isFirstTime) {
          if (storedData.isPinEnabled && storedData.pin) {
            const hasSession = db.getSync<string>('bunkbuddy_session', 'false');
            setIsLoggedIn(hasSession === 'true');
          } else {
            setIsLoggedIn(true);
            db.set('bunkbuddy_session', 'true');
          }
        }
      } else {
        setUserDataState(initialUserData);
      }
    } catch (error) {
      console.error("Error initializing UserContext:", error);
      setUserDataState(initialUserData);
    }
  }, []);

  const setUserData = (data: UserData) => {
    try {
      setUserDataState(data);
      db.set('bunkbuddy_user', data);
      
      if (!data.isPinEnabled) {
        setIsLoggedIn(true);
        db.set('bunkbuddy_session', 'true');
      }
    } catch (error) {
      console.error("Error setting user data:", error);
    }
  };

  const login = (pin: string): boolean => {
    if (userData && (!userData.isPinEnabled || userData.pin === pin)) {
      setIsLoggedIn(true);
      db.set('bunkbuddy_session', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    db.remove('bunkbuddy_session');
  };

  const updateUserData = (data: Partial<UserData>) => {
    if (userData) {
      const updatedData = { ...userData, ...data };
      setUserDataState(updatedData);
      db.set('bunkbuddy_user', updatedData);
    }
  };

  const completeOnboarding = (partial?: Partial<UserData>) => {
    const updated: UserData = {
      ...(userData || initialUserData),
      ...partial,
      isFirstTime: false,
      isOnboarded: true
    };
    setUserData(updated);
    setIsLoggedIn(true);
    db.set('bunkbuddy_session', 'true');
  };

  const changePin = (currentPin: string, newPin: string) => {
    if (!userData) throw new Error("No user data available");
    if (userData.isPinEnabled && userData.pin !== currentPin) {
      throw new Error("Current PIN is incorrect");
    }
    if (newPin.length < 4) {
      throw new Error("New PIN must be at least 4 digits");
    }

    const updatedData = { ...userData, pin: newPin, isPinEnabled: true };
    setUserData(updatedData);
    toast({
      title: "PIN Updated",
      description: "Your security PIN has been changed successfully.",
    });
  };

  const togglePinProtection = (enabled: boolean, pin?: string) => {
    if (!userData) throw new Error("No user data available");
    if (enabled && (!pin || pin.length < 4)) {
      throw new Error("PIN must be 4 digits");
    }

    const updatedData = { 
      ...userData, 
      isPinEnabled: enabled,
      pin: enabled ? pin || userData.pin : ''
    };
    
    setUserData(updatedData);
    toast({
      title: enabled ? "PIN Security Enabled" : "PIN Security Disabled",
      description: enabled ? "You will need to enter your PIN to unlock BunkBuddy." : "PIN lock turned off.",
    });
  };

  const calculateOverallAttendance = (): number => {
    try {
      const subjects = db.getSync<any[]>('subjects', []);
      if (subjects.length === 0) return 0;
      
      let totalAttended = 0;
      let totalClasses = 0;
      
      subjects.forEach((subject: any) => {
        totalAttended += Number(subject.attendedClasses || 0);
        totalClasses += Number(subject.totalClasses || 0);
      });
      
      return totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 100);
    } catch (error) {
      console.error("Error calculating overall attendance:", error);
      return 0;
    }
  };

  const resetAllData = () => {
    db.remove('bunkbuddy_user');
    db.remove('bunkbuddy_session');
    db.remove('subjects');
    db.remove('notes');
    db.remove('active_tab');
    setUserDataState(initialUserData);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <UserContext.Provider 
      value={{ 
        userData, 
        isLoggedIn,
        isOffline,
        theme,
        setTheme,
        setUserData, 
        login, 
        logout, 
        updateUserData, 
        calculateOverallAttendance,
        changePin,
        togglePinProtection,
        completeOnboarding,
        resetAllData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
