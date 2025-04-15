import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetchStudents } from "../services/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const lastSeenId = useRef(null);
  const seenIds = useRef(new Set());

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const students = await fetchStudents();
        if (students && students.length > 0) {
          // Sort by createdAt or _id descending (assuming newer first)
          students.sort((a, b) => (b.createdAt || b._id) > (a.createdAt || a._id) ? 1 : -1);
          if (!lastSeenId.current) {
            lastSeenId.current = students[0]._id;
            students.forEach(s => seenIds.current.add(s._id));
            return;
          }
          // Find new students not seen before
          const newEntries = students.filter(s => !seenIds.current.has(s._id));
          if (newEntries.length > 0) {
            setNotifications(prev => [...newEntries, ...prev]);
            newEntries.forEach(s => seenIds.current.add(s._id));
            lastSeenId.current = students[0]._id;
          }
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    poll();
    const interval = setInterval(poll, 10000); // 10 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(n => n.filter(notif => notif._id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
