#include "GasSensor.h"
#include <math.h>

GasSensor::GasSensor(byte analogPin, float rlValue, float roCleanAirFactor, float* curve) {
  this->analogPin = analogPin;
  this->rlValue = rlValue;
  this->roCleanAirFactor = roCleanAirFactor;
  this->ro = 10.0;

  if (curve != nullptr) {
    gasCurve[0] = curve[0];
    gasCurve[1] = curve[1];
    gasCurve[2] = curve[2];
  } else {
    gasCurve[0] = 2.3;
    gasCurve[1] = 0.21; 
    gasCurve[2] = -0.47;
  }

  this->ppm = 0;
  this->gasLevelState = "Unknown";
}

void GasSensor::calibrate() {
  float val = 0;
  for (int i = 0; i < 50; i++) {
    val += calculateResistance(analogRead(analogPin));
    delay(200);
  }
  ro = (val / 50.0) / roCleanAirFactor;
}

void GasSensor::read() {
  float rs = 0;
  int valid = 0;
  for (int i = 0; i < 5; i++) {
    float r = calculateResistance(analogRead(analogPin));
    if (r > 0) { rs += r; valid++; }
    delay(50);
  }

  if (valid > 0) {
    rs /= valid;
    float ratio = rs / ro;
    ppm = computePPM(ratio);
  } else {
    ppm = 0;
  }

  if (ppm < 200) gasLevelState = "seguro";
  else if (ppm < 1000) gasLevelState = "precaucion";
  else if (ppm < 2000) gasLevelState = "revisar";
  else if (ppm < 5000) gasLevelState = "evacuar";
  else gasLevelState = "emergencia";
}


float GasSensor::calculateResistance(int adcValue) {
  if (adcValue <= 0) return -1;
  return (rlValue * (4095.0 - adcValue)) / adcValue;
}

int GasSensor::computePPM(float rs_ro_ratio) {
  if (rs_ro_ratio <= 0) return 0;
  float log_ppm = ((log10(rs_ro_ratio) - gasCurve[1]) / gasCurve[2]) + gasCurve[0];
  float ppm = pow(10, log_ppm);
  if (isnan(ppm) || isinf(ppm) || ppm > 10000) return 0;
  return (int)ppm;
}

int GasSensor::getPPM() {
  return ppm;
}

String GasSensor::getGasLevelState() {
  return gasLevelState;
}

float GasSensor::getRo() {
  return ro;
}
