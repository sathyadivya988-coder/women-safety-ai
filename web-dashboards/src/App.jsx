import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import AdminDashboard from './AdminDashboard';
import PoliceDashboard from './PoliceDashboard';
import UserDashboard from './UserDashboard';
import Login from './Login';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/police" element={<PoliceDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}
