import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<h1>Welcome to Smart Fund Manager (React)</h1>} />
          {/* Routes will be added here as we port pages */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
