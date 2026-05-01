import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PsychologistList from './pages/psychologists/PsychologistList'
import PsychologistProfile from './pages/psychologists/PsychologistProfile'
import ChatList from './pages/chats/ChatList'
import ChatRoom from './pages/chats/ChatRoom'
import SessionList from './pages/sessions/SessionList'
import SessionDetail from './pages/sessions/SessionDetail'
import Profile from './pages/profile/Profile'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'PSYCHOLOGIST'
    ? <Navigate to="/sessions" replace />
    : <Navigate to="/psychologists" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/psychologists" element={<PsychologistList />} />
        <Route path="/psychologists/:id" element={<PsychologistProfile />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chats/:id" element={<ChatRoom />} />
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
