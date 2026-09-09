import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Districts from './pages/Districts';
import RoutePlanner from './pages/RoutePlanner';
import Vehicles from './pages/Vehicles';
import Deliveries from './pages/Deliveries';
import Warehouses from './pages/Warehouses';
import Facilities from './pages/Facilities';
import Incidents from './pages/Incidents';
import FieldReport from './pages/FieldReport';
import Simulator from './pages/Simulator';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/districts" element={<Districts />} />
          <Route path="/route-planner" element={<RoutePlanner />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/field-report" element={<FieldReport />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
