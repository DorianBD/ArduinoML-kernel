
//Wiring code generated from an ArduinoML model
// Application name: RedButton
#include <LiquidCrystal.h>

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

long ldcDebounce = 1000;
LiquidCrystal myLDC(10, 11, 12, 13, 14, 15, 16);
long myLDCLastSetTime = 0;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

int exceptionNumber = 0;
long startTime = millis();

void setup() {
   pinMode(9, INPUT); // button [Sensor]
}
    
void loop() {
   if(millis() - myLDCLastSetTime > ldcDebounce){
       myLDC.clear();
       myLDC.print(String("button := ") + (digitalRead(9) == HIGH ? "HIGH" : "LOW"));
       myLDCLastSetTime = millis();
    }

   switch(currentState){
        case off:

            buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;

            if (( digitalRead(9) == HIGH  && buttonBounceGuard))  {
                currentState = on;
                startTime = millis();
                buttonLastDebounceTime = millis();
            }
            break;

        case on:

            buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;

            if (( digitalRead(9) == LOW  && buttonBounceGuard))  {
                currentState = off;
                startTime = millis();
                buttonLastDebounceTime = millis();
            }
            break;

    }
}
