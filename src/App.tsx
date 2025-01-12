import React, { useState } from 'react';
import { Message } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { MessageSquare } from 'lucide-react';

// Replace this with your n8n webhook URL
const WEBHOOK_URL = 'https://clickflow.efficore.es/webhook/miweb';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async (text: string, file?: File) => {
    try {
      const formData = new FormData();
      
      if (text) {
        formData.append('message', text);
      }
      
      if (file) {
        formData.append('file', file);
      }

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: file ? URL.createObjectURL(file) : text,
        contentType: file ? (file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file') : 'text',
        fileName: file?.name,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Send to n8n webhook with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data;
        const contentType = response.headers.get('content-type');
        
        try {
          const text = await response.text(); // Primero obtenemos el texto
          try {
            data = JSON.parse(text); // Intentamos parsearlo como JSON
          } catch (parseError) {
            // Si falla el parse, creamos un objeto con el texto como contenido
            data = {
              type: 'text',
              content: text
            };
          }
        } catch (error) {
          throw new Error('Error reading response');
        }

        // Validar la estructura de la respuesta
        if (!data.type || !data.content) {
          throw new Error('Invalid response format');
        }

        // Add bot response
        const botMessage: Message = {
          id: Date.now().toString(),
          type: 'bot',
          content: data.content,
          contentType: data.type,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('La solicitud tardó demasiado. Por favor, intenta de nuevo.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Error: ${error.message || 'Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'}`,
        contentType: 'text',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold">Chat Assistant</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              Send a message to start the conversation
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;