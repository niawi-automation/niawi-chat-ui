
import React, { useState } from 'react';
import { Search, RefreshCw, Grid3x3, List, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Recommendations = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const metrics = [
    { label: 'Total', value: 7, color: 'bg-etres-surface text-foreground' },
    { label: 'Nuevas', value: 7, color: 'bg-etres-primary text-white' },
    { label: 'Aplicadas', value: 0, color: 'bg-etres-accent text-white' },
    { label: 'Críticas', value: 3, color: 'bg-etres-danger text-white' }
  ];

  const recommendations = [
    {
      id: 1,
      category: 'Pricing',
      priority: 'Alto',
      priorityColor: 'bg-etres-danger',
      title: 'Detectado gap de precio con Style Store en Fénix 7X Solar',
      date: '29 de mayo, 2025',
      impact: '$3.200.000',
      description: 'Análisis competitivo indica oportunidad de ajuste de precios'
    },
    {
      id: 2,
      category: 'Clientes',
      priority: 'Medio',
      priorityColor: 'bg-etres-warning',
      title: 'Segmentar a compradores de Forerunner con contenido post-compra',
      date: '29 de mayo, 2025',
      impact: '$1.850.000',
      description: 'Estrategia de retención y upselling identificada'
    },
    {
      id: 3,
      category: 'Inventario',
      priority: 'Medio',
      priorityColor: 'bg-etres-warning',
      title: 'Productos con alto stock y baja rotación: Fénix 6 Pro Solar',
      date: '29 de mayo, 2025',
      impact: '$2.100.000',
      description: 'Optimización de inventario recomendada'
    },
    {
      id: 4,
      category: 'SEO',
      priority: 'Alto',
      priorityColor: 'bg-etres-danger',
      title: 'Búsquedas SEO con alto CTR en Instinct 2 pero baja conversión',
      date: '29 de mayo, 2025',
      impact: '$1.900.000',
      description: 'Oportunidad de optimización de landing pages'
    },
    {
      id: 5,
      category: 'Conversión',
      priority: 'Alto',
      priorityColor: 'bg-etres-danger',
      title: 'Fuerte rebote en campañas Meta Ads de Venu SQ Music',
      date: '29 de mayo, 2025',
      impact: '$2.400.000',
      description: 'Revisión de estrategia publicitaria necesaria'
    },
    {
      id: 6,
      category: 'Competencia',
      priority: 'Medio',
      priorityColor: 'bg-etres-warning',
      title: 'Baja competitividad de precios en Mercado Libre en línea Forerunner',
      date: '29 de mayo, 2025',
      impact: '$1.600.000',
      description: 'Oportunidad de posicionamiento en marketplace'
    }
  ];

  const filteredRecommendations = recommendations.filter(rec =>
    rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar recomendaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-etres-surface border-etres-border text-foreground"
            />
          </div>
          <Button variant="outline" size="sm" className="border-etres-border hover:bg-etres-surface">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-etres-border hover:bg-etres-surface">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="border-etres-border hover:bg-etres-surface">
            <Calendar className="w-4 h-4 mr-2" />
            Fecha
          </Button>
          <div className="flex border border-etres-border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-etres-surface border-etres-border hover-lift">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${metric.color} mb-2`}>
                <span className="text-xl font-bold">{metric.value}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-etres-surface border border-etres-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-etres-primary data-[state=active]:text-white">
            Todas (7)
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-etres-primary data-[state=active]:text-white">
            Nuevas (7)
          </TabsTrigger>
          <TabsTrigger value="applied" className="data-[state=active]:bg-etres-primary data-[state=active]:text-white">
            Aplicadas (0)
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="data-[state=active]:bg-etres-primary data-[state=active]:text-white">
            Descartadas (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredRecommendations.map((rec) => (
              <Card key={rec.id} className="bg-etres-surface border-etres-border hover-lift cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-etres-border text-foreground">
                        {rec.category}
                      </Badge>
                      <Badge className={`${rec.priorityColor} text-white`}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight text-foreground">
                    {rec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{rec.date}</span>
                    <span className="font-semibold text-etres-accent">{rec.impact}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Mostrando recomendaciones nuevas...</p>
          </div>
        </TabsContent>

        <TabsContent value="applied">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay recomendaciones aplicadas aún.</p>
          </div>
        </TabsContent>

        <TabsContent value="dismissed">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay recomendaciones descartadas.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recommendations;
