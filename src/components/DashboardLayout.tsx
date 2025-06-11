
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Bot, Zap, Settings, Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EtresLogo from './EtresLogo';

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
      badgeColor: 'bg-etres-danger',
      subtitle: 'Insights estratégicos basados en IA'
    },
    {
      title: 'E.tres Agent',
      path: '/dashboard/chat',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-etres-primary',
      subtitle: 'Asistente ejecutivo inteligente'
    },
    {
      title: 'Integraciones',
      path: '/dashboard/integrations',
      icon: Zap,
      badge: '4/5',
      badgeColor: 'bg-etres-accent',
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
    <div className="min-h-screen bg-etres-bg flex w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-full w-80 bg-etres-surface border-r border-etres-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-etres-border">
            <EtresLogo size="md" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover-lift group ${
                    active 
                      ? 'bg-gradient-to-r from-etres-primary/20 to-etres-secondary/20 border border-etres-primary/30' 
                      : 'hover:bg-etres-border/50'
                  }`}
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    active ? 'bg-etres-primary text-white' : 'bg-etres-border text-muted-foreground group-hover:text-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <Badge className={`${item.badgeColor} text-white text-xs px-2 py-0.5 h-5`}>
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User section and logout */}
          <div className="p-4 border-t border-etres-border space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-etres-border/30">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                <AvatarFallback className="bg-etres-primary text-white">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Admin</p>
                <p className="text-sm text-muted-foreground">admin@etres.com</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="w-full justify-start gap-2 border-etres-border hover:bg-etres-danger/10 hover:border-etres-danger hover:text-etres-danger"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header */}
        <header className="bg-etres-surface border-b border-etres-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {menuItems.find(item => isActive(item.path))?.title || 'E.tres Agent'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {menuItems.find(item => isActive(item.path))?.subtitle || 'Asistente ejecutivo inteligente'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
