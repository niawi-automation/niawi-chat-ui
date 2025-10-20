import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Definir tipos de usuarios
export interface UserAuth {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'bot_user';
  accessType: 'full' | 'automations_only';
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const authData = localStorage.getItem('niawi-auth');
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        if (userData.userId && userData.email) {
          setIsAuthenticated(true);
          setCurrentUser(userData);
        } else {
          localStorage.removeItem('niawi-auth');
        }
      } catch (error) {
        localStorage.removeItem('niawi-auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; message?: string; user?: UserAuth } => {
    console.log('Iniciando proceso de login...');
    console.log('Email recibido:', email);
    console.log('Password recibido:', password);
    console.log('Variables de entorno:', {
      VITE_AUTH_EMAIL: import.meta.env.VITE_AUTH_EMAIL,
      VITE_AUTH_PASSWORD: import.meta.env.VITE_AUTH_PASSWORD
    });

    // Credenciales válidas
    const validCredentials = [
      { 
        email: import.meta.env.VITE_AUTH_EMAIL || 'admin@niawi.tech', 
        password: import.meta.env.VITE_AUTH_PASSWORD || 'd3mo.Niawi',
        user: {
          id: '1',
          email: import.meta.env.VITE_AUTH_EMAIL || 'admin@niawi.tech',
          name: 'Super Administrador',
          role: 'super_admin' as const,
          accessType: 'full' as const
        }
      },
      { 
        email: 'bot@wts.com.pe', 
        password: 'WTS%2025*',
        user: {
          id: '2',
          email: 'bot@wts.com.pe',
          name: 'Usuario Bot WTS',
          role: 'bot_user' as const,
          accessType: 'automations_only' as const
        }
      }
    ];

    console.log('Credenciales válidas configuradas:', validCredentials.map(c => ({ email: c.email, password: c.password.substring(0, 3) + '***' })));

    const validCredential = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    console.log('Credencial encontrada:', validCredential ? 'SÍ' : 'NO');

    if (validCredential) {
      console.log('Usuario válido encontrado:', validCredential.user);
      const authData = {
        userId: validCredential.user.id,
        email: validCredential.user.email,
        name: validCredential.user.name,
        role: validCredential.user.role,
        accessType: validCredential.user.accessType,
        timestamp: Date.now()
      };
      localStorage.setItem('niawi-auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setCurrentUser(validCredential.user);
      console.log('Autenticación exitosa, datos guardados en localStorage');
      return { success: true, user: validCredential.user };
    }
    
    console.log('Credenciales inválidas');
    return { success: false, message: 'Credenciales incorrectas. Acceso denegado.' };
  };

  const logout = () => {
    localStorage.removeItem('niawi-auth');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout,
    requireAuth
  };
}; 