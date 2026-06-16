# Project 2.19 — FastAPI Todo API

**Lecture Notes:** 24. Python Foundations, 25. Python Full Stack

## What You're Building

A REST API for a todo list, built with Python and FastAPI. You'll use
SQLite for the database (no setup required — SQLite is built into Python)
with SQLAlchemy as the ORM.

This is a Python-only backend project — no frontend needed.

---

## Setup

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# OR: source venv/bin/activate # Mac/Linux

pip install fastapi "uvicorn[standard]" sqlalchemy pydantic
```

Create `requirements.txt`:
```
fastapi
uvicorn[standard]
sqlalchemy
pydantic
```

Run the API:
```bash
uvicorn main:app --reload
```

The `--reload` flag restarts the server when you save a file.
Open the interactive docs at: http://localhost:8000/docs

---

## Task 1 — Project Structure

```
fastapi-todo/
  main.py           ← FastAPI app, routes
  models.py         ← SQLAlchemy ORM models (database tables)
  schemas.py        ← Pydantic schemas (request/response validation)
  database.py       ← database connection and session setup
  crud.py           ← database operations (create, read, update, delete)
  todo.db           ← SQLite file (auto-created)
```

---

## Task 2 — Database Setup (`database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./todo.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency — provides a database session for each request, then closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Task 3 — SQLAlchemy Model (`models.py`)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Todo(Base):
    __tablename__ = "todos"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    completed   = Column(Boolean, default=False)
    priority    = Column(String(10), default="medium")  # low / medium / high
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())
```

---

## Task 4 — Pydantic Schemas (`schemas.py`)

Pydantic schemas define what data is acceptable in requests and what
data is returned in responses:

```python
from pydantic import BaseModel, Field
from typing   import Optional
from datetime import datetime

# Used for creating a new todo (request body)
class TodoCreate(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    priority:    str            = Field("medium", pattern="^(low|medium|high)$")

# Used for partial updates
class TodoUpdate(BaseModel):
    title:       Optional[str]  = Field(None, min_length=1, max_length=200)
    description: Optional[str]  = None
    completed:   Optional[bool] = None
    priority:    Optional[str]  = Field(None, pattern="^(low|medium|high)$")

# Returned in API responses
class TodoResponse(BaseModel):
    id:          int
    title:       str
    description: Optional[str]
    completed:   bool
    priority:    str
    created_at:  datetime
    updated_at:  Optional[datetime]

    class Config:
        from_attributes = True  # allows converting SQLAlchemy objects to this schema
```

---

## Task 5 — CRUD Functions (`crud.py`)

Write functions that interact with the database:

```python
from sqlalchemy.orm import Session
from models  import Todo
from schemas import TodoCreate, TodoUpdate

def get_todos(db: Session, skip: int = 0, limit: int = 100,
              completed: bool | None = None, priority: str | None = None):
    query = db.query(Todo)
    if completed is not None:
        query = query.filter(Todo.completed == completed)
    if priority:
        query = query.filter(Todo.priority == priority)
    return query.offset(skip).limit(limit).all()

def get_todo(db: Session, todo_id: int):
    return db.query(Todo).filter(Todo.id == todo_id).first()

def create_todo(db: Session, todo: TodoCreate):
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)  # updates db_todo with the generated id and timestamps
    return db_todo

def update_todo(db: Session, todo_id: int, todo: TodoUpdate):
    db_todo = get_todo(db, todo_id)
    if not db_todo:
        return None
    update_data = todo.model_dump(exclude_unset=True)  # only update provided fields
    for field, value in update_data.items():
        setattr(db_todo, field, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, todo_id: int):
    db_todo = get_todo(db, todo_id)
    if not db_todo:
        return False
    db.delete(db_todo)
    db.commit()
    return True
```

---

## Task 6 — FastAPI Routes (`main.py`)

```python
from fastapi    import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing     import Optional
import models, schemas, crud
from database   import engine, get_db

models.Base.metadata.create_all(bind=engine)  # creates tables if they don't exist

app = FastAPI(title="Todo API", version="1.0.0")

@app.get("/todos", response_model=list[schemas.TodoResponse])
def list_todos(
    skip:      int            = 0,
    limit:     int            = 100,
    completed: Optional[bool] = None,
    priority:  Optional[str]  = None,
    db:        Session        = Depends(get_db)
):
    return crud.get_todos(db, skip=skip, limit=limit,
                          completed=completed, priority=priority)

@app.post("/todos", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db, todo)

@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = crud.get_todo(db, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.patch("/todos/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    updated = crud.update_todo(db, todo_id, todo)
    if not updated:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated

@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    if not crud.delete_todo(db, todo_id):
        raise HTTPException(status_code=404, detail="Todo not found")
```

---

## Task 7 — Test with the Interactive Docs

FastAPI generates interactive documentation automatically.

Open http://localhost:8000/docs and try each endpoint:
1. Create a few todos with different priorities
2. List all todos, then filter by `?completed=false`
3. Update a todo to mark it completed
4. Delete a todo
5. Try to get a deleted todo — confirm you get a 404

---

## Stretch Goals

- Add user authentication with JWT (see lecture notes 25)
- Add Alembic migrations so you can change the schema without data loss
- Add categories/tags as a separate table with a many-to-many relationship
- Write tests with pytest: test each endpoint in `test_main.py`
- Add CORS middleware so a frontend can call this API
