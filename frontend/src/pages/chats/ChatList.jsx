import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChats } from '../../api/chats'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/Spinner'
import Avatar from '../../components/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ChatList() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { getChats().then(setChats).finally(() => setLoading(false)) }, [])

  if (loading) return <Spinner className="py-20" />

  const getName = c => user?.role === 'CLIENT' ? c.psychologistName : c.clientName

  return (
    <div>
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Чаты</h1>

      {chats.length === 0 ? (
        <div className="card text-center py-16">
          <p className="mb-2" style={{ color: 'var(--text-faint)' }}>Нет активных чатов</p>
          {user?.role === 'CLIENT' && (
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
              Перейдите в{' '}
              <button className="font-semibold" style={{ color: 'var(--blue)' }} onClick={() => navigate('/psychologists')}>
                каталог психологов
              </button>{' '}
              и начните диалог
            </p>
          )}
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          {chats.map((chat, idx) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-4 cursor-pointer transition-colors duration-100"
              style={{ borderBottom: idx < chats.length - 1 ? '1px solid var(--border-light)' : 'none' }}
              onClick={() => navigate(`/chats/${chat.id}`)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--blue-light)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Avatar name={getName(chat)} size="md" src={user?.role === 'CLIENT' ? chat.psychologistPhotoUrl : chat.clientPhotoUrl} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{getName(chat)}</span>
                  {chat.lastMessage && (
                    <span className="text-xs ml-2 shrink-0" style={{ color: 'var(--text-faint)' }}>
                      {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true, locale: ru })}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {chat.lastMessage
                    ? `${chat.lastMessage.senderName.split(' ')[0]}: ${chat.lastMessage.content}`
                    : 'Нет сообщений'}
                </p>
              </div>
              <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
