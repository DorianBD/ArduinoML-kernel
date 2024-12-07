
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;
bool button1BounceGuard = false;
long button1LastDebounceTime = 0;

bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

int exceptionNumber = 0;
long startTime = millis();

void setup() {
   pinMode( 12, OUTPUT); // Exception LED
   pinMode(9, OUTPUT); // red_led [Actuator]
   pinMode(10, INPUT); // button1 [Sensor]
   pinMode(11, INPUT); // button2 [Sensor]
}
    
void loop() {
if(exceptionNumber > 0){
        for(int i = exceptionNumber; i > 0; i--){
            digitalWrite(12, HIGH);
            delay(600);
            digitalWrite(12, LOW);
            delay(200);
        }
        delay(1200);
        return;
    }

    button1BounceGuard = millis() - button1LastDebounceTime > debounce;
    button2BounceGuard = millis() - button2LastDebounceTime > debounce;

   if((( digitalRead(10) == HIGH  && button1BounceGuard) && ( digitalRead(11) == HIGH  && button2BounceGuard))){
        exceptionNumber = 3;
        return;
    }

   switch(currentState){
        case off:
            digitalWrite(9,LOW);

            button2BounceGuard = millis() - button2LastDebounceTime > debounce;

            if (( digitalRead(11) == HIGH  && button2BounceGuard))  {
                currentState = on;
                startTime = millis();
                button2LastDebounceTime = millis();
            }
            break;

        case on:
            digitalWrite(9,HIGH);

            button2BounceGuard = millis() - button2LastDebounceTime > debounce;

            if (( digitalRead(11) == LOW  && button2BounceGuard))  {
                currentState = off;
                startTime = millis();
                button2LastDebounceTime = millis();
            }
            break;

    }
}
