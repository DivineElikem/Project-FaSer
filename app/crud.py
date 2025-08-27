from . import models, schemas
from sqlalchemy.orm import Session
from typing import Optional, List


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_name(db: Session, name: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.name == name).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(
        name=user.name,
        active=user.active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



def update_user(db: Session, db_user: models.User, user_update: schemas.UserUpdate) -> models.User:
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.active is not None:
        db_user.active = user_update.active
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, db_user: models.User):
    db.delete(db_user)
    db.commit()

# Face CRUD

def create_face(db: Session, user_id: int, encoding: str) -> models.Face:
    face = models.Face(encoding=encoding, user_id=user_id)
    db.add(face)
    db.commit()
    db.refresh(face)
    return face


def get_face_by_user(db: Session, user_id: int) -> Optional[models.Face]:
    return db.query(models.Face).filter(models.Face.user_id == user_id).first()

# Logs CRUD

def log_access(db: Session, user_id: Optional[int], status: str, face_encoding: Optional[str] = None) -> models.AccessLog:
    log = models.AccessLog(user_id=user_id, status=status, face_encoding=face_encoding)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_logs(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.AccessLog)
    if status:
        query = query.filter(models.AccessLog.status == status)
    # Order by latest first
    query = query.order_by(models.AccessLog.timestamp.desc())
    return query.offset(skip).limit(limit).all()

# Notification Tokens CRUD

def get_tokens(db: Session) -> List[str]:
    return [t.token for t in db.query(models.NotificationToken).all()]


def save_token(db: Session, token: str):
    db_token = models.NotificationToken(token=token)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def delete_token(db: Session, token: str):
    db_token = db.query(models.NotificationToken).filter(models.NotificationToken.token == token).first()
    if db_token:
        db.delete(db_token)
        db.commit()
        return True
    return False
