import { useState } from "react";
import { saveFooter } from "../../lib/uploadApi.js";

export default function FooterForm({ footer }) {
  const [form, setForm] = useState({
    ...footer,
    instagram: { ...footer.instagram },
  });
  const [status, setStatus] = useState("");

  function update(event) {
    const { name, value } = event.target;
    if (name.startsWith("instagram.")) {
      const key = name.split(".")[1];
      setForm((current) => ({
        ...current,
        instagram: { ...current.instagram, [key]: value },
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("Saving…");
    try {
      await saveFooter(form);
      setStatus("Footer saved.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <h2>Footer</h2>
      <label>
        Studio
        <input name="studio" value={form.studio} onChange={update} required maxLength={80} />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          required
          maxLength={120}
        />
      </label>
      <label>
        Instagram handle
        <input
          name="instagram.handle"
          value={form.instagram.handle}
          onChange={update}
          required
          maxLength={60}
        />
      </label>
      <label>
        Instagram URL
        <input
          name="instagram.url"
          type="url"
          value={form.instagram.url}
          onChange={update}
          required
          maxLength={200}
        />
      </label>
      <label>
        Inquiries
        <textarea
          name="inquiries"
          value={form.inquiries}
          onChange={update}
          required
          maxLength={240}
          rows={3}
        />
      </label>
      <button type="submit">Save footer</button>
      {status ? <p className="upload-status">{status}</p> : null}
    </form>
  );
}
