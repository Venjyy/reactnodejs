import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Front from './Front';
import AdminRegister from './AdminRegister';
import AdminLogin from './AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Front />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App;