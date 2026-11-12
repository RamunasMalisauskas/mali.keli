import { useEffect, useState } from "react";
import { footer } from "../../data/footer.js";
import { works } from "../../data/works.js";
import { getSession, login, logout } from "../../lib/uploadApi.js";
import FooterForm from "./FooterForm.jsx";
import WorksForm from "./WorksForm.jsx";
import "./Upload.css";

export default function Upload() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Studio — MALI.KELI";
    return () => {
      document.title = "MALI.KELI";
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    getSession()
      .then(() => {
        if (!ignore) setAuthed(true);
      })
      .catch(() => {
        if (!ignore) setAuthed(false);
      })
      .finally(() => {
        if (!ignore) setReady(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(password);
      setPassword("");
      setAuthed(true);
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  async function onLogout() {
    await logout().catch(() => {});
    setAuthed(false);
  }

  if (!ready) return <main className="upload-page">Loading…</main>;

  if (!authed) {
    return (
      <main className="upload-page">
        <form className="upload-form" onSubmit={onSubmit}>
          <h1>Studio</h1>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit">Enter</button>
          {error ? <p className="upload-status">{error}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="upload-page">
      <header className="upload-header">
        <h1>Studio</h1>
        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </header>
      <FooterForm footer={footer} />
      <WorksForm works={works} />
    </main>
  );
}
