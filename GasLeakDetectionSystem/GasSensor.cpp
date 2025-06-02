#include "GasSensor.h"

// Constructor
GasSensor::GasSensor(byte analogPin, float rlValue, float roCleanAirFactor, float* curve) {
  this->analogPin = analogPin;
  this->rlValue = rlValue;
  this->roCleanAirFactor = roCleanAirFactor;
  
  // Valores por defecto para curva MQ2-LPG si no se proporciona una
  if (curve == nullptr) {
    this->gasCurve[0] = 2.3;
    this->gasCurve[1] = 0.21;
    this->gasCurve[2] = -0.47;
  } else {
    this->gasCurve[0] = curve[0];
    this->gasCurve[1] = curve[1];
    this->gasCurve[2] = curve[2];
  }
  
  this->ro = 10.0;
  this->ppm = 0;
  this->gasLevelState = "Normal";
}

void GasSensor::calibrate() {
  Serial.println("Calibrando sensor MQ-2 en aire limpio...");
  float val = 0;
  for (int i = 0; i < 50; i++) {
    val += calculateResistance(analogRead(analogPin));
    delay(200);
  }
  ro = (val / 50.0) / roCleanAirFactor;
  Serial.print("Calibración completada. Ro = ");
  Serial.print(ro);
  Serial.println(" KΩ");
}

void GasSensor::read() {
  float rs = 0;
  int n = 0;
  
  // Promedio de 5 lecturas
  for (int i = 0; i < 5; i++) {
    float r = calculateResistance(analogRead(analogPin));
    if (r > 0) { 
      rs += r; 
      n++; 
    }
    delay(50);
  }
  
  if (ppm < 200) gasLevelState = "seguro";
  else if (ppm < 1000) gasLevelState = "precaucion";
  else if (ppm < 2000) gasLevelState = "revisar";
  else if (ppm < 5000) gasLevelState = "evacuar";
  else gasLevelState = "emergencia";
}

int GasSensor::getPPM() {
  return ppm;
}

String GasSensor::getGasLevel() {
  return gasLevelState;
}

float GasSensor::getRo() {
  return ro;
}

float GasSensor::calculateResistance(int adcValue) {
  if (adcValue <= 0) return -1;
  return ((float)rlValue * (4095.0 - adcValue)) / adcValue;
}

int GasSensor::computePPM(float rs_ro_ratio) {
  if (rs_ro_ratio <= 0) return 0;
  
  float log_ppm = ((log10(rs_ro_ratio) - gasCurve[1]) / gasCurve[2]) + gasCurve[0];
  float ppm_calc = pow(10, log_ppm);
  
  if (isnan(ppm_calc) || isinf(ppm_calc) || ppm_calc > 10000) return 0;
  
  return (int)ppm_calc;
}