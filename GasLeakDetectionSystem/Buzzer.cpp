#include "Buzzer.h"

Buzzer::Buzzer(byte pin) {
  this->pin =pin;
  this->state=false;
  pinMode(pin, OUTPUT);
  turnOff();
}

void Buzzer::turnOn() {
    state = true;
    digitalWrite(pin, HIGH);
}

void Buzzer::turnOff() {
    state = false;
    digitalWrite(pin, LOW);
}

void Buzzer::setState(bool state) {
    this->state = state;
    if(state)
      turnOn();
    else
      turnOff();
}

bool Buzzer::isOn() {
    return state;
}
