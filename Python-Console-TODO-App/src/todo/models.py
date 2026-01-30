from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import uuid4


@dataclass
class Task:
    """
    Represents a todo task with all required attributes.
    """
    id: str  # Using string representation of UUID
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = None
    
    def __post_init__(self):
        """
        Set the created_at timestamp after initialization if not provided.
        """
        if self.created_at is None:
            self.created_at = datetime.now()
    
    def __str__(self):
        status = "✓" if self.completed else "○"
        return f"[{status}] {self.title}"