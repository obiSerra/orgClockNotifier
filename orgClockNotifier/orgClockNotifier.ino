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
int stillFor = 500;
int scrollSpeed = 50;

LiquidCrystal lcd( pin_RS,  pin_EN,  pin_d4,  pin_d5,  pin_d6,  pin_d7);

void setup() {
  Serial.begin(9600); // opens serial port, sets data rate to 9600 bps  
  Serial.setTimeout(10);
  lcd.begin(16, 2);
  //lcd.blink();
  //lcd.cursor();
  lcd.setCursor(0,0);
  
  lcd.print("Waiting...");
}

String firstLine = "";
String secondLine = "";
int currentLine = 0;
int displayPos = 0;

int moveCount = 0;
int stillCount = 0;
int scrollPos = 0;

void loop(){  
    while (Serial.available() > 0) {
        char received = Serial.read();
        if (received == '\n') {
            // Message is ready in inDate

            if (firstLine == "") {
              lcd.noDisplay();
            } else {
                lcd.clear();
                lcd.display();
                lcd.setCursor(0,0);
                lcd.print(firstLine);
                lcd.setCursor(0,1);
                lcd.setCursor(0,1);       
                lcd.print(secondLine);
                int l = max(firstLine.length(), secondLine.length());   
                firstLine = "";
                secondLine = "";
                currentLine = 0;
                displayPos = 0;
              
                if (l > 16) {
                  while (true) {
                    if (Serial.available() > 0) break;
                    // scroll one position right:
                    if (scrollPos > l + 13) {
                      stillCount = 0;
                      scrollPos = 0;
                      moveCount = 0;
                    }
                    else if (stillCount < stillFor) {
                       stillCount++;
                        moveCount = 0;
                    } else if (moveCount > scrollSpeed){
                       lcd.scrollDisplayLeft();
                       moveCount = 0;
                       scrollPos++;
                    } else {
                      moveCount++;  
                    }
                    // wait a bit:
                    delay(10);
                }
               }
            }
        } else if (received == '_'){
          currentLine = 1;
        } else if (currentLine == 0){
            firstLine.concat(received);  
        } else {
           secondLine.concat(received);  
        }     
   }
}
