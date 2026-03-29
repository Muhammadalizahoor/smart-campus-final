import axios from "axios";

const API = "http://localhost:5000/api";   // backend base URL


// ---------------------------
// 1️⃣ GET ALL REGISTERED STUDENTS
// ---------------------------
export const getStudentsAPI = async () => {
  try {
    const res = await axios.get(`${API}/students`);
    return res.data.students;
  } catch (err) {
    console.error("Error fetching students:", err);
    return [];
  }
};


// ---------------------------
// 2️⃣ CREATE NEW STUDENT  (ADMIN ONLY)
// ---------------------------
export const createStudentAPI = async (studentData) => {
  try {
    const res = await axios.post(`${API}/auth/create-student`, studentData);
    return res.data;
  } catch (err) {
    throw err;
  }
};


// --------------------------------
// 3️⃣ GET STUDENTS ENTRY/EXIT LOGS
// --------------------------------
export const getEntryLogsAPI = async () => {
  try {
    const res = await axios.get(`${API}/students/entry-logs`);
    return res.data.logs;
  } catch (err) {
    console.error("Error fetching logs:", err);
    return [];
  }
};
