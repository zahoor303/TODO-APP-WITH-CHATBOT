from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
# import os # Removed
# from dotenv import load_dotenv # Removed
from . import config # Import config

# load_dotenv() # Removed

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow OPTIONS requests to pass through for CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path.startswith("/api/"):
            if request.url.path not in ["/api/token", "/api/users/", "/api/users"]: # Unprotected routes
                auth_header = request.headers.get("Authorization")
                if not auth_header or not auth_header.startswith("Bearer "):
                    raise HTTPException(status_code=401, detail="Unauthorized")

                token = auth_header.split(" ")[1]
                try:
                    # secret_key = os.environ.get("BETTER_AUTH_SECRET") # Removed
                    secret_key = config.SECRET_KEY # Use SECRET_KEY from config
                    payload = jwt.decode(token, secret_key, algorithms=[config.ALGORITHM]) # Use ALGORITHM from config
                    request.state.user_id = payload.get("sub")
                except jwt.ExpiredSignatureError:
                    raise HTTPException(status_code=401, detail="Token has expired")
                except jwt.InvalidTokenError:
                    raise HTTPException(status_code=401, detail="Invalid token")

        response = await call_next(request)
        return response
