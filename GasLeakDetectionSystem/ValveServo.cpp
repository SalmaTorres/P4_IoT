#include "ValveServo.h"

ValveServo::ValveServo(byte pin) {
  this->pin = pin;
  this->isOpen = false;
}

void ValveServo::begin() {
  servo.setPeriodHertz(50);
  servo.attach(pin, 1000, 2000); 
  stop();
}

void ValveServo::open() {
  servo.writeMicroseconds(1700);
  delay(700);
  stop();
  isOpen = true;
}

void ValveServo::close() {
  servo.writeMicroseconds(1300);
  delay(700);
  stop();
  isOpen = false;
}

void ValveServo::stop() {
  servo.writeMicroseconds(1500);
}

void ValveServo::setState(bool open) {
  open ? this->open() : this->close();
}

bool ValveServo::getState() {
  return isOpen;
}
