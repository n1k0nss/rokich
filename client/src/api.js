import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const submitResults = async (data) => {
    const response = await axios.post(`${API_URL}/api/results`, data);
    return response.data;
};