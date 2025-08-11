import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../src/Home'; // We will create this component next

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
