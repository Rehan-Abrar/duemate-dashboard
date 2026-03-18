import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState({ status: "loading" });

  useEffect(() => {
    fetch("https://duemate-backend-31qm.onrender.com/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: "offline" }));
  }, []);

  return (
    <main className="page">
      <section className="card">
        <h1>DueMate Phase 1</h1>
        <p>Foundation setup is active. Frontend can reach backend health endpoint.</p>
        <div className="status-row">
          <span className="label">Backend status</span>
          <span className={`badge ${health.status}`}>{health.status}</span>
        </div>
      </section>
    </main>
  );
}

export default App;
