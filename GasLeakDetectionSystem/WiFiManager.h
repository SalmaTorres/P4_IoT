#ifndef WIFIMANAGER_H
#define WIFIMANAGER_H

#include <WiFi.h>

class WiFiManager {
  private:
    const char* ssid;
    const char* password;
  public:
    WiFiManager(const char* ssid, const char* password);
    void connect();
    bool isConnected();
};

#endif