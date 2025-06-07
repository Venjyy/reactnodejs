import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Front from './pages/Front';
import AdminLogin from './components/Authorize/AdminLogin';
import AdminRegister from './components/Authorize/AdminRegister';
import AdminPanel from './pages/AdminPanel';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Front />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/admin-dashboard" element={<AdminPanel />} />
          <Route path="/admin-dashboard/*" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;