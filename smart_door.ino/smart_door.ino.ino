#include <Servo.h>

Servo doorServo;
const int servoPin = 11;  // Pin for the servo
const int ledGreen = 8;  // Green LED for access granted
const int ledRed = 9;    // Red LED for access denied
const int buzzer = 10;    // Buzzer for alerts

void setup() {
    Serial.begin(9600);
    doorServo.attach(servoPin);
    pinMode(ledGreen, OUTPUT);
    pinMode(ledRed, OUTPUT);
    pinMode(buzzer, OUTPUT);

    // Initial state: door locked, all indicators off
    doorServo.write(0);
    digitalWrite(ledGreen, LOW);
    digitalWrite(ledRed, LOW);
    noTone(buzzer);

    // Debug message to confirm startup
    Serial.println("Arduino is ready.");
}

void loop() {
    if (Serial.available()) {
        char command = Serial.read();
        Serial.print("Received command: ");
        Serial.println(command);
        
        if (command == 'O') {  // Open door
            Serial.println("Executing open door sequence.");
            digitalWrite(ledGreen, HIGH);
            tone(buzzer, 1000);
            delay(500);
            noTone(buzzer);
            doorServo.write(90);  // Unlock
            delay(5000);  // Door open for 5 seconds
            doorServo.write(0);   // Lock door
            digitalWrite(ledGreen, LOW);
            Serial.println("Door closed. Sequence complete.");
        } else if (command == 'X') {  // Deny access
            Serial.println("Executing deny access sequence.");
            digitalWrite(ledRed, HIGH);
            tone(buzzer, 1000);
            delay(1000);
            noTone(buzzer);
            digitalWrite(ledRed, LOW);
            Serial.println("Access denied sequence complete.");
        } else if (command == 'N') {  // No face detected
            Serial.println("No face detected. Maintaining current state.");
        } else if (command == 'B') {  // Buzzer alert for 10 seconds
            Serial.println("Executing buzzer alert for 10 seconds due to repeated failed attempts.");
            tone(buzzer, 1000);
            delay(10000);
            noTone(buzzer);
            Serial.println("Buzzer alert complete.");
        }
    }
}
