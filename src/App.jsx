import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import Vehicles from './pages/Vehicles';
import Incidents from './pages/Incidents';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/route-planner" element={<RoutePlanner />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
