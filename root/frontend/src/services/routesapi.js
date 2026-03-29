import axios from "axios";    //frontend/src/services/routesapi.js
const API_BASE_URL = "https://smart-campus-backend-iuqo.onrender.com/api/routes";

export const fetchRoutes = async () => {
  const res = await axios.get(`${API_BASE_URL}/all`);
  return res.data;
};

export const createRoute = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/add`, data);
  return res.data;
};

export const updateRoute = async (data) => {
  const res = await axios.put(`${API_BASE_URL}/update`, data);
  return res.data;
};

// export const deleteRoute = async (routeId) => {
//   const res = await axios.delete(`${API_BASE_URL}/delete`, { data: { routeId } });
//   return res.data;
// };

export const deleteRoute = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/delete`, data);
  return res.data;
};






