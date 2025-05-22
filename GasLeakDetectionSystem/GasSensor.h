#ifndef GAS_SENSOR_H
#define GAS_SENSOR_H

#include <Arduino.h>

class GasSensor {
private:
  byte analogPin;
  float rlValue;
  float roCleanAirFactor;
  float gasCurve[3]; 
  float ro;
  int ppm;
  String gasLevelState;

  float calculateResistance(int adcValue);
  int computePPM(float rs_ro_ratio);

public:
  GasSensor(byte analogPin, float rlValue = 10.0, float roCleanAirFactor = 9.83, float* curve = nullptr);
  void calibrate();
  void read(); 
  int getPPM();  
  String getGasLevelState(); 
  float getRo(); 
};

#endif
