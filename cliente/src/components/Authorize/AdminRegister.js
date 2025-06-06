import React, { useState } from 'react';
import Axios from 'axios';
import './AdminAuth.css';

function AdminRegister() {
    const [usuario, setUsuario] = useState('');
    const [pass, setPass] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [status, setStatus] = useState('');

    const crearUsuario = () => {
        Axios.post('http://localhost:3001/creaAdmin', {
            usuario: usuario,
            pass: pass
        })
            .then((res) => {
                setMensaje('¡Usuario administrador creado correctamente! Redirigiendo al login...');
                setStatus('success');
                setUsuario('');
                setPass('');

                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/admin-login';
                }, 2000);
            })
            .catch((error) => {
                console.error('Error al crear usuario:', error);
                if (error.response && error.response.data) {
                    setMensaje(error.response.data.error);
                } else {
                    setMensaje('Error al conectar con el servidor.');
                }
                setStatus('error');
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!usuario.trim() || !pass.trim()) {
            setMensaje('Por favor complete todos los campos');
            setStatus('error');
            return;
        }
        crearUsuario();
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-form">
                <h1>Registro de Administrador</h1>
                <p>Crea una cuenta de administrador para gestionar el centro de eventos</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="usuario">Usuario</label>
                        <input
                            type="text"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Ingrese nombre de usuario"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pass">Contraseña</label>
                        <input
                            type="password"
                            id="pass"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder="Ingrese contraseña"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth">
                        Crear Administrador
                    </button>
                </form>

                {mensaje && (
                    <div className={`message ${status === 'success' ? 'success-message' : 'error-message'}`}>
                        {mensaje}
                    </div>
                )}

                <div className="links-container">
                    <div className="back-link">
                        <a href="/">← Volver al inicio</a>
                    </div>
                    <div className="login-link">
                        <a href="/admin-login">¿Ya tienes cuenta? Inicia sesión</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminRegister;