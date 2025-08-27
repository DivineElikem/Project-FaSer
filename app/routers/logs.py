from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.LogOut])
def read_logs(skip: int = 0, limit: int = 100, status: Optional[str] = None,
              db: Session = Depends(get_db)):
    logs = crud.get_logs(db, skip=skip, limit=limit, status=status)
    result = []
    import os
    from datetime import datetime, timedelta
    import glob
    faces_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../media/faces"))
    pattern = os.path.join(faces_dir, f"face_*.jpg")
    face_files = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=False)

    def find_face_for_log(log):
        if getattr(log, "face_image_url", None):
            return log.face_image_url
        log_time = getattr(log, "timestamp", None)
        if not log_time or not face_files:
            return None
        try:
            log_dt = log_time if isinstance(log_time, datetime) else datetime.fromisoformat(str(log_time))
        except Exception:
            return None

        best_file = None
        best_delta = timedelta.max
        for f in face_files:
            try:
                mtime = datetime.fromtimestamp(os.path.getmtime(f))
                delta = log_dt - mtime
                if delta.total_seconds() >= 0 and delta < best_delta:
                    best_delta = delta
                    best_file = f
            except Exception:
                continue
        if best_file:
            return f"/media/faces/{os.path.basename(best_file)}"
        return None

    for log in logs:
        log_dict = log.__dict__.copy()

        # Attach user_name
        if getattr(log, 'user_id', None) is not None:
            user = db.query(crud.models.User).filter(crud.models.User.id == log.user_id).first()
            log_dict["user_name"] = user.name if user else None
        else:
            log_dict["user_name"] = None
            
        # Attach face_image_url for this log only
        log_dict["face_image_url"] = find_face_for_log(log)
        result.append(schemas.LogOut(**log_dict))
    return result
