import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Bot, Zap, Settings, Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NiawiLogo from './NiawiLogo';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Recomendaciones',
      path: '/dashboard/recommendations',
      icon: TrendingUp,
      badge: '3',
      badgeColor: 'bg-niawi-danger',
      subtitle: 'Insights estratégicos basados en IA'
    },
    {
      title: 'Copiloto Niawi',
      path: '/dashboard/chat',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-niawi-primary',
      subtitle: 'Asistente ejecutivo inteligente'
    },
    {
      title: 'Integraciones',
      path: '/dashboard/integrations',
      icon: Zap,
      badge: '4/5',
      badgeColor: 'bg-niawi-accent',
      subtitle: 'Ecosistema empresarial conectado'
    },
    {
      title: 'Configuración',
      path: '/dashboard/settings',
      icon: Settings,
      badge: null,
      badgeColor: '',
      subtitle: 'Preferencias y configuración avanzada'
    }
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard/chat' && location.pathname === '/dashboard') return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-niawi-bg flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-niawi-surface border-r border-niawi-border transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-niawi-border">
            <NiawiLogo size="md" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-niawi-primary text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-niawi-border/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {item.badge && (
                        <Badge className={`${item.badgeColor} text-white text-xs`}>
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-current opacity-70 truncate">{item.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-6 border-t border-niawi-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-niawi-border/30">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
                <AvatarFallback className="bg-niawi-primary text-white">AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Administrador</p>
                <p className="text-xs text-muted-foreground truncate">admin@niawi.tech</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-niawi-danger"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-niawi-surface border-b border-niawi-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              {menuItems.find(item => isActive(item.path))?.title || 'Copiloto Niawi'}
            </h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
