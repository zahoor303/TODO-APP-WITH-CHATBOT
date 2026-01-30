from typing import Optional
from .models import Task
from .storage import TodoCRUDSubagent


class TodoService:
    """
    Service layer that implements validation before calling the subagent.
    """
    def __init__(self, subagent: TodoCRUDSubagent):
        self.subagent = subagent
    
    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Validates title length (1-200 characters) before creating tasks.
        """
        if not title or len(title) < 1 or len(title) > 200:
            raise ValueError("Title must be between 1 and 200 characters")
        
        return self.subagent.create_task(title, description)
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """
        Retrieves a task by ID.
        """
        return self.subagent.get_task(task_id)
    
    def get_all_tasks(self) -> list:
        """
        Retrieves all tasks.
        """
        return self.subagent.get_all_tasks()
    
    def update_task(self, task_id: str, title: Optional[str] = None,
                    description: Optional[str] = None, completed: Optional[bool] = None) -> Optional[Task]:
        """
        Validates title length before updating tasks.
        """
        if title is not None and (len(title) < 1 or len(title) > 200):
            raise ValueError("Title must be between 1 and 200 characters")

        # Validate that task exists before attempting update
        existing_task = self.subagent.get_task(task_id)
        if not existing_task:
            raise ValueError(f"Task with ID {task_id} does not exist")

        return self.subagent.update_task(task_id, title=title, description=description, completed=completed)
    
    def delete_task(self, task_id: str) -> bool:
        """
        Validates that task exists before deletion.
        """
        # Validate that task exists before attempting deletion
        existing_task = self.subagent.get_task(task_id)
        if not existing_task:
            raise ValueError(f"Task with ID {task_id} does not exist")
        
        return self.subagent.delete_task(task_id)
    
    def toggle_task_status(self, task_id: str) -> Optional[Task]:
        """
        Validates that task exists before toggling status.
        """
        # Validate that task exists before toggling
        existing_task = self.subagent.get_task(task_id)
        if not existing_task:
            raise ValueError(f"Task with ID {task_id} does not exist")
        
        return self.subagent.toggle_task_status(task_id)