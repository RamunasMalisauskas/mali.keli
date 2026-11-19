import { useEffect, useRef, useState } from "react";
import { uploadImage } from "../../lib/uploadApi.js";
import {
  deleteWorkOnSheet,
  fetchWorks,
  saveWorksToSheet,
} from "../../lib/sheet.js";

function emptyWork() {
  return {
    id: "",
    index: "",
    title: "",
    association: "",
    year: "",
    description: "",
    image: "",
    alt: "",
    technique: "",
    location: "",
    category: "",
    extraImages: [],
  };
}

function slugFromTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function moveItem(list, from, to) {
  if (from === to || from < 0 || to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function WorksForm() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("");
  const [dragId, setDragId] = useState("");
  const listRef = useRef([]);
  const orderBeforeDrag = useRef([]);

  listRef.current = list;

  useEffect(() => {
    fetchWorks()
      .then(setList)
      .catch((error) => setStatus(error.message));
  }, []);

  function startNew() {
    setEditing(emptyWork());
    setStatus("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setEditing((current) => ({ ...current, [name]: value }));
  }

  function updateExtra(index, key, value) {
    setEditing((current) => ({
      ...current,
      extraImages: current.extraImages.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  async function onPickImage(event, onSrc) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setStatus("Uploading image…");
    try {
      onSrc(await uploadImage(file));
      setStatus("Image uploaded.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function persist(next) {
    setStatus("Saving to Google Sheet…");
    setList(await saveWorksToSheet(next));
    setStatus("Sheet updated.");
  }

  async function onSubmit(event) {
    event.preventDefault();
    const draft = {
      ...editing,
      id: editing.id || slugFromTitle(editing.title),
    };
    if (!draft.id) {
      setStatus("Add a title or id.");
      return;
    }
    const exists = list.some((work) => work.id === draft.id);
    const originalId = editing.id;
    const next = originalId && list.some((work) => work.id === originalId)
      ? list.map((work) => (work.id === originalId ? draft : work))
      : exists
        ? list
        : [...list, draft];
    if (exists && originalId !== draft.id) {
      setStatus("That id is already used.");
      return;
    }
    try {
      await persist(next);
      setEditing(null);
    } catch (error) {
      setStatus(error.message);
    }
  }

  function onDragStart(event, id) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDragId(id);
    orderBeforeDrag.current = list.map((work) => work.id);
  }

  function onDragOver(event, overId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (!dragId || dragId === overId) return;
    setList((current) => {
      const from = current.findIndex((work) => work.id === dragId);
      const to = current.findIndex((work) => work.id === overId);
      return moveItem(current, from, to);
    });
  }

  async function onDragEnd() {
    setDragId("");
    const next = listRef.current;
    const same =
      next.map((work) => work.id).join() === orderBeforeDrag.current.join();
    if (same) return;
    try {
      await persist(next);
    } catch (error) {
      setList(
        orderBeforeDrag.current
          .map((id) => next.find((work) => work.id === id))
          .filter(Boolean),
      );
      setStatus(error.message);
    }
  }

  function moveWork(id, offset) {
    const from = list.findIndex((work) => work.id === id);
    const next = moveItem(list, from, from + offset);
    if (next === list) return;
    setList(next);
    persist(next).catch((error) => setStatus(error.message));
  }

  async function removeWork(id) {
    if (!window.confirm("Remove this work from the sheet?")) return;
    setStatus("Saving to Google Sheet…");
    try {
      const next = await deleteWorkOnSheet(id);
      setList(next);
      if (editing?.id === id) setEditing(null);
      setStatus("Sheet updated.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  return (
    <section className="upload-form">
      <h2>Works</h2>
      <p className="upload-hint">Drag the handle to change gallery order.</p>
      <ul className="upload-work-list">
        {list.map((work, position) => (
          <li
            key={work.id || `work-${position}`}
            className={dragId === work.id ? "is-dragging" : ""}
            onDragOver={(event) => onDragOver(event, work.id)}
            onDrop={(event) => event.preventDefault()}
          >
            <button
              type="button"
              className="upload-drag"
              draggable
              aria-label={`Reorder ${work.title || work.id}`}
              onDragStart={(event) => onDragStart(event, work.id)}
              onDragEnd={onDragEnd}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  moveWork(work.id, -1);
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  moveWork(work.id, 1);
                }
              }}
            >
              ⋮⋮
            </button>
            <span>
              {work.index} — {work.title}
            </span>
            <span className="upload-actions">
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...work,
                    extraImages: (work.extraImages ?? []).map((item) => ({
                      ...item,
                    })),
                  })
                }
              >
                Edit
              </button>
              <button type="button" onClick={() => removeWork(work.id)}>
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={startNew}>
        Add work
      </button>

      {editing ? (
        <form className="upload-editor" onSubmit={onSubmit}>
          <label>
            Id
            <input
              name="id"
              value={editing.id}
              onChange={updateField}
              placeholder="ochre-field"
              maxLength={60}
            />
          </label>
          <label>
            Index
            <input name="index" value={editing.index} onChange={updateField} required maxLength={80} />
          </label>
          <label>
            Title
            <input name="title" value={editing.title} onChange={updateField} required maxLength={80} />
          </label>
          <label>
            Year
            <input name="year" value={editing.year} onChange={updateField} required maxLength={12} />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={editing.description}
              onChange={updateField}
              required
              maxLength={600}
              rows={4}
            />
          </label>
          <label>
            Technique
            <input
              name="technique"
              value={editing.technique}
              onChange={updateField}
              required
              maxLength={120}
            />
          </label>
          <label>
            Location
            <input
              name="location"
              value={editing.location}
              onChange={updateField}
              required
              maxLength={120}
            />
          </label>
          <label>
            Main image alt
            <input name="alt" value={editing.alt} onChange={updateField} required maxLength={180} />
          </label>
          <label>
            Main image
            <input
              name="image"
              value={editing.image}
              onChange={updateField}
              required
              maxLength={120}
            />
          </label>
          <label>
            Upload main image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                onPickImage(event, (src) =>
                  setEditing((current) => ({ ...current, image: src })),
                )
              }
            />
          </label>

          <h3>Extra images</h3>
          {editing.extraImages.map((item, index) => (
            <fieldset key={index} className="upload-extra">
              <label>
                Path
                <input
                  value={item.src}
                  onChange={(event) => updateExtra(index, "src", event.target.value)}
                  required
                />
              </label>
              <label>
                Alt
                <input
                  value={item.alt}
                  onChange={(event) => updateExtra(index, "alt", event.target.value)}
                  required
                />
              </label>
              <label>
                Upload
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    onPickImage(event, (src) => updateExtra(index, "src", src))
                  }
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setEditing((current) => ({
                    ...current,
                    extraImages: current.extraImages.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
              >
                Remove image
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            onClick={() =>
              setEditing((current) => ({
                ...current,
                extraImages: [...current.extraImages, { src: "", alt: "" }],
              }))
            }
          >
            Add extra image
          </button>
          <div className="upload-actions">
            <button type="submit">Save work</button>
            <button type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      {status ? <p className="upload-status">{status}</p> : null}
    </section>
  );
}
