import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://duemate-backend-31qm.onrender.com";

function App() {
  const [health, setHealth] = useState({ status: "loading" });
  const [messages, setMessages] = useState([]);
  const [delivery, setDelivery] = useState({ summary: [], recent_events: [] });
  const [unresolvedTasks, setUnresolvedTasks] = useState([]);
  const [defaultCourses, setDefaultCourses] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [assigningTaskId, setAssigningTaskId] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        setLoadingData(true);
        const [healthRes, messagesRes, deliveryRes, unresolvedRes, coursesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/health`),
          fetch(`${API_BASE_URL}/api/messages/recent?limit=15`),
          fetch(`${API_BASE_URL}/api/delivery-status`),
          fetch(`${API_BASE_URL}/api/tasks?course_unresolved=true&limit=20`),
          fetch(`${API_BASE_URL}/api/courses/default`),
        ]);

        if (!active) {
          return;
        }

        if (!healthRes.ok) {
          throw new Error("Health endpoint unavailable");
        }

        const healthData = await healthRes.json();
        setHealth(healthData);

        let partialErrors = [];

        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setMessages(Array.isArray(messagesData.items) ? messagesData.items : []);
        } else {
          setMessages([]);
          partialErrors.push("messages API not available");
        }

        if (deliveryRes.ok) {
          const deliveryData = await deliveryRes.json();
          setDelivery(
            deliveryData && typeof deliveryData === "object"
              ? deliveryData
              : { summary: [], recent_events: [] },
          );
        } else {
          setDelivery({ summary: [], recent_events: [] });
          partialErrors.push("delivery API not available");
        }

        if (unresolvedRes.ok) {
          const unresolvedData = await unresolvedRes.json();
          setUnresolvedTasks(Array.isArray(unresolvedData.items) ? unresolvedData.items : []);
        } else {
          setUnresolvedTasks([]);
          partialErrors.push("task queue API not available");
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setDefaultCourses(Array.isArray(coursesData.items) ? coursesData.items : []);
        } else {
          setDefaultCourses([]);
          partialErrors.push("course catalog API not available");
        }

        setDataError(
          partialErrors.length > 0
            ? `Backend is reachable, but ${partialErrors.join(" and ")}. Deploy latest backend to enable live data.`
            : "",
        );
      } catch {
        if (!active) {
          return;
        }
        setHealth({ status: "offline" });
        setMessages([]);
        setDelivery({ summary: [], recent_events: [] });
        setDataError("Unable to load backend health endpoint.");
      } finally {
        if (active) {
          setLoadingData(false);
        }
      }
    }

    loadDashboardData();
    const timer = setInterval(loadDashboardData, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const summaryItems = Array.isArray(delivery.summary) ? delivery.summary : [];
  const statusEvents = Array.isArray(delivery.recent_events)
    ? delivery.recent_events
    : [];

  async function assignCourse(task) {
    const draft = assignmentDrafts[task._id] || {};
    const courseCode = draft.course_code || "";
    if (!courseCode) {
      return;
    }

    setAssigningTaskId(task._id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${task._id}/assign-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_code: courseCode,
          apply_to_source: Boolean(draft.apply_to_source),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign course");
      }

      setUnresolvedTasks((prev) => prev.filter((item) => item._id !== task._id));
    } catch {
      setDataError("Unable to assign course right now. Please try again.");
    } finally {
      setAssigningTaskId("");
    }
  }

  return (
    <main className="page">
      <section className="layout">
        <article className="card hero">
          <h1>DueMate Operations</h1>
          <p>
            Live view of webhook ingestion, delivery status updates, and backend
            readiness.
          </p>
          <div className="status-row">
            <span className="label">Backend status</span>
            <span className={`badge ${health.status}`}>{health.status}</span>
          </div>
          <div className="meta-row">
            <span>Mongo: {health.mongo_connected ? "connected" : "disconnected"}</span>
            <span>Meta API: {health.meta_configured ? "configured" : "missing"}</span>
          </div>
          {dataError ? <p className="error-text">{dataError}</p> : null}
        </article>

        <article className="card">
          <h2>Delivery Summary</h2>
          <div className="chips">
            {summaryItems.length === 0 ? (
              <span className="chip muted">No delivery data yet</span>
            ) : (
              summaryItems.map((item) => (
                <span key={`${item.status}-${item.count}`} className="chip">
                  {item.status}: {item.count}
                </span>
              ))
            )}
          </div>
        </article>

        <article className="card wide">
          <h2>Unresolved Course Queue</h2>
          {unresolvedTasks.length === 0 ? (
            <p className="muted">No unresolved forwarded tasks.</p>
          ) : (
            <div className="resolve-list">
              {unresolvedTasks.map((task) => {
                const draft = assignmentDrafts[task._id] || {};
                const sourceKnown = task.source_key && task.source_key !== "forwarded:unknown";

                return (
                  <article key={task._id} className="resolve-item">
                    <div className="resolve-main">
                      <p className="resolve-title">{task.parsed_title || "Untitled task"}</p>
                      <p className="resolve-sub">
                        From {task.phone_number || "unknown"} | source {task.source_key || "unknown"}
                      </p>
                      <p className="resolve-text">{task.raw_message || "(no message text)"}</p>
                    </div>

                    <div className="resolve-actions">
                      <select
                        value={draft.course_code || ""}
                        onChange={(event) =>
                          setAssignmentDrafts((prev) => ({
                            ...prev,
                            [task._id]: {
                              ...(prev[task._id] || {}),
                              course_code: event.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">Select course</option>
                        {defaultCourses.map((course) => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>

                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          disabled={!sourceKnown}
                          checked={Boolean(draft.apply_to_source) && sourceKnown}
                          onChange={(event) =>
                            setAssignmentDrafts((prev) => ({
                              ...prev,
                              [task._id]: {
                                ...(prev[task._id] || {}),
                                apply_to_source: event.target.checked,
                              },
                            }))
                          }
                        />
                        Apply to future same source
                      </label>

                      <button
                        type="button"
                        className="assign-button"
                        disabled={!draft.course_code || assigningTaskId === task._id}
                        onClick={() => assignCourse(task)}
                      >
                        {assigningTaskId === task._id ? "Saving..." : "Assign course"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>

        <article className="card wide">
          <h2>Recent Messages</h2>
          {loadingData ? (
            <p className="muted">Loading message stream...</p>
          ) : messages.length === 0 ? (
            <p className="muted">No messages ingested yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Type</th>
                    <th>Text</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.message_id || `${message.from}-${message.timestamp}`}>
                      <td>{message.from || "-"}</td>
                      <td>{message.type || "unknown"}</td>
                      <td className="text-cell">{message.text || "(no text)"}</td>
                      <td>{message.delivery_status || "received"}</td>
                      <td>
                        {message.received_at
                          ? new Date(message.received_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card wide">
          <h2>Recent Delivery Events</h2>
          {statusEvents.length === 0 ? (
            <p className="muted">No delivery events yet.</p>
          ) : (
            <ul className="event-list">
              {statusEvents.map((event, index) => (
                <li key={`${event.message_id}-${event.status}-${index}`}>
                  <span className="event-main">
                    {event.status} for {event.recipient_id || "unknown recipient"}
                  </span>
                  <span className="event-sub">
                    message {event.message_id || "unknown"} at{" "}
                    {event.processed_at
                      ? new Date(event.processed_at).toLocaleString()
                      : "-"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
      <footer className="footer-note">
        Auto-refresh every 15s for retry-safe webhook monitoring.
      </footer>
    </main>
  );
}

export default App;
