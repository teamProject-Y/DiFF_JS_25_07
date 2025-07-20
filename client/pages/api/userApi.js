import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/DiFF', // 백엔드 서버 주소
    withCredentials: true,
    timeout: 5000,
});

export const getUsers = () => api.get('/users');