#ifndef FAN_H
#define FAN_H

#include <Arduino.h>

class Fan {
private:
  byte pin;
  String state;

public:
  Fan(byte pin);
  void turnOn();
  void turnOff();
  String getState();
};

#endif
