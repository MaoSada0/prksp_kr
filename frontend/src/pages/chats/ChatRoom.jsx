import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'
import { getMessages, sendMessage } from '../../api/chats'
import { getChats } from '../../api/chats'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ChatRoom() {
  const { id: chatId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [chat, setChat] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const stompRef = useRef(null)

  const interlocutorName = chat
    ? user?.role === 'CLIENT'
      ? chat.psychologistName
      : chat.clientName
    : ''

  useEffect(() => {
    Promise.all([getChats(), getMessages(chatId)])
      .then(([chats, msgs]) => {
        const found = chats.find((c) => c.id === chatId)
        setChat(found || null)
        setMessages(msgs)
      })
      .catch(() => toast.error('Ошибка загрузки чата'))
      .finally(() => setLoading(false))
  }, [chatId])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat.${chatId}`, (frame) => {
          const msg = JSON.parse(frame.body)
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        })
      },
    })
    client.activate()
    stompRef.current = client
    return () => client.deactivate()
  }, [chatId])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)
    try {
      await sendMessage(chatId, { content, type: 'TEXT' })
    } catch {
      toast.error('Ошибка отправки')
      setText(content)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Spinner className="py-20" />

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="card mb-4 flex items-center gap-3 py-3">
        <button
          onClick={() => navigate('/chats')}
          className="text-gray-400 hover:text-gray-600 mr-1"
        >
          ←
        </button>
        <Avatar name={interlocutorName} size="md" />
        <div>
          <p className="font-semibold text-gray-900">{interlocutorName}</p>
          <p className="text-xs text-gray-400">
            {user?.role === 'CLIENT' ? 'Психолог' : 'Клиент'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            Напишите первое сообщение
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMine && (
                  <span className="text-xs text-gray-400 ml-1">{msg.senderName}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.type === 'LINK' ? (
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`underline break-all ${isMine ? 'text-indigo-200' : 'text-indigo-600'}`}
                    >
                      {msg.content}
                    </a>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-xs text-gray-400 px-1">
                  {format(new Date(msg.createdAt), 'HH:mm', { locale: ru })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="card mt-3 flex gap-2 py-3">
        <input
          type="text"
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение..."
          autoFocus
        />
        <button
          type="submit"
          className="btn-primary px-5"
          disabled={!text.trim() || sending}
        >
          {sending ? '...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}
