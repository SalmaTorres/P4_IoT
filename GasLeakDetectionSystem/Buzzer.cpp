#include "Buzzer.h"

Buzzer::Buzzer(byte pin) {
  this->pin = pin;
  this->state = "off";
  pinMode(pin, OUTPUT);
}

void Buzzer::turnOn() {
  digitalWrite(pin, HIGH);
  state = "on";
}

void Buzzer::turnOff() {
  digitalWrite(pin, LOW);
  state = "off";
}

String Buzzer::getState() {
  return state;
}