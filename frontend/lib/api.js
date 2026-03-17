async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Could not reach the FastAPI server. Make sure the backend is running."
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

// GET /todos?status=active&include_deleted=false
export function getTodos({ status, includeDeleted = false } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (includeDeleted) params.set("include_deleted", "true");
  const qs = params.toString();
  return request(`/todos${qs ? `?${qs}` : ""}`);
}

// GET /todos/:id
export function getTodo(id) {
  return request(`/todos/${id}`);
}

// POST /todos
export function createTodo(title) {
  return request("/todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

// PATCH /todos/:id  (update title and/or status)
export function updateTodo(id, payload) {
  return request(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// PATCH /todos/:id/done
export function markDone(id) {
  return request(`/todos/${id}/done`, { method: "PATCH" });
}

// PATCH /todos/:id/restore
export function restoreTodo(id) {
  return request(`/todos/${id}/restore`, { method: "PATCH" });
}

// DELETE /todos/:id  (soft delete → status: deleted)
export function deleteTodo(id) {
  return request(`/todos/${id}`, { method: "DELETE" });
}
