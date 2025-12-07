import axios from 'axios';

const api = axios.create({
    baseURL: 'https://brew-assignment-npad.vercel.app/api',
    withCredentials: true,
});

export default api;
