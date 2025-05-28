#include "Fan.h"

Fan::Fan(byte pwma, byte ain1, byte ain2, byte stby) {
  this->pwma = pwma;
  this->ain1 = ain1;
  this->ain2 = ain2;
  this->stby = stby;
  this->state = "off";
  pinMode(pwma, OUTPUT);
  pinMode(ain1, OUTPUT);
  pinMode(ain2, OUTPUT);
  pinMode(stby, OUTPUT);
}

void Fan::turnOn() {
  state = "on";
  digitalWrite(ain1, HIGH);
  digitalWrite(ain2, LOW);
  digitalWrite(pwma, HIGH);
}

void Fan::turnOff() {
  state = "off";
  digitalWrite(pwma, LOW);
  digitalWrite(ain1, LOW);
  digitalWrite(ain2, LOW);
}

String Fan::getState() {
  return state;
}
