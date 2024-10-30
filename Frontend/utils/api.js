import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const authState = isBrowser
  ? JSON.parse(window.localStorage.getItem('auth'))
  : null;

const token = authState?.state?.token || null;

const auth = `Bearer ${token}`;

axios.defaults.timeout = 50000;

export default axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization: auth,
  },
});
