
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Configuración</h2>
        <p className="text-muted-foreground">
          Personaliza tu experiencia con E.tres Agent
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card className="bg-etres-surface border-etres-border">
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
        <Card className="bg-etres-surface border-etres-border">
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
        <Card className="bg-etres-surface border-etres-border">
          <CardHeader>
            <CardTitle className="text-foreground">Datos y Privacidad</CardTitle>
            <CardDescription>Controla cómo se manejan tus datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="data-analytics" className="text-foreground">Analytics de uso</Label>
              <Switch id="data-analytics" defaultChecked />
            </div>
            <Button variant="outline" className="border-etres-border hover:bg-etres-surface">
              Exportar datos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
