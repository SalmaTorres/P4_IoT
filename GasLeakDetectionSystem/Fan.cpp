#include "Fan.h"

Fan::Fan(byte pin) {
  this->pin = pin;
  this->state = false;
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW); 
}

void Fan::turnOn() {
  state = true;
  digitalWrite(pin, HIGH);
}

void Fan::turnOff() {
  state = false;
  digitalWrite(pin, LOW);
}

void Fan::setState(bool state) {
  this->state = state;
  if(state)
    turnOn();
  else
    turnOff();
}

bool Fan::isOn() {
  return state;
}
