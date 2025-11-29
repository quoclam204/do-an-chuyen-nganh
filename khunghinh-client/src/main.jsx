import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import { API_BASE } from './config'

// Configure axios globally: baseURL + send credentials (cookies)
axios.defaults.baseURL = API_BASE
axios.defaults.withCredentials = true

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
