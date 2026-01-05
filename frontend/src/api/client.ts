import axios from 'axios';

/**
 * Axios instance configured for the API.
 * Automatically attaches JWT token from sessionStorage.
 * Refresh token is handled via HttpOnly cookies.
 */
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Refresh token is sent automatically via HttpOnly cookie
                const response = await apiClient.post('/auth/refresh');

                const { access_token } = response.data;
                sessionStorage.setItem('access_token', access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch {
                // Refresh failed, clear tokens
                sessionStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
