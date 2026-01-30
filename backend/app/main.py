import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from uuid import UUID
from .database import engine, get_session
from . import models, schemas
from .api.endpoints import tasks, users, auth, chat
from .middleware import JWTAuthMiddleware
from . import config
from .crud import get_password_hash

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://todo-app-phase3-again.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add JWT middleware
app.add_middleware(JWTAuthMiddleware)



@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/users", tags=["tasks"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"Hello": "World"}