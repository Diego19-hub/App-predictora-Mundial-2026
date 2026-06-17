import axios from "axios";


const API_BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export const loginUser = (data) => api.post("/auth/login", data);
export const registerUser = (data) => api.post("/auth/register", data);
export const requestPasswordReset = (email) =>
    api.post("/auth/forgot-password", { email });