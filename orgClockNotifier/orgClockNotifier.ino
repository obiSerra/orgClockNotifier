/*
Arduino 2x16 LCD - Detect Buttons
modified on 18 Feb 2019
by Saeed Hosseini @ Electropeak
https://electropeak.com/learn/
*/

#include <LiquidCrystal.h>

//LCD pin to Arduino
const int pin_RS = 8; 
const int pin_EN = 9; 
const int pin_d4 = 4; 
const int pin_d5 = 5; 
const int pin_d6 = 6; 
const int pin_d7 = 7; 

const int pin_BL = 10; 

String incomingByte = ""; // for incoming serial data

LiquidCrystal lcd( pin_RS,  pin_EN,  pin_d4,  pin_d5,  pin_d6,  pin_d7);

const byte DATA_MAX_SIZE = 32;
char data[DATA_MAX_SIZE];   // an array to store the received data
void setup() {
  Serial.begin(9600); // opens serial port, sets data rate to 9600 bps  
  Serial.setTimeout(10);
  lcd.begin(16, 2);
  lcd.blink();
  lcd.cursor();
  lcd.setCursor(0,0);
  
  lcd.print("waiting");
}

String inData = "";

void loop(){  
    while (Serial.available() > 0) {
        char received = Serial.read();
        if (received == '\n') {
            // Message is ready in inDate
            lcd.setCursor(0,0);
            lcd.print("                   ");
            lcd.setCursor(0,1);
            lcd.print("                   ");          
            lcd.setCursor(0,0);
            if (inData == "No active timers") {
              lcd.noDisplay();
            } else {
              lcd.display();
              lcd.print(inData);
            }
            
            inData = "";
        } else {
          inData.concat(received);
        }
    }
}
