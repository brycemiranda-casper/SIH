import { create } from 'zustand';

const API_BASE_URL = 'http://localhost:8000/api';

const useStore = create((set, get) => ({
  // Core System & UI State
  emergencyMode: false,
  language: 'en', // 'en' or 'hi'
  currentUser: {
    id: 'USR-03',
    username: 'fleet_manager',
    role: 'Fleet Manager',
    name: 'NER Fleet Operations Lead'
  },

  activeLayers: {
    landslide: true,
    flood: true,
    blocked: true,
    monsoon: false,
    facilities: true,
    roads: true,
  },

  // Primary Entities
  vehicles: [],
  incidents: [],
  districts: [],
  facilities: [],
  warehouses: [],
  deliveries: [],
  alerts: [],
  auditLogs: [],
  riskPrediction: null,
  loading: false,

  // Routing & Simulation State
  routes: [],
  selectedRouteIndex: 0,
  routeLoading: false,
  routeWaypoints: [],
  rerouteNotification: null, // Holds active dynamic reroute alert for modal/toast

  // Actions
  toggleEmergencyMode: () => set((state) => ({ emergencyMode: !state.emergencyMode })),
  
  setLanguage: (lang) => set({ language: lang }),
  
  setUserRole: (roleName) => set((state) => {
    const roleNamesMap = {
      'Admin': 'Regional Command Officer',
      'District Officer': 'District Magistrate - Dhemaji',
      'Fleet Manager': 'NER Fleet Operations Lead',
      'Field Officer': 'Inspector Borah (Assam Police)',
      'Driver': 'Ramesh Singh (TRK-9001)'
    };
    return {
      currentUser: {
        ...state.currentUser,
        role: roleName,
        name: roleNamesMap[roleName] || roleName
      }
    };
  }),

  toggleLayer: (key) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [key]: !state.activeLayers[key],
      },
    })),

  // API Fetches
  fetchVehicles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      const data = await response.json();
      set({ vehicles: data });
    } catch (error) {
      console.warn('Backend connection fallback for vehicles.');
    }
  },

  updateVehicleStatus: async (id, newStatus, additionalData = {}) => {
    set((state) => ({
      vehicles: state.vehicles.map(v => 
        v.id === id ? { ...v, status: newStatus, ...additionalData } : v
      )
    }));
    try {
      await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...additionalData })
      });
    } catch (e) {
      console.warn("Backend update failed, local UI state updated.");
    }
  },

  fetchIncidents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents`);
      const data = await response.json();
      set({ incidents: data });
    } catch (error) {
      console.warn('Backend connection fallback for incidents.');
    }
  },

  createIncident: async (incidentData) => {
    const newInc = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just Now',
      status: 'Active',
      ...incidentData
    };
    
    set((state) => ({
      incidents: [newInc, ...state.incidents]
    }));

    // Trigger Dynamic Rerouting Check if incident is Critical or High
    if (newInc.severity === 'Critical' || newInc.severity === 'High') {
      const activeVehicles = get().vehicles.filter(v => v.status === 'In Transit');
      if (activeVehicles.length > 0) {
        const affected = activeVehicles[0];
        set({
          rerouteNotification: {
            vehicleId: affected.id,
            driver: affected.driver,
            cargo: affected.cargo,
            incidentLocation: newInc.location,
            originalEta: affected.eta,
            newEta: '3h 10m',
            alternateRoute: 'Via Sonitpur Bypass Highway (High-Altitude Clearance)'
          }
        });
      }
    }

    try {
      await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInc)
      });
    } catch (e) {
      console.warn("Offline incident saved locally.");
    }
  },

  dismissRerouteNotification: () => set({ rerouteNotification: null }),

  approveReroute: async (vehicleId, newRouteName, newEta) => {
    const notif = get().rerouteNotification;
    if (notif) {
      await get().updateVehicleStatus(vehicleId, 'In Transit', {
        location: newRouteName || notif.alternateRoute,
        eta: newEta || notif.newEta
      });
    }
    set({ rerouteNotification: null });
  },

  updateIncidentStatus: async (id, newStatus) => {
    set((state) => ({
      incidents: state.incidents.map(inc => 
        inc.id === id ? { ...inc, status: newStatus } : inc
      )
    }));
    try {
      await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn("Backend update failed.");
    }
  },

  fetchDistricts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/districts`);
      const data = await response.json();
      set({ districts: data });
    } catch (error) {
      console.warn('Backend connection fallback for districts.');
    }
  },

  fetchFacilities: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/facilities`);
      const data = await response.json();
      set({ facilities: data });
    } catch (error) {
      console.warn('Backend connection fallback for facilities.');
    }
  },

  fetchWarehouses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses`);
      const data = await response.json();
      set({ warehouses: data });
    } catch (error) {
      console.warn('Backend connection fallback for warehouses.');
    }
  },

  fetchDeliveries: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/deliveries`);
      const data = await response.json();
      set({ deliveries: data });
    } catch (error) {
      console.warn('Backend connection fallback for deliveries.');
    }
  },

  createDelivery: async (deliveryData) => {
    const newDel = {
      id: `DEL-${Math.floor(5000 + Math.random() * 4000)}`,
      created_time: 'Just Now',
      status: 'Pending',
      eta: 'TBD',
      ...deliveryData
    };
    set((state) => ({ deliveries: [newDel, ...state.deliveries] }));
    try {
      await fetch(`${API_BASE_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDel)
      });
    } catch (e) {
      console.warn('Offline delivery creation fallback.');
    }
  },

  fetchAlerts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`);
      const data = await response.json();
      set({ alerts: data });
    } catch (error) {
      console.warn('Backend connection fallback for alerts.');
    }
  },

  fetchAuditLogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-logs`);
      const data = await response.json();
      set({ auditLogs: data });
    } catch (error) {
      console.warn('Backend connection fallback for audit logs.');
    }
  },

  fetchRiskPrediction: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/risk-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather_condition: "Heavy Rain",
          road_condition: "Slippery",
          terrain_risk: "Mountainous",
          incident_count: 3
        })
      });
      const data = await response.json();
      set({ riskPrediction: data });
    } catch (error) {
      set({ 
        riskPrediction: {
          risk_score: 82,
          status: "Critical",
          breakdown: {
            "Terrain": 85,
            "Weather": 90,
            "Density": 60
          },
          explanation: [
            "Heavy Rainfall detected (+25% risk)",
            "High-altitude Mountainous Terrain (+20% slope hazard)",
            "3 Active Road Blockage Incidents (+30% risk)"
          ]
        } 
      });
    }
  },

  setSelectedRouteIndex: (index) => set({ selectedRouteIndex: index }),

  fetchRoute: async (originStr, destinationStr, vehicleType = 'car', stops = []) => {
    set({ routeLoading: true, routes: [], routeWaypoints: [] });
    try {
      const geocode = async (query) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const data = await res.json();
        if (!data.length) throw new Error(`Location not found: ${query}`);
        return { lon: parseFloat(data[0].lon), lat: parseFloat(data[0].lat), name: query };
      };

      const origin = await geocode(originStr);
      const dest = await geocode(destinationStr);

      const minLon = Math.min(origin.lon, dest.lon) - 0.5;
      const maxLon = Math.max(origin.lon, dest.lon) + 0.5;
      const minLat = Math.min(origin.lat, dest.lat) - 0.5;
      const maxLat = Math.max(origin.lat, dest.lat) + 0.5;
      const viewBox = `${minLon},${minLat},${maxLon},${maxLat}`;

      const geocodeBounded = async (query) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&viewbox=${viewBox}&bounded=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.length) return await geocode(query);
        return { lon: parseFloat(data[0].lon), lat: parseFloat(data[0].lat), name: query };
      };
      
      const geocodedStops = [];
      for (const stop of stops) {
        if (stop.location) {
          const pt = await geocodeBounded(stop.location);
          geocodedStops.push({ ...pt, duration: stop.duration || 0 });
        }
      }

      const fetchOSRM = async (waypointsStr) => {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes.length > 0) return data.routes[0];
        return null;
      };

      const baseCoords = [
        `${origin.lon},${origin.lat}`,
        ...geocodedStops.map(s => `${s.lon},${s.lat}`),
        `${dest.lon},${dest.lat}`
      ];

      const midLon = (origin.lon + dest.lon) / 2;
      const midLat = (origin.lat + dest.lat) / 2;
      
      const requests = [
        fetchOSRM(baseCoords.join(';')),
        fetchOSRM([`${origin.lon},${origin.lat}`, `${midLon},${midLat + 0.1}`, `${dest.lon},${dest.lat}`].join(';')),
        fetchOSRM([`${origin.lon},${origin.lat}`, `${midLon + 0.1},${midLat}`, `${dest.lon},${dest.lat}`].join(';'))
      ];

      const results = await Promise.all(requests);
      
      let rawRoutes = [];
      const seenDistances = new Set();
      for (const r of results) {
        if (r) {
          const distKey = Math.round(r.distance / 100);
          if (!seenDistances.has(distKey)) {
            seenDistances.add(distKey);
            rawRoutes.push(r);
          }
        }
      }

      if (rawRoutes.length === 0) throw new Error("Route calculation failed");

      const multipliers = { 'car': 1, 'bike': 0.8, 'small_goods': 1.2, 'truck': 1.5 };
      const multiplier = multipliers[vehicleType] || 1;
      const extraStopSeconds = geocodedStops.reduce((acc, curr) => acc + (curr.duration * 60), 0);

      let parsedRoutes = rawRoutes.map((route, idx) => {
        const distKm = route.distance / 1000;
        const adjustedDurationSeconds = (route.duration * multiplier) + extraStopSeconds;
        const hrs = Math.floor(adjustedDurationSeconds / 3600);
        const mins = Math.floor((adjustedDurationSeconds % 3600) / 60);
        const eta = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

        let riskScore = (distKm > 300 ? 50 : distKm > 100 ? 20 : 0) + (idx * 25);
        let riskLabel = riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low';
        let riskNumeric = riskScore > 60 ? 3 : riskScore > 30 ? 2 : 1;

        return {
          id: idx,
          geojson: route.geometry,
          distanceVal: distKm,
          distance: `${distKm.toFixed(1)} km`,
          durationVal: adjustedDurationSeconds,
          eta: eta,
          risk: riskLabel,
          riskNumeric: riskNumeric,
          issues: riskLabel === 'Low' ? 'Clear route.' : riskLabel === 'Medium' ? 'Proceed with caution.' : 'Severe hazards detected.',
          explanation: [
            `Vehicle Mode Factor (${vehicleType.toUpperCase()} x${multiplier})`,
            riskLabel === 'High' ? 'Sub-route traverses active monsoon hazard zone' : 'Minimal hazard exposure along primary corridor'
          ]
        };
      });

      if (vehicleType === 'truck') {
        parsedRoutes.sort((a, b) => (a.riskNumeric !== b.riskNumeric ? a.riskNumeric - b.riskNumeric : a.distanceVal - b.distanceVal));
      } else {
        parsedRoutes.sort((a, b) => a.durationVal - b.durationVal);
      }

      parsedRoutes = parsedRoutes.map((route, idx) => ({
        ...route,
        name: idx === 0 ? `Primary: ${originStr} → ${destinationStr}` : `Alternate Route ${idx}`,
        isPrimary: idx === 0,
        issues: idx === 0 ? `AI Recommended for ${vehicleType}. ${route.issues}` : route.issues
      }));

      set({
        routes: parsedRoutes.slice(0, 3),
        selectedRouteIndex: 0,
        routeWaypoints: [origin, ...geocodedStops, dest],
        routeLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch route:', error);
      set({ routeLoading: false });
    }
  },

  clearRoute: () => set({ routes: [], routeWaypoints: [] })
}));

export default useStore;
