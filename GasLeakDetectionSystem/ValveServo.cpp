#include "ValveServo.h"

ValveServo::ValveServo(byte pin) {
  this->pin = pin;
  this->state = "closed";
}

void ValveServo::begin() {
  valve.setPeriodHertz(50);
}

void ValveServo::open() {
  valve.attach(pin, 1000, 2000);
  Serial.println("Abriendo válvula...");
  valve.writeMicroseconds(1700);
  delay(700);
  state = "open";
  stop();
  Serial.println("Válvula abierta.");
}

void ValveServo::close() {
  valve.attach(pin, 1000, 2000);
  Serial.println("Cerrando válvula...");
  valve.writeMicroseconds(1300);
  delay(700);
  state = "closed";
  stop();
  Serial.println("Válvula cerrada.");
}

void ValveServo::stop() {
  valve.detach();
}

String ValveServo::getState() {
  return state;
}
