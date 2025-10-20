import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NiawiLogoSvg from '@/assets/images/Niawilogo.svg';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Intentando login con:', email, password);
      const result = login(email, password);
      console.log('Resultado del login:', result);
      
      if (result.success && result.user) {
        console.log('Login exitoso, redirigiendo...');
        // Determinar la ruta de redirección según el tipo de usuario
        if (result.user.accessType === 'automations_only') {
          navigate('/dashboard/automations');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.log('Login fallido:', result.message);
        // Mostrar error de credenciales inválidas
        alert(result.message || 'Credenciales incorrectas. Acceso denegado.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={NiawiLogoSvg} 
              alt="Niawi" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Accede a tu Copiloto Niawi
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-niawi-surface border-niawi-border">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Credenciales de Acceso</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus datos para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-niawi-bg border-niawi-border focus:border-niawi-primary text-foreground"
                    placeholder="tu@empresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-niawi-bg border-niawi-border focus:border-niawi-primary text-foreground"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-niawi-primary hover:bg-niawi-primary/90 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            ¿Problemas para acceder?{' '}
            <a href="mailto:soporte@niawi.tech" className="text-niawi-primary hover:text-niawi-accent">
              Contacta soporte
            </a>
          </p>
          <p className="mt-2">
            © 2025 Niawi. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
