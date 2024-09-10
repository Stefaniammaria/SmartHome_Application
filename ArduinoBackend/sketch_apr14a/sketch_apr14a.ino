/*
 * WebSocketClientSocketIOack.ino
 *
 *  Created on: 20.07.2019
 *
 */

#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>

#include <ArduinoJson.h>
#include <SocketIOclient.h>
#include "Adafruit_HTU21DF.h"
#include <Servo.h>

//RGB
#define PIN_RED 12
#define PIN_GREEN 13
#define PIN_BLUE 14

// FAN
#define FANPIN 32

//BUZZER
#define BUZZER 4

//MOVEMENT
#define MOVEMENT 15

static const int servoPin = 33;


WiFiMulti WiFiMulti;
SocketIOclient socketIO;

#define USE_SERIAL Serial

Adafruit_HTU21DF htu = Adafruit_HTU21DF();

Servo windowServo;
int servoAngle = 0;

int isAlarmArmed = 0;

const int led1Pin = 18;
int led1Value = 0;

int alarmCounter = 0;

int r = 0;
int g = 0;
int b = 0;

int isAcOn = 0;
float desiredTemp = 0;

const int pwmChannel = 12;       // PWM channel (0-15)
const int pwmFrequency = 7000;  // PWM frequency in Hz
const int pwmResolution = 8;

const int pwmChannelRed = 15;
const int pwmChannelGreen = 14;
const int pwmChannelBlue = 13;

void socketIOEvent(socketIOmessageType_t type, uint8_t *payload, size_t length) {
  switch (type) {
    case sIOtype_DISCONNECT:
      USE_SERIAL.printf("[IOc] Disconnected!\n");
      break;
    case sIOtype_CONNECT:
      USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

      // join default namespace (no auto join in Socket.IO V3)
      socketIO.send(sIOtype_CONNECT, "/");
      registerSensors("92eae868-6438-4e89-b90d-77d45949a4a6", "Led");
      registerSensors("5c61b6cc-63f7-4928-825c-c99799b22fd2", "Window");
      registerSensors("77ba5e5c-7d70-47ff-bebb-a58b9b2d665f", "Alarm");
      registerSensors("301ce96d-df35-41db-b0cc-e08a37895722", "TempHum");
      registerSensors("4b926b5e-405e-40bf-ba76-efe6c36e5bd8", "RGBLed");
      registerSensors("7b5150ac-cf65-48b3-b5e2-bd7d84c826b0", "AC");

      break;
    case sIOtype_EVENT:
      {
        char *sptr = NULL;
        int id = strtol((char *)payload, &sptr, 10);
        USE_SERIAL.printf("[IOc] get event: %s id: %d\n", payload, id);
        if (id) {
          payload = (uint8_t *)sptr;
        }
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, payload, length);
        if (error) {
          USE_SERIAL.print(F("deserializeJson() failed: "));
          USE_SERIAL.println(error.c_str());
          return;
        }

        String eventName = doc[0];
        USE_SERIAL.printf("[IOc] event name: %s\n", eventName.c_str());

        if (eventName == "Led") {
          if (doc[1]["sensorId"] == "92eae868-6438-4e89-b90d-77d45949a4a6") {
            int value = doc[1]["value"];
            led1Value = value;
            USE_SERIAL.printf("[IOc] led comand value: %d\n", value);
            digitalWrite(led1Pin, value);
          }
        }
        if (eventName == "Window") {
          if (doc[1]["sensorId"] == "5c61b6cc-63f7-4928-825c-c99799b22fd2") {
            int value = doc[1]["value"];
            servoAngle = value;
            USE_SERIAL.printf("[IOc] window comand value: %d\n", value);
            windowServo.write(value);
          }
        }
        if (eventName == "Alarm") {
          if (doc[1]["sensorId"] == "77ba5e5c-7d70-47ff-bebb-a58b9b2d665f") {
            isAlarmArmed = doc[1]["value"];
            USE_SERIAL.printf("[IOc] Alarm comand value: %d\n", isAlarmArmed);
          }
        }
        if (eventName == "RGBLed") {
          if (doc[1]["sensorId"] == "4b926b5e-405e-40bf-ba76-efe6c36e5bd8") {
            r = doc[1]["r"];
            g = doc[1]["g"];
            b = doc[1]["b"];
            USE_SERIAL.printf("[IOc] RGB Led values are: %d %d %d \n", r, g, b);
          }
        }
        if (eventName == "AC") {
          if (doc[1]["sensorId"] == "7b5150ac-cf65-48b3-b5e2-bd7d84c826b0") {
            isAcOn = doc[1]["value"];
            desiredTemp = doc[1]["opValue"];
            USE_SERIAL.printf("[IOc] AC comand value is: %d and desired temp is: %lf\n", isAcOn, desiredTemp);

            if (desiredTemp != 0) {
              float currentTemp = htu.readTemperature();
              if (desiredTemp < currentTemp) {
                digitalWrite(FANPIN, 1);
                isAcOn = 1;
                sendSensorsStatus();
              } else {
                digitalWrite(FANPIN, 0);
                isAcOn = 0;
                sendSensorsStatus();
              }
            } else {

              digitalWrite(FANPIN, isAcOn);
            }
          }
        }
        sendSensorsStatus();
      }
      break;
    case sIOtype_ACK:
      USE_SERIAL.printf("[IOc] get ack: %u\n", length);
      break;
    case sIOtype_ERROR:
      USE_SERIAL.printf("[IOc] get error: %u\n", length);
      break;
    case sIOtype_BINARY_EVENT:
      USE_SERIAL.printf("[IOc] get binary: %u\n", length);
      break;
    case sIOtype_BINARY_ACK:
      USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
      break;
  }
}

void registerSensors(String id, String type) {
  // creat JSON message for Socket.IO (event)
  DynamicJsonDocument doc(1024);
  JsonArray array = doc.to<JsonArray>();

  array.add("register-sensor");

  JsonObject param1 = array.createNestedObject();
  param1["id"] = id;
  param1["type"] = type;

  // JSON to String (serializion)
  String output;
  serializeJson(doc, output);

  // Send event
  socketIO.sendEVENT(output);
  // Print JSON for debugging
  USE_SERIAL.println(output);
}

void sendSensorsStatus() {
  // creat JSON message for Socket.IO (event)
  DynamicJsonDocument doc(2048);
  JsonArray array = doc.to<JsonArray>();

  // add evnet name
  // Hint: socket.on('event_name', ....
  array.add("data");

  JsonArray payload = array.createNestedArray();


  // add payload (parameters) for the event
  JsonObject param1 = payload.createNestedObject();
  param1["id"] = "301ce96d-df35-41db-b0cc-e08a37895722";
  param1["type"] = "TempHum";
  param1["TEMP"] = htu.readTemperature();
  param1["HUM"] = htu.readHumidity();

  JsonObject param2 = payload.createNestedObject();
  param2["id"] = "92eae868-6438-4e89-b90d-77d45949a4a6";
  param2["type"] = "Led";
  param2["LED"] = led1Value;

  JsonObject param3 = payload.createNestedObject();
  param3["id"] = "5c61b6cc-63f7-4928-825c-c99799b22fd2";
  param3["type"] = "Window";
  param3["WIN"] = servoAngle;

  JsonObject param4 = payload.createNestedObject();
  param4["id"] = "77ba5e5c-7d70-47ff-bebb-a58b9b2d665f";
  param4["type"] = "Alarm";
  param4["ALARM"] = isAlarmArmed;
  param4["MOVED"] = alarmCounter > 1000 ? true : false;

  JsonObject param5 = payload.createNestedObject();
  param5["id"] = "4b926b5e-405e-40bf-ba76-efe6c36e5bd8";
  param5["type"] = "RGBLed";
  param5["R"] = r;
  param5["G"] = g;
  param5["B"] = b;

  JsonObject param6 = payload.createNestedObject();
  param6["id"] = "7b5150ac-cf65-48b3-b5e2-bd7d84c826b0";
  param6["type"] = "AC";
  param6["AC"] = isAcOn;
  param6["DT"] = desiredTemp;

  // JSON to String (serializion)
  String output;
  serializeJson(doc, output);

  // Send event
  socketIO.sendEVENT(output);
  // Print JSON for debugging
  USE_SERIAL.println(output);
}

void setup() {
  //USE_SERIAL.begin(921600);
  USE_SERIAL.begin(115200);

  if (!htu.begin()) {
    Serial.println("Check circuit. HTU21D not found!");
    while (1)
      ;
  }

  //BUZZER setup
  ledcSetup(pwmChannel, pwmFrequency, pwmResolution);
  ledcAttachPin(BUZZER, pwmChannel);

  pinMode(led1Pin, OUTPUT);  //simple led
  pinMode(MOVEMENT, INPUT);  //movement

  //RGB LED
  // pinMode(PIN_RED,   OUTPUT);
  // pinMode(PIN_GREEN, OUTPUT);
  // pinMode(PIN_BLUE,  OUTPUT);
  ledcSetup(pwmChannelRed, pwmFrequency, pwmResolution);
  ledcAttachPin(PIN_RED, pwmChannelRed);
  ledcSetup(pwmChannelGreen, pwmFrequency, pwmResolution);
  ledcAttachPin(PIN_GREEN, pwmChannelGreen);
  ledcSetup(pwmChannelBlue, pwmFrequency, pwmResolution);
  ledcAttachPin(PIN_BLUE, pwmChannelBlue);

  //MOTOR
  pinMode(FANPIN, OUTPUT);

  windowServo.attach(servoPin);  // attaches the servo on pin 18 to the servo object

  //Serial.setDebugOutput(true);
  USE_SERIAL.setDebugOutput(true);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for (uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  //WiFiMulti.addAP("DIGI-93gr", "B4nw8uKH");
  WiFi.softAP("StephsESP32", "12345678");

  //WiFi.disconnect();
  // while (WiFiMulti.run() != WL_CONNECTED) {
  //   delay(100);
  // }

  String ip = WiFi.softAPIP().toString();
  USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

  // server address, port and URL
  socketIO.begin("192.168.4.2", 5050, "/socket.io/?EIO=4");

  // event handler
  socketIO.onEvent(socketIOEvent);
}


unsigned long messageTimestamp = 0;
void loop() {
  socketIO.loop();


  // Serial.println("Scanning for WiFi networks...");
  // int n = WiFi.scanNetworks();
  // if (n == 0) {
  //   Serial.println("No networks found");
  // } else {
  //   Serial.print(n);
  //   Serial.println(" networks found");
  //   for (int i = 0; i < n; ++i) {
  //     Serial.print(i + 1);
  //     Serial.print(": ");
  //     Serial.print(WiFi.SSID(i));
  //     Serial.print(" (");
  //     Serial.print(WiFi.RSSI(i));
  //     Serial.print(")");
  //     Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN) ? " " : "*");
  //     delay(10);
  //   }
  // }
  // Serial.println("");
  // delay(5000);



  ledcWrite(pwmChannelRed, r);
  ledcWrite(pwmChannelGreen, g);
  ledcWrite(pwmChannelBlue, b);

  if (desiredTemp != 0) {
    float currentTemp = htu.readTemperature();
    if (desiredTemp < currentTemp) {
      digitalWrite(FANPIN, 1);
      isAcOn = 1;
    } else {
      digitalWrite(FANPIN, 0);
      isAcOn = 0;
    }
  } else {
    digitalWrite(FANPIN, isAcOn);
  }

  int val = digitalRead(MOVEMENT);

  if (val) {
    alarmCounter++;
  } else {
    alarmCounter = 0;
  }

  if (isAlarmArmed) {
    if (alarmCounter > 1000) {
      //analogWrite(BUZZER, 80);
      ledcWrite(pwmChannel, 100);
    } else {
      //analogWrite(BUZZER, 0);
      ledcWrite(pwmChannel, 0);
    }
  } else {
    //analogWrite(BUZZER, 0);
    ledcWrite(pwmChannel, 0);
  }

  uint64_t now = millis();

  if (now - messageTimestamp > 5000) {
    messageTimestamp = now;
    sendSensorsStatus();
  }
}