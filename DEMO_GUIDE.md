# NEXUS-NER — HACKATHON 3-5 MINUTE DEMO WALKTHROUGH SCRIPT

This guide provides the exact step-by-step demonstration script for hackathon judges to showcase all 17 core requirements of MDoNER Smart Logistics & Accessibility Intelligence.

---

## 🎬 Demo Overview (30 Seconds)
**Opening Statement**:
> "Good morning judges! The North Eastern Region of India faces extreme logistics bottlenecks due to landslides, heavy rainfall, and floods. **NEXUS-NER** is an AI-powered regional command platform combining real-time GIS mapping, IMD/NDMA disaster feeds, district accessibility scoring, explainable AI risk prediction, dynamic vehicle rerouting, and essential commodity order tracking."

---

## 📍 Step-by-Step Hackathon Demo Script

### 1. Command Center Dashboard & Emergency Mode (1 Minute)
1. Open [http://localhost:5173/](http://localhost:5173/) in your browser.
2. Highlight the **NER Accessibility Score** (`78 / 100`) and the interactive **OpenLayers GIS Map** showing state boundaries, NDMA alert markers, flood inundation paths, and IMD rainfall warnings.
3. Click the **ACTIVATE EMERGENCY MODE** button in the top navigation bar:
   - Observe the interface transform into a high-contrast emergency theme with real-time incident counters.

### 2. District Accessibility Intelligence (45 Seconds)
1. Click **District Intelligence** ([http://localhost:5173/districts](http://localhost:5173/districts)) in the left sidebar.
2. Show district accessibility scores across all 8 NER states (Assam, Arunachal Pradesh, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Sikkim).
3. Filter by state (e.g. `Arunachal Pradesh`) to demonstrate critical scores for high-altitude districts like `Tawang (35 / 100 - CRITICAL)`.

### 3. AI Route Planner & Explainable Risk Rationale (1 Minute)
1. Click **AI Route Planner** ([http://localhost:5173/route-planner](http://localhost:5173/route-planner)).
2. Assign Fleet Vehicle: Select `TRK-9001 - Ramesh Singh`.
3. Input Origin: `Guwahati` and Destination: `Tezpur`.
4. Click **Calculate AI Safe Routes**:
   - Highlight the side-by-side alternate routes with risk classifications.
   - Point out the **AI Explanation Rationale** detailing *why* a route was scored (`Heavy Rainfall +25%`, `Mountainous Terrain +20%`).
5. Click **Dispatch Selected Vehicle** to trigger real-time dispatching.

### 4. Dynamic Rerouting & Essential Logistics (45 Seconds)
1. Click **Field Officer App** ([http://localhost:5173/field-report](http://localhost:5173/field-report)).
2. Submit a new critical incident report on `NH-13 West Kameng`.
3. Notice the top navigation bar immediately trigger a **🚨 Dynamic Reroute Alert Drawer** for active vehicle `TRK-9001`.
4. Click **Approve Reroute** to dynamically update the truck's navigation path and ETA.
5. Click **Essential Logistics** ([http://localhost:5173/deliveries](http://localhost:5173/deliveries)) to verify critical medical supplies and food rations.

### 5. What-If Simulator & Supply Hubs (30 Seconds)
1. Click **What-If Simulator** ([http://localhost:5173/simulator](http://localhost:5173/simulator)).
2. Select `NH-13 West Kameng` and click **Run What-If Disaster Simulation**:
   - Show predicted travel delay (+120 mins) and affected delivery metrics.
3. Click **Supply Hubs** ([http://localhost:5173/warehouses](http://localhost:5173/warehouses)) to showcase stock gauges and AI shortage forecasting.

---

## 🛠️ Verification Credentials & API Endpoints
- **Frontend URL**: [http://localhost:5173/](http://localhost:5173/)
- **Backend Swagger API**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Role Switcher**: Use the header dropdown (`Role: Admin`, `District Officer`, `Fleet Manager`, `Field Officer`, `Driver`) to demonstrate role-based permissions.
