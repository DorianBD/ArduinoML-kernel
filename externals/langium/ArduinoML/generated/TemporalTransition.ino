
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
   pinMode(9, OUTPUT); // led [Actuator]
   pinMode(11, INPUT); // button1 [Sensor]
   pinMode(12, INPUT); // button2 [Sensor]
}
    
void loop() {

   switch(currentState){
        case off:
            digitalWrite(9,LOW);

            button1BounceGuard = millis() - button1LastDebounceTime > debounce;
            button2BounceGuard = millis() - button2LastDebounceTime > debounce;

            if (((millis() - startTime >= 6000) || (( digitalRead(11) == HIGH  && button1BounceGuard) && ( digitalRead(12) == HIGH  && button2BounceGuard))))  {
                currentState = on;
                startTime = millis();
                button1LastDebounceTime = millis();
                button2LastDebounceTime = millis();
            }
            break;

        case on:
            digitalWrite(9,HIGH);


            if ((millis() - startTime >= 2000))  {
                currentState = off;
                startTime = millis();
            }
            break;

    }
}
