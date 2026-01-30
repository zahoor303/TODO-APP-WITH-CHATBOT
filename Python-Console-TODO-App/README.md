# Todo App

A console-based todo application with in-memory storage, built with Python, Typer, and Rich.

## Features

- Add, view, update, delete, and mark tasks as complete/incomplete
- Beautiful rich text interface with emojis and colors
- In-memory storage (no database required)
- Multilingual support (Urdu prompts and messages)
- Input validation (title length 1-200 characters)
- Graceful error handling

## Prerequisites

- Python 3.13+
- UV package manager

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. Install dependencies using UV:
   ```bash
   uv sync
   ```

## Usage

Run the application:

```bash
uv run main.py
```

Or using the start script defined in pyproject.toml:

```bash
uv run start
```

### Available Commands

- `add` - Add a new task
  ```bash
  uv run main.py add "Task title" --description "Task description (optional)"
  ```

- `list` - List all tasks
  ```bash
  uv run main.py list
  ```

- `update` - Update an existing task
  ```bash
  uv run main.py update <task-id> --title "New title" --description "New description"
  ```

- `delete` - Delete a task
  ```bash
  uv run main.py delete <task-id>
  ```

- `complete` - Mark a task as complete
  ```bash
  uv run main.py complete <task-id>
  ```

- `incomplete` - Mark a task as incomplete
  ```bash
  uv run main.py incomplete <task-id>
  ```

## Testing

Run the tests using pytest:

```bash
uv run pytest
```

## Project Structure

```
.
├── pyproject.toml          # Project configuration and dependencies
├── main.py                 # Entry point application
├── src/
│   └── todo/
│       ├── __init__.py
│       ├── models.py       # Task dataclass definition
│       ├── storage.py      # InMemoryStorage + TodoCRUDSubagent class
│       ├── service.py      # TodoService with validation logic
│       └── cli.py          # Typer CLI application
├── tests/
│   └── test_crud.py        # Pytest tests for all operations
├── README.md               # Setup and run instructions
└── CLAUDE.md               # Documentation for TodoCRUDSubagent reuse
```

## Architecture

The application follows a layered architecture:

- **Models**: Define the data structure (Task)
- **Storage**: Handle data persistence (InMemoryStorage and TodoCRUDSubagent)
- **Service**: Business logic and validation (TodoService)
