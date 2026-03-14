import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

import AdminDashboard from './AdminDashboard';
import PoliceDashboard from './PoliceDashboard';
import UserDashboard from './UserDashboard';
import Login from './Login';

// Protected Route: if no user session, redirect to login
function ProtectedRoute({ element, requiredRole }) {
    try {
        const stored = localStorage.getItem('user');
        if (!stored || stored === 'undefined' || stored === 'null') {
            return <Navigate to="/" replace />;
        }
        const user = JSON.parse(stored);
        if (requiredRole && user.role?.toLowerCase() !== requiredRole) {
            // Role mismatch: redirect to their proper dashboard
            const role = user.role?.toLowerCase();
            if (role === 'admin') return <Navigate to="/admin" replace />;
            if (role === 'police') return <Navigate to="/police" replace />;
            return <Navigate to="/user" replace />;
        }
        return element;
    } catch (e) {
        return <Navigate to="/" replace />;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/user" element={<ProtectedRoute element={<UserDashboard />} requiredRole="user" />} />
                    <Route path="/police" element={<ProtectedRoute element={<PoliceDashboard />} requiredRole="police" />} />
                    <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}
