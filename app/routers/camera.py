from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io, cv2, face_recognition, numpy as np, requests, os, shutil
from ..database import get_db
from .. import crud, schemas
from ..serial_bridge import send_command


router = APIRouter()

# Global camera object to avoid repeated initialization
_camera = None
_camera_index = -1

def find_available_camera():
    """Find the first available camera index"""
    for i in range(10):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print(f"Found working camera at index {i}")
                return cap, i
            cap.release()
    return None, -1

def get_camera():
    """Get or initialize the camera"""
    global _camera, _camera_index
    
    if _camera is None or not _camera.isOpened():
        print("Initializing camera...")
        _camera, _camera_index = find_available_camera()
        
        if _camera is None:
            print("No working cameras found")
            raise HTTPException(
                status_code=503, 
                detail="No camera available. Please check camera connection and permissions."
            )
        
        print(f"Camera initialized at index {_camera_index}")
    
    return _camera

def mjpeg_generator():
    """MJPEG stream generator"""
    try:
        cap = get_camera()
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to read frame from camera")
                # Try to reinitialize camera
                global _camera
                _camera = None
                try:
                    cap = get_camera()
                    continue
                except:
                    break
            
            
            ret2, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if not ret2:
                print("Failed to encode frame")
                continue
                
            frame_bytes = jpeg.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
    except Exception as e:
        print(f"Error in MJPEG generator: {e}")
        error_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(error_frame, "Camera Error", (200, 240), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        ret, jpeg = cv2.imencode('.jpg', error_frame)
        if ret:
            frame_bytes = jpeg.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@router.get("/stream")
def stream():
    """Stream video from camera"""
    try:
        return StreamingResponse(
            mjpeg_generator(),
            media_type='multipart/x-mixed-replace; boundary=frame'
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stream endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start camera stream")



def validate_encoding(encoding_data, expected_dim=128):
    """Validate and potentially fix face encoding dimensions"""
    try:
        if isinstance(encoding_data, str):
            encoding_bytes = bytes.fromhex(encoding_data)
            encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
        else:
            encoding = np.array(encoding_data, dtype=np.float64)
        
        print(f"[DEBUG] Encoding shape: {encoding.shape}")
        
        if encoding.shape[0] == expected_dim:
            return encoding
        elif encoding.shape[0] > expected_dim:
            print(f"[WARNING] Truncating encoding from {encoding.shape[0]} to {expected_dim}")
            return encoding[:expected_dim]
        else:
            # Pad if too short
            print(f"[WARNING] Padding encoding from {encoding.shape[0]} to {expected_dim}")
            padded = np.zeros(expected_dim)
            padded[:encoding.shape[0]] = encoding
            return padded
            
    except Exception as e:
        print(f"[ERROR] Failed to validate encoding: {e}")
        return None

@router.post("/recognize", response_model=schemas.LogOut)
async def recognize(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        contents = await file.read()
        image = face_recognition.load_image_file(io.BytesIO(contents))
        locations = face_recognition.face_locations(image)

        # Save the uploaded image for logging
        face_image_url = None
        if locations:
            save_dir = os.path.join(os.path.dirname(__file__), "../media/faces")
            os.makedirs(save_dir, exist_ok=True)
            filename = f"face_{np.random.randint(0, 1_000_000)}_{np.random.randint(0, 1_000_000)}.jpg"
            save_path = os.path.abspath(os.path.join(save_dir, filename))
            with open(save_path, "wb") as f:
                f.write(contents)

            face_image_url = f"/media/faces/{filename}"

        if not locations:
            log = crud.log_access(db, user_id=None, status="no_face")
            send_command('X')
            return {
                "id": log.id,
                "user_id": None,
                "user_name": None,
                "status": "no_face",
                "timestamp": log.timestamp,
                "message": "No face detected",
                "face_image_url": face_image_url
            }
        
        encodings = face_recognition.face_encodings(image, locations)
        if not encodings:
            log = crud.log_access(db, user_id=None, status="no_encoding")
            send_command('X')
            return {
                "id": log.id,
                "user_id": None,
                "user_name": None,
                "status": "no_encoding",
                "timestamp": log.timestamp,
                "message": "Could not encode face",
                "face_image_url": face_image_url
            }
        
        # Get current face encoding
        current_encoding = encodings[0]
        print(f"[DEBUG] Current encoding shape: {current_encoding.shape}")
        
        # Validate current encoding
        current_encoding = validate_encoding(current_encoding)
        if current_encoding is None:
            log = crud.log_access(db, user_id=None, status="invalid_encoding")
            send_command('X')
            return {
                "id": log.id,
                "user_id": None,
                "user_name": None,
                "status": "invalid_encoding",
                "timestamp": log.timestamp,
                "message": "Invalid face encoding",
                "face_image_url": face_image_url
            }
        users = crud.get_users(db)
        valid_users = []
        try:
            users = crud.get_users(db)
            user_encodings = []
            user_id_map = {}
            for u in users:
                if u.face:
                    encoding = validate_encoding(u.face.encoding)
                    if encoding is not None:
                        user_encodings.append(encoding)
                        user_id_map[len(user_encodings)-1] = u
            if not user_encodings:
                log = crud.log_access(db, user_id=None, status="no_valid_users")
                send_command('X')
                return {
                    "id": log.id,
                    "user_id": None,
                    "user_name": None,
                    "status": "no_valid_users",
                    "timestamp": log.timestamp,
                    "message": "No valid user encodings available",
                    "face_image_url": face_image_url
                }
            # Calculate distances
            distances = face_recognition.face_distance(user_encodings, current_encoding)
            print(f"[DEBUG] Face distances: {distances}")
            if len(distances) > 0 and min(distances) < 0.4:
                best_match_index = int(np.argmin(distances))
                matched_user = user_id_map[best_match_index]
                user_id = matched_user.id
                user_name = matched_user.name
                if getattr(matched_user, 'active', True):
                    status = "granted"
                    send_command('O')
                    print(f"✅ Access granted for user {user_id}")
                    log = crud.log_access(db, user_id=user_id, status="granted")
                    return {
                        "id": log.id,
                        "user_id": user_id,
                        "user_name": user_name,
                        "status": status,
                        "timestamp": log.timestamp,
                        "message": f"Access granted to {user_name}",
                        "face_image_url": face_image_url
                    }
                else:
                    status = "denied"
                    send_command('X')
                    print(f"❌ Access denied - user {user_id} is inactive")
                    log = crud.log_access(db, user_id=user_id, status=status, face_encoding=current_encoding.tobytes().hex() if current_encoding is not None else None)
                    return {
                        "id": log.id,
                        "user_id": user_id,
                        "user_name": user_name,
                        "status": status,
                        "timestamp": log.timestamp,
                        "message": f"Access denied - user {user_name} is inactive",
                        "face_image_url": face_image_url
                    }
            else:
                user_id = None
                status = "denied"
                send_command('X')
                print("❌ Access denied - no matching face")
                log = crud.log_access(db, user_id=user_id, status=status, face_encoding=current_encoding.tobytes().hex() if current_encoding is not None else None)
                return {
                    "id": log.id,
                    "user_id": user_id,
                    "user_name": None,
                    "status": status,
                    "timestamp": log.timestamp,
                    "message": "Access denied - face not recognized",
                    "face_image_url": face_image_url
                }
        except Exception as e:
            print(f"[ERROR] Failed to load encoding for user: {e}")
            return {
                "id": log.id,
                "user_id": user_id, 
                "user_name": None,
                "status": status,
                "timestamp": log.timestamp,
                "message": "Access denied - face not recognized",
                "face_image_url": face_image_url
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Recognition error: {e}")
        log = crud.log_access(db, user_id=None, status="error")
        send_command('X')
        return {
            "id": log.id,
            "user_id": None,
            "user_name": None,
            "status": "error",
            "timestamp": log.timestamp,
            "message": f"Recognition failed: {str(e)}",
            "face_image_url": None
        }

@router.get("/status")
def camera_status():
    """Check camera status"""
    try:
        cap = get_camera()
        ret, frame = cap.read()
        if ret:
            return {
                "status": "available", 
                "camera_index": _camera_index,
                "frame_size": f"{frame.shape[1]}x{frame.shape[0]}"
            }
        else:
            return {"status": "error", "message": "Cannot read from camera"}
    except Exception as e:
        return {"status": "unavailable", "error": str(e)}

@router.post("/restart")
def restart_camera():
    """Restart camera connection"""
    global _camera
    try:
        if _camera:
            _camera.release()
        _camera = None
        
        #reinitialize
        cap = get_camera()
        return {
            "status": "restarted", 
            "camera_index": _camera_index,
            "message": "Camera restarted successfully"
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def cleanup_camera():
    """Clean up camera resources"""
    global _camera
    if _camera:
        _camera.release()
        _camera = None
        print("Camera resources cleaned up")
