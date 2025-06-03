import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockList from './components/StockList';
import StockDetail from './components/StockDetail';
import Home from './components/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Stock Market Dashboard</h1>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<StockList />} />
            <Route path="/stock/:id" element={<StockDetail />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Real-time Stock Data Dashboard</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
