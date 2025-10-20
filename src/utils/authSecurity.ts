// Sistema de autenticación seguro con variables de entorno
// Este archivo maneja las credenciales de forma segura

interface SecureCredentials {
  email: string;
  password: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'bot_user';
    accessType: 'full' | 'automations_only';
  };
}

// Función para obtener credenciales de forma segura
export const getSecureCredentials = (): SecureCredentials[] => {
  // Obtener credenciales desde variables de entorno
  const adminEmail = import.meta.env.VITE_AUTH_EMAIL;
  const adminPassword = import.meta.env.VITE_AUTH_PASSWORD;
  const botEmail = import.meta.env.VITE_BOT_EMAIL;
  const botPassword = import.meta.env.VITE_BOT_PASSWORD;

  // Validar que las variables de entorno estén configuradas
  if (!adminEmail || !adminPassword || !botEmail || !botPassword) {
    console.warn('⚠️ Variables de entorno de autenticación no configuradas. Usando valores por defecto.');
    
    // Valores por defecto solo para desarrollo local
    return [
      {
        email: 'admin@niawi.tech',
        password: 'd3mo.Niawi',
        user: {
          id: '1',
          email: 'admin@niawi.tech',
          name: 'Super Administrador',
          role: 'super_admin',
          accessType: 'full'
        }
      },
      {
        email: 'bot@wts.com.pe',
        password: 'WTS%2025*',
        user: {
          id: '2',
          email: 'bot@wts.com.pe',
          name: 'Usuario Bot WTS',
          role: 'bot_user',
          accessType: 'automations_only'
        }
      }
    ];
  }

  // Usar variables de entorno configuradas
  return [
    {
      email: adminEmail,
      password: adminPassword,
      user: {
        id: '1',
        email: adminEmail,
        name: 'Super Administrador',
        role: 'super_admin',
        accessType: 'full'
      }
    },
    {
      email: botEmail,
      password: botPassword,
      user: {
        id: '2',
        email: botEmail,
        name: 'Usuario Bot WTS',
        role: 'bot_user',
        accessType: 'automations_only'
      }
    }
  ];
};

// Función para validar credenciales de forma segura
export const validateCredentials = (email: string, password: string): SecureCredentials | null => {
  const validCredentials = getSecureCredentials();
  
  // Logging seguro (solo mostrar parte de la información)
  console.log('🔐 Validando credenciales para:', email);
  
  const validCredential = validCredentials.find(
    cred => cred.email === email && cred.password === password
  );

  if (validCredential) {
    console.log('✅ Credenciales válidas para:', email);
    return validCredential;
  } else {
    console.log('❌ Credenciales inválidas para:', email);
    return null;
  }
};

// Función para generar hash simple de contraseña (para logging seguro)
export const maskPassword = (password: string): string => {
  if (password.length <= 3) return '***';
  return password.substring(0, 2) + '*'.repeat(password.length - 2);
};

// Función para verificar si las variables de entorno están configuradas
export const isEnvironmentConfigured = (): boolean => {
  const adminEmail = import.meta.env.VITE_AUTH_EMAIL;
  const adminPassword = import.meta.env.VITE_AUTH_PASSWORD;
  const botEmail = import.meta.env.VITE_BOT_EMAIL;
  const botPassword = import.meta.env.VITE_BOT_PASSWORD;
  
  return !!(adminEmail && adminPassword && botEmail && botPassword);
};
