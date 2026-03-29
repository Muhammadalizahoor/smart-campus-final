
// frontend/src/services/busService.js
import axios from "axios";

const API = "https://smart-campus-backend-iuqo.onrender.com/api/buses"; // adjust port if needed

// FETCH
export const fetchBuses = async () => {
  const res = await axios.get(API);
  return res.data.buses;
};

// CREATE
export const createBus = async (data) => {
  if (!data.busId) throw new Error("busId required");

  await axios.post(`${API}/create`, {
    busId: data.busId,
    plateNumber: data.plateNumber,
    capacity: Number(data.capacity) // 🔥 IMPORTANT
  });
};

// UPDATE
export const updateBus = async (data) => {
  await axios.put(`${API}/update`, data);
};

export const deleteBus = async (busId) => {
  if (!busId) throw new Error("busId missing");

  await axios.delete(`https://smart-campus-backend-iuqo.onrender.com/api/buses/delete/${busId}`);
};
