import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NiawiLogoSvg from '@/assets/images/Niawilogo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading state with updated branding
    const loadingToast = {
      id: Date.now(),
      title: "Iniciando sesión...",
      description: "Accediendo a Copiloto Niawi...",
      type: "loading" as const
    };

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-niawi-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-niawi-surface border-niawi-border shadow-2xl hover-lift">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 flex items-center justify-center">
                <img 
                  src={NiawiLogoSvg} 
                  alt="Niawi Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground mb-2">Copiloto NiawiTech</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Ingresa tus credenciales para acceder al panel de control
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@niawi.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-niawi-bg border-niawi-border text-foreground placeholder:text-muted-foreground focus:border-niawi-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-niawi-bg border-niawi-border text-foreground placeholder:text-muted-foreground focus:border-niawi-primary pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-bg hover:opacity-90 text-white h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar sesión
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Niawi Tech • Solo usuarios autorizados
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
