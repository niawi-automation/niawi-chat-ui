import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  // Generar fecha actual automáticamente
  const getCurrentDate = () => {
    const now = new Date();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Configuración</h2>
        <p className="text-muted-foreground">
          Personaliza tu experiencia con Copiloto Niawi
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card className="bg-niawi-surface border-niawi-border">
          <CardHeader>
            <CardTitle className="text-foreground">Notificaciones</CardTitle>
            <CardDescription>Configura cómo quieres recibir las notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-foreground">Notificaciones por email</Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-foreground">Notificaciones push</Label>
              <Switch id="push-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="insights-alerts" className="text-foreground">Alertas de insights críticos</Label>
              <Switch id="insights-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* AI Preferences */}
        <Card className="bg-niawi-surface border-niawi-border">
          <CardHeader>
            <CardTitle className="text-foreground">Preferencias de IA</CardTitle>
            <CardDescription>Personaliza el comportamiento del asistente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="proactive-suggestions" className="text-foreground">Sugerencias proactivas</Label>
              <Switch id="proactive-suggestions" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="detailed-analysis" className="text-foreground">Análisis detallado</Label>
              <Switch id="detailed-analysis" />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="bg-niawi-surface border-niawi-border">
          <CardHeader>
            <CardTitle className="text-foreground">Datos y Privacidad</CardTitle>
            <CardDescription>Controla cómo se manejan tus datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="data-analytics" className="text-foreground">Analytics de uso</Label>
              <Switch id="data-analytics" defaultChecked />
            </div>
            <Button variant="outline" className="border-niawi-border hover:bg-niawi-surface">
              Exportar datos
            </Button>
          </CardContent>
        </Card>

        {/* About Niawi */}
        <Card className="bg-niawi-surface border-niawi-border">
          <CardHeader>
            <CardTitle className="text-foreground">Acerca de Copiloto Niawi</CardTitle>
            <CardDescription>Información del sistema y la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Versión:</span>
                <span className="ml-2 text-foreground font-medium">1.0.0</span>
              </div>
              <div>
                <span className="text-muted-foreground">Desarrollado por:</span>
                <span className="ml-2 text-foreground font-medium">Niawi Tech</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sitio web:</span>
                <a href="http://niawi.tech/" target="_blank" rel="noopener noreferrer" 
                   className="ml-2 text-niawi-primary hover:text-niawi-accent transition-colors">
                  niawi.tech
                </a>
              </div>
              <div>
                <span className="text-muted-foreground">Última actualización:</span>
                <span className="ml-2 text-foreground font-medium">{getCurrentDate()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
