"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTodos,
  createTodo,
  markDone,
  restoreTodo,
  deleteTodo,
  updateTodo,
} from "@/lib/api";

const FILTERS = [
  { label: "Active", value: "active" },
  { label: "Done", value: "done" },
  { label: "Deleted", value: "deleted" },
  { label: "All", value: "all" },
];

const STATUS_BADGE = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  done: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  deleted: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function HomePage() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("active");
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTodos({
        status: filter === "all" ? undefined : filter,
        includeDeleted: filter === "all" || filter === "deleted",
      });
      setTodos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function handleAdd() {
    const title = inputText.trim();
    if (!title) return;
    setAdding(true);
    setError("");
    try {
      const todo = await createTodo(title);
      setInputText("");
      if (filter === "active" || filter === "all") {
        setTodos((prev) => [...prev, todo]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleMarkDone(id) {
    try {
      const updated = await markDone(id);
      setTodos((prev) =>
        filter === "all"
          ? prev.map((t) => (t.id === id ? updated : t))
          : prev.filter((t) => t.id !== id)
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRestore(id) {
    try {
      const updated = await restoreTodo(id);
      setTodos((prev) =>
        filter === "all"
          ? prev.map((t) => (t.id === id ? updated : t))
          : prev.filter((t) => t.id !== id)
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      const updated = await deleteTodo(id);
      setTodos((prev) =>
        filter === "all"
          ? prev.map((t) => (t.id === id ? updated : t))
          : prev.filter((t) => t.id !== id)
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleEditSave(id) {
    const title = editText.trim();
    if (!title) return;
    try {
      const updated = await updateTodo(id, { title });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] px-4 py-14 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-xl mb-10">
        <p className="text-xs tracking-[0.2em] text-[#444] uppercase mb-3 font-mono">
          todo / fastapi + next.js
        </p>
        <h1 className="text-[2.6rem] leading-none font-bold tracking-tight">
          My Tasks
        </h1>
        <p className="text-[#444] text-sm mt-2 font-mono">
          {todos.length} {filter === "all" ? "total" : filter}
        </p>
      </div>

      {/* Add input */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="New task..."
            className="flex-1 bg-[#141414] border border-[#252525] rounded-lg px-4 py-3 text-sm placeholder:text-[#383838] focus:outline-none focus:border-[#f0ede8]/30 transition-colors font-mono"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !inputText.trim()}
            className="bg-[#f0ede8] text-[#0a0a0a] font-bold text-sm px-5 py-3 rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {adding ? "…" : "+ Add"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-red-400 text-xs font-mono">{error}</p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="w-full max-w-xl mb-5 flex gap-1 bg-[#111] border border-[#1e1e1e] p-1 rounded-lg">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-1 py-2 text-xs font-mono rounded-md transition-all ${
              filter === f.value
                ? "bg-[#f0ede8] text-[#0a0a0a] font-bold"
                : "text-[#444] hover:text-[#888]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="w-full max-w-xl space-y-2">
        {loading ? (
          <div className="text-center py-20 text-[#2a2a2a] font-mono text-sm">
            Loading…
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-20 text-[#2a2a2a] font-mono text-sm">
            No {filter === "all" ? "" : filter} tasks.
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center gap-3 bg-[#111] border border-[#1e1e1e] rounded-lg px-4 py-3 hover:border-[#2a2a2a] transition-all"
            >
              {/* Status dot */}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  todo.status === "active"
                    ? "bg-emerald-500"
                    : todo.status === "done"
                    ? "bg-sky-500"
                    : "bg-red-500/50"
                }`}
              />

              {/* Title / edit */}
              {editingId === todo.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave(todo.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-transparent border-b border-[#f0ede8]/30 text-sm font-mono focus:outline-none py-0.5"
                />
              ) : (
                <span
                  className={`flex-1 text-sm font-mono cursor-text ${
                    todo.status === "deleted"
                      ? "line-through text-[#333]"
                      : todo.status === "done"
                      ? "text-[#555]"
                      : "text-[#d0cdc8]"
                  }`}
                  onDoubleClick={() => {
                    setEditingId(todo.id);
                    setEditText(todo.title);
                  }}
                  title="Double-click to edit"
                >
                  {todo.title}
                </span>
              )}

              {/* Status badge */}
              <span
                className={`hidden group-hover:inline text-[10px] font-mono px-2 py-0.5 rounded border ${STATUS_BADGE[todo.status]}`}
              >
                {todo.status}
              </span>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {editingId === todo.id ? (
                  <>
                    <ActionBtn onClick={() => handleEditSave(todo.id)} title="Save" color="text-emerald-400">
                      ✓
                    </ActionBtn>
                    <ActionBtn onClick={() => setEditingId(null)} title="Cancel" color="text-[#555]">
                      ✕
                    </ActionBtn>
                  </>
                ) : (
                  <>
                    {todo.status === "active" && (
                      <ActionBtn onClick={() => handleMarkDone(todo.id)} title="Mark done" color="text-sky-400">
                        ✓
                      </ActionBtn>
                    )}
                    {(todo.status === "done" || todo.status === "deleted") && (
                      <ActionBtn onClick={() => handleRestore(todo.id)} title="Restore" color="text-emerald-400">
                        ↩
                      </ActionBtn>
                    )}
                    {todo.status !== "deleted" && (
                      <ActionBtn onClick={() => handleDelete(todo.id)} title="Delete" color="text-red-400">
                        ✕
                      </ActionBtn>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-12 text-[#1e1e1e] text-xs font-mono">
        double-click to edit · ✓ done · ↩ restore · ✕ delete
      </p>
    </main>
  );
}

function ActionBtn({ onClick, title, color, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 flex items-center justify-center rounded text-xs ${color} hover:bg-white/5 transition-colors`}
    >
      {children}
    </button>
  );
}