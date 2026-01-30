from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import Annotated
from datetime import datetime, timedelta
import jwt
# import os # Removed
# from dotenv import load_dotenv # Removed

from ...database import get_session
from ... import models, crud, schemas # Import models, crud, and schemas
from ...auth_schemas import Token # Import Token from auth_schemas
from ... import config # Import config

# load_dotenv() # Removed
SECRET_KEY = config.SECRET_KEY # Use SECRET_KEY from config
# print(f"Auth endpoint using SECRET_KEY: {SECRET_KEY}") # Removed
ALGORITHM = config.ALGORITHM # Use ALGORITHM from config
ACCESS_TOKEN_EXPIRE_MINUTES = config.ACCESS_TOKEN_EXPIRE_MINUTES # Use ACCESS_TOKEN_EXPIRE_MINUTES from config

router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post(
    "/token",
    response_model=Token,
    responses={
        401: {"model": schemas.HTTPError},
        500: {"model": schemas.HTTPError},
    },
)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_session),
):
    try:
        user = db.exec(
            select(models.User).where(models.User.email == form_data.username)
        ).first()

        if not user or not crud.verify_password(
            form_data.password, user.password
        ):  # Use crud.verify_password
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

