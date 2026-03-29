
// // // frontend/src/api/complaintApi.js
import axios from "axios";

const API_BASE = "https://smart-campus-backend-iuqo.onrender.com/api/complaints";

// STUDENT: create complaint
export const createComplaint = (payload) =>
  axios.post(`${API_BASE}/create`, payload);

// STUDENT: get own complaints
export const fetchStudentComplaints = (email) =>
  axios.get(`${API_BASE}/student/${encodeURIComponent(email)}`);

// ADMIN: get all complaints
export const fetchAllComplaints = () =>
  axios.get(`${API_BASE}`);

// ADMIN: get single complaint
export const fetchComplaintById = (id) =>
  axios.get(`${API_BASE}/${id}`);

// ADMIN: update complaint status
export const updateComplaintStatus = (id, status) =>
  axios.put(`${API_BASE}/${id}/status`, { status });

// ADMIN: delete complaint
export const deleteComplaint = (id) =>
  axios.delete(`${API_BASE}/${id}`);

// ✅ ADMIN: send reply (FIXED)
export const sendComplaintReply = (id, payload) =>
  axios.post(`${API_BASE}/${id}/reply`, payload);
