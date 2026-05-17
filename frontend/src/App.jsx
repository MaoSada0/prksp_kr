import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Landing from './pages/Landing'
import PsychologistList from './pages/psychologists/PsychologistList'
import PsychologistProfile from './pages/psychologists/PsychologistProfile'
import ChatList from './pages/chats/ChatList'
import ChatRoom from './pages/chats/ChatRoom'
import SessionList from './pages/sessions/SessionList'
import SessionDetail from './pages/sessions/SessionDetail'
import Profile from './pages/profile/Profile'
import ClientProfile from './pages/profile/ClientProfile'
import Services from './pages/profile/Services'
import Schedule from './pages/profile/Schedule'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Landing />
  return user.role === 'PSYCHOLOGIST'
    ? <Navigate to="/sessions" replace />
    : <Navigate to="/psychologists" replace />
}

function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return user.role === 'PSYCHOLOGIST' ? <Profile /> : <ClientProfile />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/psychologists" element={<PsychologistList />} />
        <Route path="/psychologists/:id" element={<PsychologistProfile />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chats/:id" element={<ChatRoom />} />
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/schedule" element={<Schedule />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
