🚢 Maritime Fleet Command Center

**A full-stack, real-time **Maritime Fleet Management System** designed to simulate, track, and manage global naval operations**

The system features a **live geospatial simulation engine** that navigates vessels autonomously using Bezier curve pathfinding (Turf.js), avoiding landmasses while calculating fuel consumption and weather conditions in real-time.

**🚀 Live Demo** - https://698218a13048b827db52af8b--guileless-pastelito-64a567.netlify.app/

**Key Features** ✨ 

1) **Real-Time Geospatial Tracking**
   **Live Map Interface:** Interactive Leaflet.js map with custom Esri Ocean basemaps.
   **Autonomous Navigation:** Vessels move automatically between ports using `Turf.js` for collision-free path routing.
   **Visual Status Indicators:** Color-coded markers for Active (Green), Docked (Purple), and Maintenance (Orange) statuses.

2) **Smart Simulation Engine**
   **Background Worker:** A dedicated Node.js service (`simulationService.js`) updates coordinates, fuel levels, and weather conditions for the entire fleet every 5                               seconds.
  ** Dynamic Events:** Random generation of weather events (Storms, Clear Skies) and fuel consumption based on speed.

3) **Command Dashboard & Analytics**
   **Data Visualization:** Real-time charts (Recharts) showing fleet fuel usage, submarine depth profiles, and operational status.
   **Docking Logs:** A permanent, auditable history of all vessel arrivals and decommission events.

4) **Security & Access Control**
   **RBAC (Role-Based Access Control):**
     **Admin:** Full control (Add/Delete vessels, User management).
     **Operator:** Can update status and dock vessels.
     **Viewer:** Read-only access to maps and logs.

5) **Tech Stack**
   **Frontend** - React.js (Vite), Tailwind CSS, React-Leaflet
   **Backend** - Node.js, Express.js, MongoDB (Mongoose), JWT, CORS
   **Geospatial** - Turf.js (Pathfinding & Geofencing), Leaflet.js
   **Deployment** - Netlify (Frontend), Render (Backend), MongoDB Atlas (Database) 

6) **Screenshots**

      **LOGIN PAGE -**

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/e9783d85-5fe2-4196-85ab-7a94026e295d" />

      **REGISTER PAGE -**

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/99f60455-f40b-469e-8fdb-554684ef33af" />

      **DASHBOARD PAGE -**

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/6b2f666e-b408-4a53-a5e9-f18846a2e0e8" />

      **FLEET MANAGEMENT -**

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/f2ed08bf-c11a-4e18-8f46-cbe66b8f38e6" />

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/97ef12d2-48dd-4dba-920c-01b5dd2a4cd1" />

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/349a69b7-ca84-4623-82ff-0af61fa70ef1" />

      <img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/cf50f649-a9f0-4e5f-b905-15eb2b2b6f61" />

7) **Installation & Local Setup**

    **STEP 1 -** **Clone the Repository** - git clone https://github.com/GVSASIDHAR/maritime-fleet-manager.git
    **STEP 2 -** cd backend -> npm install
    **STEP 3 -** Create a .env file in the backend/ folder:
                    PORT=5001
                    MONGO_URI=your_mongodb_atlas_connection_string
                    JWT_SECRET=your_super_secret_key
    **STEP 4 -** Start the Server ->  npm run dev
                    You should see: "🚀 Server running on port 5001" and "🌐 Smart Simulation Service Started..."
    **STEP 5 -** Frontend Setup - Open a new terminal window:
                    cd frontend -> npm install
    **STEP 6-**  Configure API Connection: Open src/main.jsx and ensure the API URL points to your backend: 
                    axios.defaults.baseURL = 'http://localhost:5001'; // For local development
    **STEP 7-**  Start the React App: npm run dev    ->    Open http://localhost:5173 in your browser.


7) **API Endpoints**

   **Method**   **Endpoint**            **Description**
      POST      /api/auth/login      Authenticate user & get Token
      GET       /api/vessels         Fetch all vessels with live coordinates
      POST      /api/vessels         Commission a new vessel (Admin only)
      PUT       /api/vessels/:id     Update vessel status/speed
      GET       /api/logs            Retrieve historical docking records
   
    
