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

void loop(){  
    if (Serial.available() > 0) {
        char received = Serial.read();
        if (received == '\n') {
            // Message is ready in inDate
            lcd.setCursor(0,0);
            lcd.print("                   ");
            lcd.setCursor(0,0);
            lcd.print(firstLine);
            lcd.setCursor(0,1);
            lcd.print("                   ");   
            lcd.setCursor(0,1);       
            lcd.print(secondLine);   
            firstLine = "";
            secondLine = "";
            currentLine = 0;
            displayPos = 0;
        } else if (received == '_'){
          currentLine = 1;
        } else if (currentLine == 0){
            firstLine.concat(received);  
        } else {
           secondLine.concat(received);  
        }     
   }
  if (firstLine.length() > 16){
    
  } 
}
