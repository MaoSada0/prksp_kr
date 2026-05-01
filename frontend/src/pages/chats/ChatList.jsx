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

  useEffect(() => {
    getChats()
      .then(setChats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="py-20" />

  const getInterlocutor = (chat) => {
    if (user?.role === 'CLIENT') {
      return { name: chat.psychologistName, id: chat.psychologistId }
    }
    return { name: chat.clientName, id: chat.clientId }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Чаты</h1>

      {chats.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Нет активных чатов</p>
          {user?.role === 'CLIENT' && (
            <p className="text-sm">
              Перейдите в{' '}
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => navigate('/psychologists')}
              >
                каталог психологов
              </button>{' '}
              и начните диалог
            </p>
          )}
        </div>
      ) : (
        <div className="card p-0 divide-y divide-gray-100">
          {chats.map((chat) => {
            const interlocutor = getInterlocutor(chat)
            return (
              <div
                key={chat.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/chats/${chat.id}`)}
              >
                <Avatar name={interlocutor.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{interlocutor.name}</span>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {chat.lastMessage.senderName.split(' ')[0]}: {chat.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">Нет сообщений</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
