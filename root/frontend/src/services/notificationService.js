

// frontend/src/services/notificationService.js
import axios from 'axios';
const API_BASE = 'http://localhost:5000/api/notifications';

export const getNotificationsForStudent = async (email) => {
  if(!email) throw new Error('email required');
  const res = await axios.get(`${API_BASE}/for-student`, { params: { email } });
  return res.data;
};

export const hideNotificationForStudent = async (notificationId, studentEmail) => {
  const res = await axios.post(`${API_BASE}/student/hide`, { notificationId, studentEmail });
  return res.data;
};

export const softDeleteNotifications = async (notificationIds, studentEmail) => {
  const res = await axios.post(`${API_BASE}/student/soft-delete`, {
    notificationIds,
    studentEmail
  });
  return res.data;
};

export const markAllAsSeen = async (studentEmail) => {
  const res = await axios.post(`${API_BASE}/student/mark-seen`, { studentEmail });
  return res.data;
};
