import axios from 'axios';

export const api = axios.create({
  baseURL: "http://nlw-setup-backend-users-production.up.railway.app",
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://nlw-setup-backend-users-production.up.railway.app'
  }
})
