import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  primaryColor?: string
}

export function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Generate unique session ID for this visitor
  useEffect(() => {
    const stored = localStorage.getItem('vocalscale_chat_session')
    if (stored) {
      setSessionId(stored)
    } else {
      const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('vocalscale_chat_session', newId)
      setSessionId(newId)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Connect to WebSocket when chat opens
  useEffect(() => {
    if (!isOpen || !sessionId) return

    // Connect to OpenClaw-compatible WebSocket endpoint
    const wsUrl = `ws://localhost:8080/ws/chat?session=${sessionId}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('Chat connected')
      // Send initial greeting if first message
      if (messages.length === 0) {
        ws.send(JSON.stringify({
          type: 'join',
          sessionId,
          source: 'website_widget'
        }))
      }
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'message') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.text,
          sender: data.sender,
          timestamp: new Date()
        }])
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      // Fallback to HTTP polling if WebSocket fails
      setMessages(prev => [...prev, {
        id: 'system_' + Date.now(),
        text: 'Connected to VocalScale Support. An agent will respond shortly.',
        sender: 'agent',
        timestamp: new Date()
      }])
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [isOpen, sessionId, messages.length])

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    // Send via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        text: inputText,
        sessionId,
        sender: 'user'
      }))
      setIsLoading(false)
    } else {
      // Fallback to HTTP API
      try {
        const response = await fetch('http://localhost:8080/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: inputText,
            sessionId,
            source: 'website_widget'
          })
        })

        if (!response.ok) throw new Error('Failed to send')

        const data = await response.json()
        
        // If auto-response available
        if (data.response) {
          setMessages(prev => [...prev, {
            id: 'agent_' + Date.now(),
            text: data.response,
            sender: 'agent',
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn(
      'fixed z-50 flex flex-col',
      position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'
    )}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold">VocalScale Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">How can we help you today?</p>
                <p className="text-xs mt-2">Ask us about AI voice agents, pricing, or support.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] p-3 rounded-2xl text-sm',
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-bl-md'
                  )}
                >
                  {msg.text}
                  <div
                    className={cn(
                      'text-[10px] mt-1',
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[100px]"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110',
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  )
}

export default ChatWidget
