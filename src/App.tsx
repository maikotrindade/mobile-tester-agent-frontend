import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../src/Home';
import Settings from './Settings';
import TopNav from './TopNav';

function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
