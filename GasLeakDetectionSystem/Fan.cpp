#include "Fan.h"

Fan::Fan(byte pin) {
  this->pin = pin;
  this->state = "off";
  pinMode(pin, OUTPUT);
}

void Fan::turnOn() {
  state = "on";
  digitalWrite(pin, LOW);
}

void Fan::turnOff() {
  state = "off";
  digitalWrite(pin, HIGH);
}

String Fan::getState() {
  return state;
}
