import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import toast from 'react-hot-toast'
import { getMessages, sendMessage, getChats } from '../../api/chats'
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

  const partnerName = chat
    ? user?.role === 'CLIENT' ? chat.psychologistName : chat.clientName
    : ''
  const partnerPhoto = chat
    ? user?.role === 'CLIENT' ? chat.psychologistPhotoUrl : chat.clientPhotoUrl
    : null

  useEffect(() => {
    Promise.all([getChats(), getMessages(chatId)])
      .then(([chats, msgs]) => { setChat(chats.find(c => c.id === chatId) || null); setMessages(msgs) })
      .catch(() => toast.error('Ошибка загрузки чата'))
      .finally(() => setLoading(false))
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chat.${chatId}`, frame => {
          const msg = JSON.parse(frame.body)
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
        })
      },
    })
    client.activate()
    return () => client.deactivate()
  }, [chatId])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)
    try { await sendMessage(chatId, { content, type: 'TEXT' }) }
    catch { toast.error('Ошибка отправки'); setText(content) }
    finally { setSending(false) }
  }

  if (loading) return <Spinner className="py-20" />

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="card !py-3 !px-4 mb-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/chats')}
          className="text-xs px-2.5 py-1.5 rounded-md mr-1 transition-colors duration-100"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--blue-light)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ←
        </button>
        <Avatar name={partnerName} size="md" src={partnerPhoto} />
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{partnerName}</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {user?.role === 'CLIENT' ? 'Психолог' : 'Клиент'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 px-1 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-faint)' }}>
            Напишите первое сообщение
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === user?.userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && (
                  <span className="text-xs ml-1" style={{ color: 'var(--text-faint)' }}>{msg.senderName}</span>
                )}
                <div
                  className="px-3.5 py-2 text-sm"
                  style={{
                    borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    backgroundColor: isMine ? 'var(--blue)' : 'var(--surface)',
                    color: isMine ? '#fff' : 'var(--text)',
                    border: isMine ? 'none' : '1px solid var(--border-light)',
                  }}
                >
                  {msg.type === 'LINK' ? (
                    <a href={msg.content} target="_blank" rel="noopener noreferrer"
                      className="underline break-all"
                      style={{ color: isMine ? 'rgba(255,255,255,0.85)' : 'var(--blue)' }}>
                      {msg.content}
                    </a>
                  ) : msg.content}
                </div>
                <span className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
                  {format(new Date(msg.createdAt), 'HH:mm', { locale: ru })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="card !py-2.5 mt-2 flex gap-2">
        <input
          type="text"
          className="input flex-1"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
          placeholder="Напишите сообщение..."
          autoFocus
        />
        <button type="submit" className="btn-primary px-5" disabled={!text.trim() || sending}>
          {sending ? '...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}
