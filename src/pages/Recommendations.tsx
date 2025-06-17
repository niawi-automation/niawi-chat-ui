import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Grid3x3, List, Filter, Calendar, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://automation.wtsusa.us/webhook/2a2f2d36-9a66-4ca0-9f80-a8db6fea206b');
      
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

  const RecommendationCard = ({ rec, isExpanded = false }: { rec: Recommendation; isExpanded?: boolean }) => (
    <Card 
      key={rec.id} 
      className={`bg-niawi-surface border-niawi-border hover-lift cursor-pointer transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-niawi-primary' : ''
      }`}
      onClick={() => handleCardClick(rec.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-niawi-border text-foreground">
              {rec.categoria}
            </Badge>
            <Badge className={`${getPriorityColor(rec.impacto)} text-white`}>
              {getPriorityText(rec.impacto)}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight text-foreground">
          {rec.mensaje}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{rec.descripcion}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{rec.fecha}</span>
          <span className="font-semibold text-niawi-accent">{rec.estimatedRevenue}</span>
        </div>
      </CardContent>
    </Card>
  );

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
              className="pl-10 bg-niawi-surface border-niawi-border text-foreground"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-niawi-border hover:bg-niawi-surface"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        
        <div className="flex gap-2">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-niawi-surface border border-niawi-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-niawi-primary data-[state=active]:text-white">
            Todas ({data?.stats.total || 0})
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-niawi-primary data-[state=active]:text-white">
            Nuevas ({data?.stats.nuevas || 0})
          </TabsTrigger>
          <TabsTrigger value="applied" className="data-[state=active]:bg-niawi-primary data-[state=active]:text-white">
            Aplicadas ({data?.stats.aplicadas || 0})
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="data-[state=active]:bg-niawi-primary data-[state=active]:text-white">
            Descartadas ({data?.stats.descartadas || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No se encontraron recomendaciones que coincidan con tu búsqueda' : 'No hay recomendaciones disponibles'}
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredRecommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} isExpanded={expandedCard === rec.id} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          {filteredRecommendations.filter(rec => rec.estado.toLowerCase() === 'nueva').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay recomendaciones nuevas.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredRecommendations
                .filter(rec => rec.estado.toLowerCase() === 'nueva')
                .map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} isExpanded={expandedCard === rec.id} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied">
          {filteredRecommendations.filter(rec => rec.estado.toLowerCase() === 'aplicada').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay recomendaciones aplicadas aún.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredRecommendations
                .filter(rec => rec.estado.toLowerCase() === 'aplicada')
                .map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} isExpanded={expandedCard === rec.id} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dismissed">
          {filteredRecommendations.filter(rec => rec.estado.toLowerCase() === 'descartada').length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay recomendaciones descartadas.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredRecommendations
                .filter(rec => rec.estado.toLowerCase() === 'descartada')
                .map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} isExpanded={expandedCard === rec.id} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Expanded Card Modal/Overlay */}
      {expandedCard && expandedRecommendation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-niawi-surface border border-niawi-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-niawi-border">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="bg-niawi-border text-foreground">
                    {expandedRecommendation.categoria}
                  </Badge>
                  <Badge className={`${getPriorityColor(expandedRecommendation.impacto)} text-white flex items-center gap-1`}>
                    {getPriorityIcon(expandedRecommendation.impacto)}
                    {getPriorityText(expandedRecommendation.impacto)}
                  </Badge>
                  <Badge className={`${getStatusColor(expandedRecommendation.estado)} text-white`}>
                    {expandedRecommendation.estado}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-foreground leading-tight">
                  {expandedRecommendation.mensaje}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseExpanded}
                className="ml-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción detallada</h3>
                  <p className="text-foreground leading-relaxed">{expandedRecommendation.descripcion}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-niawi-border/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-niawi-accent mb-1">
                      {expandedRecommendation.estimatedRevenue}
                    </div>
                    <div className="text-sm text-muted-foreground">Impacto estimado</div>
                  </div>
                  <div className="bg-niawi-border/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      #{expandedRecommendation.prioridad}
                    </div>
                    <div className="text-sm text-muted-foreground">Prioridad</div>
                  </div>
                  <div className="bg-niawi-border/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {expandedRecommendation.fecha}
                    </div>
                    <div className="text-sm text-muted-foreground">Fecha de creación</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button className="gradient-bg hover:opacity-90 text-white flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como aplicada
                  </Button>
                  <Button variant="outline" className="border-niawi-border hover:bg-niawi-surface flex-1">
                    <XCircle className="w-4 h-4 mr-2" />
                    Descartar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
