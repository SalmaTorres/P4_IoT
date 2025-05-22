#ifndef FAN_H
#define FAN_H

#include <Arduino.h>

class Fan {
private:
  byte pin;
  bool state;

public:
  Fan(byte pin);
  void turnOn();
  void turnOff();
  void setState(bool state);
  bool isOn();
};

#endif
