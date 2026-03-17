from enum import StrEnum

from sqlalchemy import Column, Integer, String
from database import Base


class TodoStatus(StrEnum):
    ACTIVE = "active"
    DONE = "done"
    DELETED = "deleted"


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    status = Column(
        String(20),
        nullable=False,
        default=TodoStatus.ACTIVE.value,
        server_default=TodoStatus.ACTIVE.value,
        index=True,
    )
