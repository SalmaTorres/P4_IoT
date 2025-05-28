#include "Fan.h"

Fan::Fan(byte pin) {
  this->pin = pin;
  this->state = "off";
  pinMode(pin, OUTPUT);
}

void Fan::turnOn() {
  state = "on";
  digitalWrite(pin, HIGH);
}

void Fan::turnOff() {
  state = "off";
  digitalWrite(pin, LOW);
}

String Fan::getState() {
  return state;
}
