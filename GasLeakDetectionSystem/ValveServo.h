#ifndef VALVE_SERVO_H
#define VALVE_SERVO_H

#include <Arduino.h>
#include <ESP32Servo.h>

class ValveServo {
private:
  byte pin;
  String state;
  Servo valve;

public:
  ValveServo(byte pin);
  void begin(); 
  void open(); 
  void close(); 
  void stop(); 
  String getState();
};

#endif
