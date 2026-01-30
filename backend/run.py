#!/usr/bin/env python
"""
Production startup script for the backend API
Designed for deployment on Hugging Face Spaces
"""
import uvicorn
import os
from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    # Configure uvicorn to run with production settings
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level="info",  # Set appropriate log level
    )