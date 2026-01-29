import axios from 'axios'

const client = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle errors
client.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        // But usually store handles cleanup
        return Promise.reject(error)
    }
)

export default client
