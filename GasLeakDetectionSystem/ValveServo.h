#ifndef VALVE_SERVO_H
#define VALVE_SERVO_H

#include <Arduino.h>
#include <ESP32Servo.h>

class ValveServo {
private:
  byte pin;
  bool isOpen;
  Servo servo;

public:
  ValveServo(byte pin);
  void begin(); 
  void open(); 
  void close(); 
  void stop(); 
  void setState(bool open);
  bool getState();
};

#endif
