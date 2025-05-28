#ifndef FAN_H
#define FAN_H

#include <Arduino.h>

class Fan {
private:
  byte pwma;
  byte ain1;
  byte ain2;
  byte stby;
  String state;

public:
  Fan(byte pwma, byte ain1, byte ain2, byte stby);
  void turnOn();
  void turnOff();
  String getState();
};

#endif
