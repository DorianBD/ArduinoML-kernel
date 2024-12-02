
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(9, OUTPUT); // red_led [Actuator]
		pinMode(11, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(9,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == HIGH  && buttonBounceGuard))  {
                        currentState = on;
                        buttonLastDebounceTime = millis();
                    }
                    break;
				case on:
					digitalWrite(9,HIGH);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == HIGH  && buttonBounceGuard))  {
                        currentState = off;
                        buttonLastDebounceTime = millis();
                    }
                    break;
		}
	}
	
