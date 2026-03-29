// frontend/src/services/driverService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/drivers";

export const fetchDrivers = async () => {
  const res = await axios.get(`${API_BASE_URL}/all`);
  return res.data;
};

export const createDriver = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/add`, data);
  return res.data;
};

export const updateDriver = async (data) => {
  const res = await axios.put(`${API_BASE_URL}/update`, data);
  return res.data;
};

export const deleteDriver = async (driverId) => {
  const res = await axios.delete(`${API_BASE_URL}/delete`, { data: { driverId } });
  return res.data;
};
