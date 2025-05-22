#ifndef MQTTCLIENTMANAGER_H
#define MQTTCLIENTMANAGER_H

#include <PubSubClient.h>
#include <WiFiClientSecure.h>

class MQTTClientManager {
  private:
    WiFiClientSecure& wifiClient;
    PubSubClient client;
    const char* broker;
    int port;
    const char* clientId;
    void (*callback)(char*, byte*, unsigned int);
  public:
    MQTTClientManager(WiFiClientSecure& wifiClient, const char* broker, int port, const char* clientId);
    void setCallback(void (*callback)(char*, byte*, unsigned int));
    void reconnect();
    void subscribe(const char* topic);
    void publish(const char* topic, const char* payload);
    void loop();
    bool isConnected();
    void setServer(const char* broker, int port);

};

#endif