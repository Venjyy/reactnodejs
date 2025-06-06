import React, { useState } from 'react';
import Axios from 'axios';
import './AdminAuth.css';

function AdminLogin() {
    const [usuario, setUsuario] = useState('');
    const [pass, setPass] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loginAdmin = () => {
        setIsLoading(true);
        setMensaje('Verificando credenciales...');
        setStatus('loading');

        Axios.post('http://localhost:3001/loginAdmin', {
            usuario: usuario,
            pass: pass
        })
            .then((res) => {
                console.log('Login exitoso:', res.data);
                setMensaje(`¡Bienvenido ${res.data.usuario}! Acceso concedido`);
                setStatus('success');
                setIsLoading(false);

                // Guardar datos del usuario autenticado
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUser', res.data.usuario);
                localStorage.setItem('adminId', res.data.id);

                // Redirigir al dashboard administrativo después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/admin-dashboard'; // Cambia esto al path correcto de tu dashboard
                }, 2000);
            })
            .catch((error) => {
                console.error('Error en login:', error);
                setIsLoading(false);

                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            setMensaje('Usuario o contraseña incorrectos. Verifique sus credenciales.');
                            break;
                        case 400:
                            setMensaje('Por favor complete todos los campos requeridos.');
                            break;
                        case 500:
                            setMensaje('Error del servidor. Intente nuevamente más tarde.');
                            break;
                        default:
                            setMensaje('Error inesperado. Contacte al administrador.');
                    }
                } else {
                    setMensaje('No se pudo conectar con el servidor. Verifique su conexión.');
                }
                setStatus('error');
            });
    };

    // ...existing code...
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!usuario.trim() || !pass.trim()) {
            setMensaje('Por favor ingrese su usuario y contraseña');
            setStatus('error');
            return;
        }

        if (usuario.length < 3) {
            setMensaje('El usuario debe tener al menos 3 caracteres');
            setStatus('error');
            return;
        }

        if (pass.length < 4) {
            setMensaje('La contraseña debe tener al menos 4 caracteres');
            setStatus('error');
            return;
        }

        loginAdmin();
    };

    const clearMessage = () => {
        setMensaje('');
        setStatus('');
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-form">
                <div className="login-header">
                    <h1>Acceso Administrativo</h1>
                    <p>Ingrese sus credenciales para acceder al panel de control</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="usuario">
                            <span className="label-icon"></span>
                            Usuario Administrador
                        </label>
                        <input
                            type="text"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => {
                                setUsuario(e.target.value);
                                clearMessage();
                            }}
                            placeholder="Ingrese su nombre de usuario"
                            required
                            autoComplete="username"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="pass">
                            <span className="label-icon"></span>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="pass"
                            value={pass}
                            onChange={(e) => {
                                setPass(e.target.value);
                                clearMessage();
                            }}
                            placeholder="Ingrese su contraseña"
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn-auth ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner">⏳</span>
                                Verificando...
                            </>
                        ) : (
                            <>
                                <span className="login-icon"></span>
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                {mensaje && (
                    <div className={`message ${status === 'success' ? 'success-message' : status === 'loading' ? 'loading-message' : 'error-message'}`}>
                        <span className="message-icon">
                            {status === 'success' ? '✅' : status === 'loading' ? '⏳' : '❌'}
                        </span>
                        {mensaje}
                    </div>
                )}

                <div className="login-footer">
                    <div className="navigation-links">
                        <a href="/" className="link-home">
                            <span className="link-icon">🏠</span>
                            Volver al Inicio
                        </a>
                        <a href="/admin-register" className="link-register">
                            <span className="link-icon">📝</span>
                            ¿No tienes cuenta? Regístrate
                        </a>
                    </div>

                    <div className="help-text">
                        <small>¿Olvidaste tu contraseña? Contacta al administrador del sistema</small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;