import { Routes, Route } from 'react-router-dom'
import { ChatPage } from './pages/ChatPage'
import { ExpertProfilePage } from './pages/ExpertProfilePage'
import { ExpertConsolePage } from './pages/ExpertConsolePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/expert" element={<ExpertProfilePage />} />
      <Route path="/expert-console" element={<ExpertConsolePage />} />
    </Routes>
  )
}

export default App
