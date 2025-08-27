from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
import io
import face_recognition
import numpy as np
from ..database import get_db
from .. import crud, schemas
from typing import List

router = APIRouter()

router = APIRouter()

@router.get("/", response_model=List[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_new_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_name(db, name=user_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    return crud.create_user(db, user=user_in)

@router.put("/{user_id}", response_model=schemas.UserOut)
def update_existing_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.update_user(db, db_user=db_user, user_update=user_update)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_user(db, db_user)
    return None


@router.post(
    "/{user_id}/photo",
    response_model=schemas.UserOut,
    status_code=status.HTTP_200_OK,
)
async def upload_face(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # 1. Fetch user
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Read image & compute encoding
    contents = await file.read()
    image = face_recognition.load_image_file(io.BytesIO(contents))
    locs = face_recognition.face_locations(image)
    if not locs:
        raise HTTPException(status_code=400, detail="No face detected in image")
    encodings = face_recognition.face_encodings(image, locs)
    encoding_blob = encodings[0].tobytes().hex()

    # 3. Save to Face table (overwriting if exists)
    existing = crud.get_face_by_user(db, user_id=user_id)
    if existing:
        # update
        existing.encoding = encoding_blob
        db.commit()
    else:
        crud.create_face(db, user_id=user_id, encoding=encoding_blob)

    # 4. Return the user
    return db_user