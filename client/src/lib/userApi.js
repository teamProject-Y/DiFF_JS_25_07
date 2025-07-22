import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/DiFF', // 백엔드 서버 주소
    withCredentials: true, // JSESSIONID 같은 쿠키 주고받기
    timeout: 5000,
});

export const getUsers = () => api.get('/users');
export default api; // 필요할시 쓰기 (혹시몰라서 썼음)