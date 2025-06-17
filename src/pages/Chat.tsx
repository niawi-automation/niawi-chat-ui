import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Bot, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  hasError?: boolean;
}

interface ApiResponse {
  output: string;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Buen día. ¿Qué objetivos atacamos primero?, admin! 👋',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "¿Dónde se pierde más tiempo operativo?",
    "¿Hay desviaciones críticas en curso?",
    "¿Qué contribución hicieron los artículos estrella?",
    "¿Cómo evoluciona el funnel de conversión?",
    "¿Revisamos juntos la agenda ejecutiva?"
  ];

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
    // Dividir por saltos de línea dobles para párrafos
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      // Dividir cada párrafo por saltos de línea simples
      const lines = paragraph.split('\n');
      
      return (
        <div key={index} className={index > 0 ? 'mt-3' : ''}>
          {lines.map((line, lineIndex) => {
            if (!line.trim()) return null;
            
            // Detectar si es una línea de lista (empieza con -, *, •, o número)
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
    try {
      const apiUrl = import.meta.env.VITE_CHAT_API_URL;
      if (!apiUrl) {
        throw new Error('VITE_CHAT_API_URL no está configurada');
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje: userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse[] = await response.json();
      
      if (data && data.length > 0 && data[0].output) {
        return data[0].output;
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error al comunicarse con el asistente:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Agregar mensaje del usuario
    const userMessageObj: Message = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    // Agregar mensaje de carga del asistente
    const loadingMessageObj: Message = {
      id: Date.now() + 1,
      type: 'assistant',
      content: 'Analizando tu consulta...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessageObj, loadingMessageObj]);

    try {
      // Enviar mensaje a la API y obtener respuesta
      const aiResponse = await sendMessageToAPI(userMessage);

      // Reemplazar el mensaje de carga con la respuesta real
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
      // Mostrar mensaje de error
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
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'Buen día. ¿Qué objetivos atacamos primero?, admin! 👋',
        timestamp: new Date()
      }
    ]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header con botón de nueva conversación cuando hay conversación activa */}
      {isActiveConversation && (
        <div className="flex items-center justify-between mb-4 p-4 bg-niawi-surface border border-niawi-border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-niawi-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-niawi-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Conversación activa</h3>
              <p className="text-xs text-muted-foreground">
                {messages.length - 1} mensaje{messages.length - 1 !== 1 ? 's' : ''} intercambiado{messages.length - 1 !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="border-niawi-border hover:bg-niawi-border/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Nueva conversación
          </Button>
        </div>
      )}

      {/* Chat messages */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${isActiveConversation ? 'mb-4' : 'mb-6'}`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-4 rounded-2xl ${
                msg.type === 'user'
                  ? 'bg-niawi-primary text-white'
                  : msg.hasError
                  ? 'bg-red-500/10 border border-red-500/20 text-foreground'
                  : 'bg-niawi-surface border border-niawi-border text-foreground'
              }`}
            >
              {msg.type === 'assistant' && (
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4" />
                  <Badge className={`${msg.hasError ? 'bg-red-500' : 'bg-niawi-primary'} text-white`}>
                    {msg.hasError ? 'ERROR' : 'AI'}
                  </Badge>
                  {msg.hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
              )}
              
              <div className="flex items-start gap-2">
                {msg.isLoading && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-niawi-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-niawi-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-niawi-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
                <div className="flex-1">
                  {msg.isLoading ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">
                      {formatMessageContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs opacity-70 mt-3 pt-2 border-t border-current/10">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions - Solo mostrar si NO hay conversación activa */}
      {!isActiveConversation && (
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-niawi-primary text-white">AI</Badge>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Visualiza rápido tus oportunidades
            </h2>
            <p className="text-muted-foreground text-sm">
              Copiloto Niawi al servicio de tu gestión ejecutiva
            </p>
          </div>
          
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Sugerencias para comenzar:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className={`bg-niawi-surface border-niawi-border hover:border-niawi-primary cursor-pointer transition-all duration-200 hover-lift ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <CardContent className="p-4">
                  <p className="text-sm text-foreground">{suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="space-y-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isLoading ? "Procesando mensaje..." : "Escribe un mensaje..."}
              disabled={isLoading}
              className={`bg-niawi-surface border-niawi-border text-foreground placeholder:text-muted-foreground pr-12 h-12 ${
                isLoading ? 'opacity-50' : ''
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            type="submit" 
            className="gradient-bg hover:opacity-90 text-white h-12 px-6"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Connection status indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-niawi-accent'}`}></div>
            <span>
              {isLoading ? 'Conectando con Copiloto Niawi...' : 'Copiloto Niawi listo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
