import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Grid3x3, List, Filter, Calendar, X, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Brain } from 'lucide-react';

interface Recommendation {
  id: number;
  mensaje: string;
  descripcion: string;
  impacto: string;
  categoria: string;
  estado: string;
  fecha: string;
  prioridad: number;
  estimatedRevenue: string;
}

interface ApiResponse {
  recommendations: Recommendation[];
  stats: {
    total: number;
    nuevas: number;
    aplicadas: number;
    descartadas: number;
    criticas: number;
  };
}

const Recommendations = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_RECOMMENDATIONS_API_URL;
      if (!apiUrl) {
        throw new Error('VITE_RECOMMENDATIONS_API_URL no está configurada');
      }
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const apiData: ApiResponse = await response.json();
      setData(apiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las recomendaciones');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleCardClick = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleCloseExpanded = () => {
    setExpandedCard(null);
  };

  const getPriorityColor = (impacto: string) => {
    switch (impacto.toLowerCase()) {
      case 'alto':
        return 'bg-niawi-danger';
      case 'medio':
        return 'bg-niawi-warning';
      case 'bajo':
        return 'bg-niawi-accent';
      default:
        return 'bg-niawi-warning';
    }
  };

  const getPriorityText = (impacto: string) => {
    switch (impacto.toLowerCase()) {
      case 'alto':
        return 'Alto';
      case 'medio':
        return 'Medio';
      case 'bajo':
        return 'Bajo';
      default:
        return 'Medio';
    }
  };

  const getPriorityIcon = (impacto: string) => {
    switch (impacto.toLowerCase()) {
      case 'alto':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medio':
        return <CheckCircle className="w-5 h-5" />;
      case 'bajo':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'nueva':
        return 'bg-blue-500';
      case 'aplicada':
        return 'bg-green-500';
      case 'descartada':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const metrics = data ? [
    { label: 'Total', value: data.stats.total, color: 'bg-niawi-surface text-foreground' },
    { label: 'Nuevas', value: data.stats.nuevas, color: 'bg-niawi-primary text-white' },
    { label: 'Aplicadas', value: data.stats.aplicadas, color: 'bg-niawi-accent text-white' },
    { label: 'Críticas', value: data.stats.criticas, color: 'bg-niawi-danger text-white' }
  ] : [
    { label: 'Total', value: 0, color: 'bg-niawi-surface text-foreground' },
    { label: 'Nuevas', value: 0, color: 'bg-niawi-primary text-white' },
    { label: 'Aplicadas', value: 0, color: 'bg-niawi-accent text-white' },
    { label: 'Críticas', value: 0, color: 'bg-niawi-danger text-white' }
  ];

  const recommendations = data?.recommendations || [];

  const filteredRecommendations = recommendations.filter(rec =>
    rec.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expandedRecommendation = expandedCard ? recommendations.find(rec => rec.id === expandedCard) : null;

  const openModal = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-niawi-primary" />
            <span className="text-foreground">Cargando recomendaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-niawi-danger mb-4">
            <span className="text-lg">⚠️ Error al cargar recomendaciones</span>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} className="gradient-bg hover:opacity-90 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar nuevamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recomendaciones IA</h1>
            <p className="text-muted-foreground">
              Insights estratégicos y oportunidades detectadas por nuestros agentes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="border-niawi-border hover:bg-niawi-surface">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="border-niawi-border hover:bg-niawi-surface">
              <Calendar className="w-4 h-4 mr-2" />
              Fecha
            </Button>
            <div className="flex border border-niawi-border rounded-lg">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-niawi-surface border-niawi-border hover-lift">
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" className="bg-niawi-primary text-white">
              Todas
              <Badge className="ml-2 bg-niawi-accent text-white">
                {recommendations.length}
              </Badge>
            </Button>
            <Button variant="outline" size="sm" className="border-niawi-border hover:bg-niawi-surface">
              Nuevas
              <Badge className="ml-2 bg-blue-500 text-white">
                {recommendations.filter(r => r.estado.toLowerCase() === 'nueva').length}
              </Badge>
            </Button>
            <Button variant="outline" size="sm" className="border-niawi-border hover:bg-niawi-surface">
              Aplicadas
              <Badge className="ml-2 bg-green-500 text-white">
                {recommendations.filter(r => r.estado.toLowerCase() === 'aplicada').length}
              </Badge>
            </Button>
          </div>
        </div>

        {/* Recommendations Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {filteredRecommendations.map((rec) => (
            <Card 
              key={rec.id} 
              className={`bg-niawi-surface border-niawi-border hover:border-niawi-primary/50 transition-all cursor-pointer ${
                viewMode === 'list' ? 'p-4' : ''
              }`}
              onClick={() => openModal(rec)}
            >
              <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                <div className={`flex ${viewMode === 'list' ? 'items-center' : 'items-start'} justify-between gap-4`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-niawi-primary/10 flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-niawi-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className={`text-foreground ${viewMode === 'list' ? 'text-lg' : 'text-base'} truncate`}>
                        {rec.mensaje}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {rec.categoria} • {rec.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${getPriorityColor(rec.impacto)}`}>
                      {rec.impacto}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(rec.estado)}`}>
                      {rec.estado}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              {viewMode === 'grid' && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 truncate-3">
                    {rec.descripcion}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                                          <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-niawi-accent" />
                      <span className="text-sm text-muted-foreground">{rec.estimatedRevenue}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs px-2 py-1 bg-niawi-border/30 rounded text-muted-foreground">
                        #{rec.prioridad}
                      </span>
                    </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-niawi-primary hover:bg-niawi-primary/10">
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              )}

              {viewMode === 'list' && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate flex-1 pr-4">
                    {rec.descripcion}
                  </p>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground font-medium">{rec.estimatedRevenue}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-niawi-primary hover:bg-niawi-primary/10">
                      Ver detalles
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <Card className="bg-niawi-surface border-niawi-border">
            <CardContent className="p-8 text-center">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay recomendaciones</h3>
              <p className="text-muted-foreground">
                Los agentes están analizando tus datos. Las recomendaciones aparecerán aquí cuando estén listas.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendation Detail Modal */}
      <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
        <DialogContent className="max-w-2xl bg-niawi-surface border-niawi-border">
          {selectedRecommendation && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-niawi-primary/10">
                    <TrendingUp className="w-5 h-5 text-niawi-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl text-foreground">{selectedRecommendation.mensaje}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecommendation.categoria} • {selectedRecommendation.fecha}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedRecommendation.impacto)}>
                    {getPriorityText(selectedRecommendation.impacto)}
                  </Badge>
                  <Badge className={getStatusColor(selectedRecommendation.estado)}>
                    {selectedRecommendation.estado}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Descripción</h4>
                  <p className="text-muted-foreground">{selectedRecommendation.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Impacto Estimado</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-niawi-accent" />
                      <span className="text-lg font-bold text-niawi-accent">{selectedRecommendation.estimatedRevenue}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Prioridad</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-niawi-secondary">#{selectedRecommendation.prioridad}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Análisis Detallado</h4>
                  <div className="bg-niawi-border/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">{selectedRecommendation.descripcion}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                  Cerrar
                </Button>
                <Button className="bg-niawi-primary hover:bg-niawi-primary/90">
                  Aplicar Recomendación
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recommendations;
