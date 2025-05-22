#ifndef BUZZER_H
#define BUZZER_H

#include <Arduino.h>

class Buzzer {
private:
  byte pin;
  bool state;

public:
  Buzzer(byte pin);
  void turnOn();
  void turnOff();
  void setState(bool state);
  bool isOn();
};

#endif