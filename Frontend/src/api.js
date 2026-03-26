import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constans";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
})

const isPublicEndpoint = (url = "") => {
    const normalized = String(url);

    // Public routes should work for logged-out users even if a stale token exists.
    return (
        /^\/?api\/posts\/?$/.test(normalized) ||
        /^\/?api\/posts\/\d+\/?$/.test(normalized) ||
        /^\/?api\/categories\/?$/.test(normalized) ||
        /^\/?api\/token\/?$/.test(normalized) ||
        /^\/?api\/token\/refresh\/?$/.test(normalized) ||
        /^\/?api\/user\/register\/?$/.test(normalized)
    );
};

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (accessToken && !isPublicEndpoint(config.url)) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        } else if (config.headers && config.headers['Authorization']) {
            delete config.headers['Authorization'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api;