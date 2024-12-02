
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(9, OUTPUT); // red_led [Actuator]
		pinMode(10, OUTPUT); // buzzer [Actuator]
		pinMode(11, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(9,LOW);
					digitalWrite(10,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == HIGH  && buttonBounceGuard))  {
                        currentState = on;
                        buttonLastDebounceTime = millis();
                    }
                    break;
				case on:
					digitalWrite(9,HIGH);
					digitalWrite(10,HIGH);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == LOW  && buttonBounceGuard))  {
                        currentState = off;
                        buttonLastDebounceTime = millis();
                    }
                    break;
		}
	}
	
