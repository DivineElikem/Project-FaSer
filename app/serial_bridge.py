import serial
import threading
import time
import os

SERIAL_PORT = os.getenv("SERIAL_PORT", "/dev/ttyACM0")
BAUD_RATE = int(os.getenv("BAUD_RATE", "9600"))

ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)

time.sleep(2)

lock = threading.Lock()

def send_command(cmd: str):
    """Send single-character command to Arduino in a thread-safe way"""
    with lock:
        ser.write(cmd.encode())