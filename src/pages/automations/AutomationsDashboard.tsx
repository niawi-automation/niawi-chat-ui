import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileSpreadsheet, CheckCircle, XCircle, Clock, RefreshCw, CalendarIcon, Activity, Package, Timer, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchExecutions, transformExecutions, calculateStats, filterExecutions, formatDuration } from '@/services/automationService';
import { ExecutionFilters, ExecutionRecord } from '@/types/automations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const AutomationsDashboard: React.FC = () => {
  // Estado de filtros
  const [filters, setFilters] = useState<ExecutionFilters>({
    workflowName: 'all',
    status: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    searchTerm: '',
  });

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Query para obtener datos del webhook
  const { data: rawExecutions, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['webhook-executions'],
    queryFn: fetchExecutions,
    refetchInterval: 60 * 1000, // Auto-refresh cada 60 segundos
    staleTime: 30 * 1000,
    retry: 3,
  });

  // Transformar datos
  const executions = useMemo(
    () => (rawExecutions ? transformExecutions(rawExecutions) : []),
    [rawExecutions]
  );

  // Calcular estadísticas
  const stats = useMemo(() => calculateStats(executions), [executions]);

  // Filtrar ejecuciones
  const filteredExecutions = useMemo(
    () => filterExecutions(executions, filters),
    [executions, filters]
  );

  // Paginación
  const paginatedExecutions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExecutions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredExecutions, currentPage]);

  const totalPages = Math.ceil(filteredExecutions.length / ITEMS_PER_PAGE);

  // Handlers
  const handleRefresh = () => {
    refetch();
    toast.success('Datos actualizados correctamente');
  };

  const handleFilterChange = (key: keyof ExecutionFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Resetear a página 1 al cambiar filtros
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(num);

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es });
  };

  // Estados de carga y error
  if (isLoading && !rawExecutions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-niawi-primary animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Cargando datos de ejecuciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-niawi-surface border-niawi-border">
        <CardContent className="p-8">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-niawi-danger mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'No se pudieron obtener los datos del webhook'}
            </p>
            <Button onClick={handleRefresh} className="bg-niawi-primary hover:bg-niawi-primary/90">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Cards de métricas
  const statCards = [
    {
      icon: FileSpreadsheet,
      colorBox: 'bg-niawi-primary/20',
      colorIcon: 'text-niawi-primary',
      label: 'Total Ejecuciones',
      value: formatNumber(stats.totalExecutions),
    },
    {
      icon: CheckCircle,
      colorBox: 'bg-niawi-accent/20',
      colorIcon: 'text-niawi-accent',
      label: 'Exitosas',
      value: formatNumber(stats.successfulExecutions),
    },
    {
      icon: XCircle,
      colorBox: 'bg-niawi-danger/20',
      colorIcon: 'text-niawi-danger',
      label: 'Fallidas',
      value: formatNumber(stats.failedExecutions),
    },
    {
      icon: Clock,
      colorBox: 'bg-niawi-warning/20',
      colorIcon: 'text-niawi-warning',
      label: 'En Curso',
      value: formatNumber(stats.runningExecutions),
    },
    {
      icon: Timer,
      colorBox: 'bg-niawi-secondary/20',
      colorIcon: 'text-niawi-secondary',
      label: 'Duración Promedio',
      value: formatDuration(stats.averageDuration),
    },
    {
      icon: Activity,
      colorBox: 'bg-niawi-primary/20',
      colorIcon: 'text-niawi-primary',
      label: 'WIP',
      value: formatNumber(stats.wipCount),
    },
    {
      icon: Package,
      colorBox: 'bg-niawi-secondary/20',
      colorIcon: 'text-niawi-secondary',
      label: 'Packing List',
      value: formatNumber(stats.packingListCount),
    },
  ];

  const STATUS_LABELS = {
    success: 'Exitoso',
    error: 'Fallido',
    running: 'En Curso',
  };

  const STATUS_COLORS = {
    success: 'bg-niawi-accent text-white',
    error: 'bg-niawi-danger text-white',
    running: 'bg-niawi-warning text-white',
  };

  const WORKFLOW_COLORS = {
    WIP: 'border-niawi-primary text-niawi-primary',
    PackingList: 'border-niawi-secondary text-niawi-secondary',
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((item, idx) => (
          <Card key={idx} className="bg-niawi-surface border-niawi-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.colorBox} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.colorIcon}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground truncate">{item.value}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card con Filtros y Tabla */}
      <Card className="bg-niawi-surface border-niawi-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-foreground">Historial de Ejecuciones</CardTitle>
              <CardDescription className="text-muted-foreground">
                Registro detallado de todas las ejecuciones de automatizaciones
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
              className="border-niawi-border hover:bg-niawi-surface"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-niawi-bg/50 rounded-lg border border-niawi-border/50">
            {/* Workflow Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Workflow</label>
              <Select
                value={filters.workflowName}
                onValueChange={(value) => handleFilterChange('workflowName', value as 'WIP' | 'PackingList' | 'all')}
              >
                <SelectTrigger className="border-niawi-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="WIP">WIP</SelectItem>
                  <SelectItem value="PackingList">Packing List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value as 'success' | 'error' | 'running' | 'all')}
              >
                <SelectTrigger className="border-niawi-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Exitoso</SelectItem>
                  <SelectItem value="error">Fallido</SelectItem>
                  <SelectItem value="running">En Curso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fecha Desde</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left border-niawi-border hover:bg-niawi-surface"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy') : 'Seleccionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-niawi-surface border-niawi-border">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleFilterChange('dateFrom', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Fecha Hasta</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left border-niawi-border hover:bg-niawi-surface"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy') : 'Seleccionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-niawi-surface border-niawi-border">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleFilterChange('dateTo', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Buscar por ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="border-niawi-border pl-9"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          {filteredExecutions.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">No se encontraron ejecuciones</p>
              <p className="text-sm text-muted-foreground mt-2">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="border border-niawi-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-niawi-bg/50">
                      <TableHead className="text-foreground">ID</TableHead>
                      <TableHead className="text-foreground">Workflow</TableHead>
                      <TableHead className="text-foreground">Estado</TableHead>
                      <TableHead className="text-foreground">Fecha Inicio</TableHead>
                      <TableHead className="text-foreground">Fecha Fin</TableHead>
                      <TableHead className="text-foreground">Duración</TableHead>
                      <TableHead className="text-foreground">Modo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExecutions.map((exec: ExecutionRecord) => (
                      <TableRow key={exec.id} className="hover:bg-niawi-bg/30">
                        <TableCell className="font-mono text-sm text-foreground">{exec.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={WORKFLOW_COLORS[exec.workflowName]}>
                            {exec.workflowName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[exec.status]}>
                            {STATUS_LABELS[exec.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(exec.startedAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {exec.stoppedAt ? formatDate(exec.stoppedAt) : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {formatDuration(exec.duration)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{exec.mode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredExecutions.length)} de {filteredExecutions.length} ejecuciones
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-niawi-border"
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? 'bg-niawi-primary' : 'border-niawi-border'}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-niawi-border"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationsDashboard;
