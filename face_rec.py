import cv2
import face_recognition
import numpy as np
import serial
import time
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User, Face, AccessLog



# Initialize Serial for Arduino
try:
    arduino = serial.Serial("/dev/ttyACM0", 9600, timeout=1)
    time.sleep(2)
except serial.SerialException as e:
    print(f"Error initializing serial port: {e}")
    arduino = None

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


cap, camera_index = find_available_camera()
failed_attempts = 0

def clear_invalid_encodings():
    print("[INFO] clear_invalid_encodings() not implemented. No action taken.")

# validate encoding (hex format)
def validate_encoding(encoding_data, expected_dim=128):
    try:
        if isinstance(encoding_data, str):
            encoding_bytes = bytes.fromhex(encoding_data)
            encoding = np.frombuffer(encoding_bytes, dtype=np.float64)
        else:
            encoding = np.array(encoding_data, dtype=np.float64)
        if encoding.shape[0] == expected_dim:
            return encoding
        elif encoding.shape[0] > expected_dim:
            print(f"[WARNING] Truncating encoding from {encoding.shape[0]} to {expected_dim}")
            return encoding[:expected_dim]
        else:
            print(f"[WARNING] Padding encoding from {encoding.shape[0]} to {expected_dim}")
            padded = np.zeros(expected_dim)
            padded[:encoding.shape[0]] = encoding
            return padded
    except Exception as e:
        print(f"[ERROR] Failed to validate encoding: {e}")
        return None

# log access (API-compatible)
def log_access(name, status, face_encoding=None):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.name == name).first()
        if not user and name not in ["Unknown", "None"]:
            user = User(name=name, active=True)
            db.add(user)
            db.commit()
            db.refresh(user)
        log = AccessLog(user_id=user.id if user else None, status=status, face_encoding=face_encoding)
        db.add(log)
        db.commit()
    finally:
        db.close()

def load_faces():
    db: Session = SessionLocal()
    try:
        faces = db.query(Face).all()
        names = []
        encodings = []
        print(f"[DEBUG] Found {len(faces)} faces in database")
        for face in faces:
            try:
                if face.user is None:
                    print(f"[WARNING] Skipping face id={face.id} with missing user (orphaned face record)")
                    continue
                encoding = validate_encoding(face.encoding)
                if encoding is not None:
                    names.append(face.user.name)
                    encodings.append(encoding)
                    print(f"[DEBUG] Loaded face for {face.user.name}")
                else:
                    print(f"[WARNING] Skipping invalid encoding for {face.user.name}")
            except Exception as e:
                user_name = face.user.name if face.user else f"<no user, face id={face.id}>"
                print(f"[ERROR] Failed to load face for {user_name}: {e}")
        return names, encodings
    finally:
        db.close()

# Initialize known_names and known_faces
known_names, known_faces = load_faces()


# Register a New Face with proper encoding
def register_new_face(name):
    global known_names, known_faces
    if cap is None:
        print("[ERROR] No camera available. Cannot register new face.")
        return False
    print(f"Registering new face for {name}... Look at the camera.")
    for attempt in range(10):
        ret, frame = cap.read()
        if not ret:
            print(f"Failed to read frame on attempt {attempt + 1}")
            continue
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        if face_encodings:
            encoding = face_encodings[0]
            print(f"[DEBUG] New encoding shape: {encoding.shape}")
            encoding = np.array(encoding, dtype=np.float64)
            encoding_hex = encoding.tobytes().hex()
            db: Session = SessionLocal()
            try:
                user = User(name=name, active=True)
                db.add(user)
                db.commit()
                db.refresh(user)
                face = Face(user_id=user.id, encoding=encoding_hex)
                db.add(face)
                db.commit()
                known_names, known_faces = load_faces()
                print(f"✅ Face registered successfully for {name}!")
                return True
            except Exception as e:
                db.rollback()
                print(f"Error registering face: {e}")
                return False
            finally:
                db.close()

        # Show current frame during registration
        cv2.imshow("Face Registration", frame)
        cv2.waitKey(100)
        time.sleep(0.5)
    print("❌ Face registration failed. Try again.")
    return False

def process_detection(frame):
    global failed_attempts, known_names, known_faces
    if cap is None:
        print("[ERROR] No camera available. Cannot process detection.")
        return
    print("Processing detection...")
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
    print(f"[DEBUG] Detected {len(face_locations)} face(s)")
    if len(face_locations) == 0:
        print("No face detected")
        if arduino:
            arduino.write(b'X')
        log_access("None", "No Object Detected")
        failed_attempts += 1
        print(f"Failed attempts: {failed_attempts}")
        if failed_attempts >= 3:
            print("3 consecutive failed attempts detected. Sending buzzer alert command.")
            if arduino:
                arduino.write(b'B')
            failed_attempts = 0
        return
    known_face_found = False
    # Process each detected face
    for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
        print(f"[DEBUG] Current face encoding shape: {face_encoding.shape}")
        if known_faces:
            try:
                # Ensure all encodings have the same shape
                face_encoding = validate_encoding(face_encoding)
                if face_encoding is None:
                    print("[ERROR] Invalid face encoding detected")
                    continue
                # Validate known faces shapes
                valid_known_faces = []
                valid_known_names = []
                for i, known_encoding in enumerate(known_faces):
                    validated = validate_encoding(known_encoding)
                    if validated is not None and validated.shape == face_encoding.shape:
                        valid_known_faces.append(validated)
                        valid_known_names.append(known_names[i])
                if not valid_known_faces:
                    print("[WARNING] No valid known faces to compare against")
                    name = "Unknown"
                    status = "Denied"
                else:
                    distances = face_recognition.face_distance(valid_known_faces, face_encoding)
                    print(f"[DEBUG] Face distances: {distances}")
                    best_match_index = np.argmin(distances)
                    if distances[best_match_index] < 0.4:
                        name = valid_known_names[best_match_index]
                        status = "Granted"
                        known_face_found = True
                        print(f"✅ Access Granted: {name}")
                    else:
                        name = "Unknown"
                        status = "Denied"
                        print("❌ Access Denied!")
                log_access(name, status)
            except Exception as e:
                print(f"[ERROR] Face comparison failed: {e}")
                name = "Unknown"
                status = "Denied"
                log_access(name, status)
        else:
            print("No known faces loaded!")
            name = "Unknown"
            status = "Denied"
            log_access(name, status)
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        cv2.putText(frame, name, (left, top - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    if known_face_found:
        failed_attempts = 0
        print("Sending unlock command to Arduino.")
        if arduino:
            arduino.write(b'O')
        time.sleep(6)
    else:
        failed_attempts += 1
        print("Sending access denied command to Arduino.")
        if arduino:
            arduino.write(b'X')
        print(f"Failed attempts: {failed_attempts}")
        if failed_attempts >= 3:
            print("3 consecutive failed attempts detected. Sending buzzer alert command.")
            if arduino:
                arduino.write(b'B')
            failed_attempts = 0
    cv2.imshow("Face Recognition Door", frame)

# Main Loop
print("Commands:")
print("  'd' - detect faces")
print("  'r' - register a new user")
print("  'c' - clear invalid encodings")
print("  'q' - quit")

if cap is None:
    print("[ERROR] No camera found. Exiting.")
    exit(1)

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to read frame from camera")
            time.sleep(0.1)
            continue
        cv2.imshow("Face Recognition Door", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            new_name = input("Enter new user name: ")
            register_new_face(new_name)
        elif key == ord('d'):
            process_detection(frame)
        elif key == ord('c'):
            print("Clearing invalid encodings...")
            clear_invalid_encodings()
            known_names, known_faces = load_faces()
except KeyboardInterrupt:
    print("\nShutting down...")
finally:
    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()
    if arduino:
        arduino.close()
    print("Cleanup completed.")
