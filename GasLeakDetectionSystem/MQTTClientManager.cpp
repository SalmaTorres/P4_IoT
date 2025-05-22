#include "MQTTClientManager.h"
#include <Arduino.h>

MQTTClientManager::MQTTClientManager(WiFiClientSecure& wifiClient, const char* broker, int port, const char* clientId)
: wifiClient(wifiClient), client(wifiClient), broker(broker), port(port), clientId(clientId), callback(nullptr) {}

void MQTTClientManager::setCallback(void (*cb)(char*, byte*, unsigned int)) {
  callback = cb;
  client.setCallback(callback);
}

void MQTTClientManager::reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    if (client.connect(clientId)) {
      Serial.println("conectado");
    } else {
      Serial.print("fallo, rc=");
      Serial.print(client.state());
      Serial.println(". Intentar de nuevo en 5 segundos.");
      delay(5000);
    }
  }
}

void MQTTClientManager::subscribe(const char* topic) {
  client.subscribe(topic);
  Serial.println("Subscrito a " + String(topic));
}

void MQTTClientManager::publish(const char* topic, const char* payload) {
  client.publish(topic, payload);
}

void MQTTClientManager::loop() {
  client.loop();
}

bool MQTTClientManager::isConnected() {
  return client.connected();
}

void MQTTClientManager::setServer(const char* broker, int port) {
  client.setServer(broker, port);
}