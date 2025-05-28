#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

class Buzzer {
private:
  byte pin;
  String state;

public:
  Buzzer(byte pin);
  void turnOn();
  void turnOff();
  String getState();
};

#endif