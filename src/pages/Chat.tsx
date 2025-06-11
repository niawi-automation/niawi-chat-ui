
import React, { useState } from 'react';
import { Send, Paperclip, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Buen día. ¿Qué objetivos atacamos primero?, admin! 👋',
      timestamp: new Date()
    }
  ]);

  const suggestions = [
    "¿Dónde se pierde más tiempo operativo?",
    "¿Hay desviaciones críticas en curso?",
    "¿Qué contribución hicieron los artículos estrella?",
    "¿Cómo evoluciona el funnel de conversión?",
    "¿Revisamos juntos la agenda ejecutiva?"
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'Analizando tu consulta... Te ayudo a encontrar esos insights estratégicos que necesitas para optimizar la operación.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Welcome header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <Badge className="bg-etres-primary text-white">AI</Badge>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Visualiza rápido tus oportunidades
        </h2>
        <p className="text-muted-foreground">
          E3Agent al servicio de tu gestión ejecutiva
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 mb-6 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              msg.type === 'user' 
                ? 'bg-etres-primary text-white' 
                : 'bg-etres-surface border border-etres-border text-foreground'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Sugerencias rápidas:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Card 
              key={index} 
              className="bg-etres-surface border-etres-border hover:border-etres-primary cursor-pointer transition-all duration-200 hover-lift"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <CardContent className="p-4">
                <p className="text-sm text-foreground">{suggestion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="bg-etres-surface border-etres-border text-foreground placeholder:text-muted-foreground pr-12 h-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          type="submit" 
          className="gradient-bg hover:opacity-90 text-white h-12 px-6"
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
