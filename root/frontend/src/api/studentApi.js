import axios from "axios";//frontend//src//api//studentApi.js

const API_BASE = "https://smart-campus-backend-iuqo.onrender.com/api";

export const fetchStudents = () =>
  axios.get(`${API_BASE}/students`);

export const createStudent = (payload) =>
  axios.post(`${API_BASE}/students`, payload);

export const updateStudent = (email, updates) =>
  axios.put(`${API_BASE}/students/${encodeURIComponent(email)}`, updates);

export const deleteStudent = (email) =>
  axios.delete(`${API_BASE}/students/${encodeURIComponent(email)}`);

export const fetchAvailableRFIDs = () =>
  axios.get(`${API_BASE}/students/available-rfids`);


export const assignRFID = (email, rfid) =>
  axios.put(`${API_BASE}/students/assign-rfid`, {
    email,
    rfid_id: rfid,
  });


export const fetchEntryExitLogs = () =>
  axios.get(`${API_BASE}/students/logs`);
