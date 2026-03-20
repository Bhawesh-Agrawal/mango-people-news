import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/home/Hero'
import BreakingBar from './components/home/BreakingBar'
import TopStories from './components/home/TopStories'

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <main>
          <BreakingBar />
          <Hero />
          <TopStories />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App