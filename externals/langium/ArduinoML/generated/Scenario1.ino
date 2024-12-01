
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(8, OUTPUT); // red_led [Actuator]
		pinMode(9, OUTPUT); // buzzer [Actuator]
		pinMode(10, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(8,LOW);
					digitalWrite(9,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(10) == HIGH  && buttonBounceGuard))  {
                        currentState = on;
                        buttonLastDebounceTime = millis();
                    break;
				case on:
					digitalWrite(8,HIGH);
					digitalWrite(9,HIGH);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(10) == LOW  && buttonBounceGuard))  {
                        currentState = off;
                        buttonLastDebounceTime = millis();
                    break;
		}
	}
	
