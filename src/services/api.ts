import axios from "axios";
import { appConfig } from "../config/appConfig";

export const api = axios.create({
  baseURL: appConfig.apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});