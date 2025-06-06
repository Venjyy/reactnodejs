import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Front from './Front';
import AdminRegister from './Authorize/AdminRegister';
import AdminLogin from './Authorize/AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Front />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;