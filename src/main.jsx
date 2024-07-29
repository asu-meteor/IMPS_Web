import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

/**
 * The entry point of the React application.
 * It initializes the root component and wraps it with necessary providers.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
    < React.StrictMode >
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
