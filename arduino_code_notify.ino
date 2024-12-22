#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_GFX.h>
#include <Max72xxPanel.h>
#include <DFRobotDFPlayerMini.h>
#include <vector>
#include <map>

// Wi-Fi credentials
const char* ssid = "SSID"; //Zde zadejte své SSID
const char* password = "PASS"; //Zde zadejte své heslo

// Web server API
const char* serverName = "https://restaurant-ordering-backend.onrender.com/api/orders"; //ZDe je potřeba vypnlit svůj api server

// LED matrix setup
const int pinCS = 5;      // Chip Select pin
const int hDisplays = 4;  // Počet horizontálních displejů (4)
const int vDisplays = 1;  // Počet vertikálních displejů (1)
Max72xxPanel matrix(pinCS, hDisplays, vDisplays);

// DFPlayer setup
HardwareSerial mySerial(1);  // Use UART1
DFRobotDFPlayerMini myDFPlayer;

// Track processed orders and their display counts
std::map<int, int> orderDisplayCounts;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  mySerial.begin(9600, SERIAL_8N1, 16, 17); // RX on GPIO16, TX on GPIO17

  // Initialize DFPlayer
  if (!myDFPlayer.begin(mySerial)) {
    Serial.println(F("DFPlayer initialization failed!"));
    while (true);
  }
  Serial.println(F("DFPlayer Mini online."));
  myDFPlayer.volume(10);  // Set volume value. From 0 to 30

  // Initialize Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");

  // Initialize LED matrix
  matrix.setIntensity(1); // Brightness level
  matrix.fillScreen(LOW); // Clear screen
  matrix.write();

  // Rotate and map the LED matrix panels
  for (int i = 0; i < hDisplays; i++) {
    matrix.setRotation(i, 1); // Set rotation for proper horizontal orientation
  }

  // Show startup message
  displayMessage("System Ready");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);

    int httpResponseCode = http.GET();
    if (httpResponseCode == 200) {
      String response = http.getString();
      Serial.println("Server response: " + response);
      handleServerResponse(response);
    } else {
      Serial.printf("Error: %d\n", httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi disconnected!");
    WiFi.reconnect();
  }

  delay(5000); // Poll server every 5 seconds
}

void handleServerResponse(String response) {
  int orderStart = response.indexOf("{\"id\":");
  while (orderStart != -1) {
    int idStart = response.indexOf("\"id\":", orderStart) + 5;
    int idEnd = response.indexOf(",", idStart);
    int orderId = response.substring(idStart, idEnd).toInt();

    // If the order hasn't been processed twice
    if (orderDisplayCounts[orderId] < 2) {
      int statusIndex = response.indexOf("\"status\":\"completed\"", orderStart);
      if (statusIndex != -1) {
        int tableIndex = response.indexOf("\"tableNumber\":", orderStart) + 14;
        int tableEnd = response.indexOf(",", tableIndex);
        int tableNumber = response.substring(tableIndex, tableEnd).toInt();

        // Display and play audio only once
        if (orderDisplayCounts[orderId] == 0) {
          playAudio(tableNumber); // Play audio once
        }

        notifyOrderReady(tableNumber);
        orderDisplayCounts[orderId]++;
      }
    }
    orderStart = response.indexOf("{\"id\":", orderStart + 1);
  }
}

void notifyOrderReady(int tableNumber) {
  // Display message on LED matrix
  String message = "Objednavka pro stul " + String(tableNumber) + " pripravena";
  displayMessage(message);

  // Clear display after showing message
  matrix.fillScreen(LOW);
  matrix.write();
}

void displayMessage(String text) {
  int textLength = text.length();
  int scrollWidth = textLength * 6 + hDisplays * 8; // Total width for scrolling
  for (int i = hDisplays * 8; i > -scrollWidth; i--) { // Scroll from left to right
    matrix.fillScreen(LOW);
    matrix.setCursor(i, 0); // Set cursor for horizontal scrolling
    matrix.print(text);
    matrix.write();
    delay(50); // Adjust speed of scrolling
  }
}

void playAudio(int tableNumber) {
  if (tableNumber > 0 && tableNumber <= 8) {
    myDFPlayer.play(tableNumber); // Play the corresponding MP3 file
    Serial.println("Playing audio for table: " + String(tableNumber));
  } else {
    Serial.println("Invalid table number for audio playback!");
  }
}
