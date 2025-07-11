import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Bot, AlertCircle, RotateCcw, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/hooks/useAgent';
import type { Message, ApiResponse } from '@/types/agents';
import { AGENT_SUGGESTIONS } from '@/constants/agents';

const CONVERSATIONS_STORAGE_KEY = 'niawi-agent-conversations';

interface AgentConversations {
  [agentId: string]: Message[];
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { selectedAgent, getAgentEndpoint, currentUser } = useAgent();

  // Función para cargar conversaciones desde localStorage
  const loadConversations = useCallback((): AgentConversations => {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (!stored) return {};
      
      const conversations = JSON.parse(stored);
      
      // Validar y limpiar datos corrupto
      const cleanConversations: AgentConversations = {};
      Object.keys(conversations).forEach(agentId => {
        const messages = conversations[agentId];
        if (Array.isArray(messages)) {
          cleanConversations[agentId] = messages.filter(msg => 
            msg && typeof msg === 'object' && msg.timestamp
          );
        }
      });
      
      return cleanConversations;
    } catch (error) {
      console.error('Error loading conversations, clearing corrupted data:', error);
      localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
      return {};
    }
  }, []);

  // Función para guardar conversaciones en localStorage
  const saveConversations = useCallback((conversations: AgentConversations) => {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }, []);

  // Función para guardar la conversación actual del agente
  const saveCurrentConversation = useCallback((agentId: string, messages: Message[]) => {
    const conversations = loadConversations();
    conversations[agentId] = messages;
    saveConversations(conversations);
  }, [loadConversations, saveConversations]);

  // Función para cargar la conversación de un agente específico
  const loadAgentConversation = useCallback((agentId: string): Message[] => {
    const conversations = loadConversations();
    const messages = conversations[agentId] || [];
    
    // Convertir timestamps de string a Date cuando se cargan desde localStorage
    return messages.map(msg => ({
      ...msg,
      timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
    }));
  }, [loadConversations]);

  // Validación de selectedAgent
  if (!selectedAgent) {
    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex items-center justify-center">
        <Card className="bg-niawi-surface border-niawi-border p-6">
          <p className="text-center text-muted-foreground">Cargando agente...</p>
        </Card>
      </div>
    );
  }

  // Sugerencias dinámicas según el agente seleccionado - optimizado con useCallback
  const getAgentSuggestions = useCallback((agentId: string): readonly string[] => {
    return AGENT_SUGGESTIONS[agentId] || AGENT_SUGGESTIONS.operations;
  }, []);

  // Inicializar conversación cuando cambia el agente
  useEffect(() => {
    if (!selectedAgent) return;
    
    // Cargar conversación existente para este agente
    const existingConversation = loadAgentConversation(selectedAgent.id);
    
    if (existingConversation.length > 0) {
      // Si hay conversación existente, cargarla
      setMessages(existingConversation);
    } else {
      // Si no hay conversación, crear mensaje de bienvenida
      const welcomeMessage: Message = {
        id: Date.now(),
        type: 'assistant',
        content: `¡Hola${currentUser ? `, ${currentUser.name}` : ''}! Soy tu ${selectedAgent.name}. Estoy especializado en ${selectedAgent.description.toLowerCase()}. ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date(),
        agentId: selectedAgent.id
      };
      
      setMessages([welcomeMessage]);
    }
  }, [selectedAgent?.id, currentUser?.name, selectedAgent?.name, selectedAgent?.description, loadAgentConversation]);

  // Guardar conversación automáticamente cuando cambien los mensajes
  useEffect(() => {
    if (selectedAgent && messages.length > 0) {
      saveCurrentConversation(selectedAgent.id, messages);
    }
  }, [messages, selectedAgent?.id, saveCurrentConversation]);

  // Determinar si estamos en una conversación activa
  const isActiveConversation = messages.length > 1;

  // Auto-scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para formatear el contenido del mensaje
  const formatMessageContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      const lines = paragraph.split('\n');
      
      return (
        <div key={index} className={index > 0 ? 'mt-3' : ''}>
          {lines.map((line, lineIndex) => {
            if (!line.trim()) return null;
            
            const isListItem = /^[\s]*[-\*•]/.test(line) || /^[\s]*\d+\./.test(line);
            
            return (
              <div
                key={lineIndex}
                className={`${
                  lineIndex > 0 ? 'mt-1' : ''
                } ${
                  isListItem 
                    ? 'ml-3 text-sm leading-relaxed' 
                    : 'text-sm leading-relaxed'
                }`}
              >
                {line.trim()}
              </div>
            );
          })}
        </div>
      );
    }).filter(Boolean);
  };

  const sendMessageToAPI = async (userMessage: string): Promise<string> => {
    if (!selectedAgent) {
      throw new Error('No hay agente seleccionado');
    }

    try {
      // Usar el endpoint dinámico del agente seleccionado
      const apiUrl = getAgentEndpoint(selectedAgent.id);
      
      if (!apiUrl) {
        throw new Error('Endpoint del agente no configurado');
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje: userMessage,
          agente: selectedAgent.id,
          contexto: selectedAgent.department,
          usuario: currentUser?.id
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Manejar tanto formato de array como objeto directo
      let data: ApiResponse;
      if (Array.isArray(responseData)) {
        // Si es un array, tomar el primer elemento
        data = responseData[0];
      } else {
        // Si es un objeto directo
        data = responseData;
      }
      
      if (data && data.output) {
        return data.output;
      } else {
        console.error('Formato de respuesta recibido:', responseData);
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al comunicarse con el agente:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !selectedAgent) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    const userMessageObj: Message = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    const loadingMessageObj: Message = {
      id: Date.now() + 1,
      type: 'assistant',
      content: `${selectedAgent.name} está analizando tu consulta...`,
      timestamp: new Date(),
      isLoading: true,
      agentId: selectedAgent.id
    };

    setMessages(prev => [...prev, userMessageObj, loadingMessageObj]);

    try {
      const aiResponse = await sendMessageToAPI(userMessage);
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageObj.id 
          ? {
              ...msg,
              content: aiResponse,
              isLoading: false
            }
          : msg
      ));

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al procesar tu mensaje';

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessageObj.id 
          ? {
              ...msg,
              content: `Lo siento, hubo un problema al procesar tu mensaje: ${errorMessage}. Por favor, inténtalo nuevamente.`,
              isLoading: false,
              hasError: true
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      setMessage(suggestion);
    }
  };

  const handleNewConversation = () => {
    if (!selectedAgent) return;
    
    const welcomeMessage: Message = {
      id: Date.now(),
      type: 'assistant',
      content: `¡Hola${currentUser ? `, ${currentUser.name}` : ''}! Soy tu ${selectedAgent.name}. ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
      agentId: selectedAgent.id
    };
    
    setMessages([welcomeMessage]);
    
    // Guardar la nueva conversación (sobrescribir la anterior)
    saveCurrentConversation(selectedAgent.id, [welcomeMessage]);
  };

  const suggestions = selectedAgent ? getAgentSuggestions(selectedAgent.id) : [];

  return (
    <div className="page-container">
      {/* Header con selector de agente */}
      <div className="flex-shrink-0 p-6 pb-0">
        <AgentSelector />
      </div>

      {/* Chat Container */}
      <div className="flex-1 p-6 pt-6 overflow-hidden">
        <Card className="h-full bg-niawi-surface border-niawi-border flex flex-col overflow-hidden">
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-track-niawi-surface scrollbar-thumb-niawi-border">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.type === 'assistant' && selectedAgent && (
                    <Avatar className={`w-8 h-8 ${selectedAgent.bgColor} flex-shrink-0`}>
                      <AvatarFallback className={`${selectedAgent.color} ${selectedAgent.bgColor} border-0`}>
                        {msg.isLoading ? (
                          <Brain className="w-4 h-4 animate-pulse" />
                        ) : (
                          <selectedAgent.icon className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.type === 'user'
                        ? 'bg-niawi-primary text-white ml-auto'
                        : `bg-niawi-border/30 text-foreground ${
                            msg.hasError ? 'border border-niawi-danger/50' : ''
                          }`
                    }`}
                  >
                    {msg.hasError && (
                      <div className="flex items-center gap-2 mb-2 text-niawi-danger">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Error</span>
                      </div>
                    )}
                    
                    <div className="text-sm leading-relaxed">
                      {formatMessageContent(msg.content)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <span>
                        {msg.timestamp instanceof Date 
                          ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      </span>
                      {msg.agentId && selectedAgent && (
                        <>
                          <span>•</span>
                          <span>{selectedAgent.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Botón Nueva Conversación - Solo si hay conversación activa */}
            {isActiveConversation && (
              <div className="px-6 pb-2 flex-shrink-0">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewConversation}
                    className="border-niawi-border hover:bg-niawi-border/50"
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Nueva conversación
                  </Button>
                </div>
              </div>
            )}

            {/* Suggestions - Solo si no hay conversación activa */}
            {!isActiveConversation && selectedAgent && (
              <div className="px-6 pb-4 flex-shrink-0">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-niawi-accent" />
                  <span>Sugerencias para {selectedAgent.department}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left h-auto p-3 border-niawi-border bg-niawi-border/20 hover:bg-niawi-border/40 text-sm justify-start"
                      disabled={isLoading}
                    >
                      <Zap className="w-4 h-4 mr-2 text-niawi-accent flex-shrink-0" />
                      <span className="truncate">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-niawi-border p-4 flex-shrink-0">
              {selectedAgent && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${selectedAgent.bgColor} ${selectedAgent.color} border-0 text-xs`}>
                    {selectedAgent.department}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Conectado a {selectedAgent.name}
                  </span>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedAgent ? `Pregunta a tu ${selectedAgent.name}...` : 'Selecciona un agente primero...'}
                    className="pr-12 bg-niawi-bg border-niawi-border focus:border-niawi-primary"
                    disabled={isLoading || !selectedAgent}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1 w-8 h-8 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!message.trim() || isLoading || !selectedAgent}
                  className="bg-niawi-primary hover:bg-niawi-primary/90 text-white"
                >
                  {isLoading ? (
                    <Brain className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
