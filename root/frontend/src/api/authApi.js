import axios from "axios";

// Localhost hatao aur Render ka backend URL dalo
const API = "https://smart-campus-backend-iuqo.onrender.com/api/auth";

export const signupUser = async (data) => {
  const res = await axios.post(`${API}/signup`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};