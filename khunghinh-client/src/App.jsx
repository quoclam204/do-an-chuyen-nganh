// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Tools from './pages/Tools.jsx'
import Trending from './pages/Trending.jsx'
import Editor from './pages/Editor.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import Compress from './pages/Compress.jsx'
import Resize from './pages/Resize.jsx'           // ✅ thêm trang Resize
import ImageToPdf from './pages/ImageToPdf.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import CreateFrame from './pages/CreateFrame'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/compress" element={<Compress />} />
            <Route path="/resize" element={<Resize />} />
            <Route path="/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/create-frame" element={<CreateFrame />} />
            <Route path="/:alias" element={<Editor />} />   {/* để cuối để không “ăn” /resize */}
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}
