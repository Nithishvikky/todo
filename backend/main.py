from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import Todo, TodoStatus


app = FastAPI()

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbSession = Annotated[Session, Depends(get_db)]


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    status: TodoStatus | None = None


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: TodoStatus


def get_todo_or_404(todo_id: int, db: Session) -> Todo:
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, db: DbSession):
    todo = Todo(title=payload.title, status=TodoStatus.ACTIVE.value)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.get("/todos", response_model=list[TodoResponse])
def get_todos(
    db: DbSession,
    status_filter: Annotated[TodoStatus | None, Query(alias="status")] = None,
    include_deleted: bool = False,
):
    query = db.query(Todo)

    if status_filter is not None:
        query = query.filter(Todo.status == status_filter.value)
    elif not include_deleted:
        query = query.filter(Todo.status != TodoStatus.DELETED.value)

    return query.order_by(Todo.id.asc()).all()


@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int, db: DbSession):
    return get_todo_or_404(todo_id, db)


@app.patch("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, payload: TodoUpdate, db: DbSession):
    todo = get_todo_or_404(todo_id, db)

    if payload.title is not None:
        todo.title = payload.title
    if payload.status is not None:
        todo.status = payload.status.value

    db.commit()
    db.refresh(todo)
    return todo


@app.patch("/todos/{todo_id}/done", response_model=TodoResponse)
def mark_todo_done(todo_id: int, db: DbSession):
    todo = get_todo_or_404(todo_id, db)
    todo.status = TodoStatus.DONE.value
    db.commit()
    db.refresh(todo)
    return todo


@app.patch("/todos/{todo_id}/restore", response_model=TodoResponse)
def restore_todo(todo_id: int, db: DbSession):
    todo = get_todo_or_404(todo_id, db)
    todo.status = TodoStatus.ACTIVE.value
    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", response_model=TodoResponse)
def soft_delete_todo(todo_id: int, db: DbSession):
    todo = get_todo_or_404(todo_id, db)
    todo.status = TodoStatus.DELETED.value
    db.commit()
    db.refresh(todo)
    return todo
