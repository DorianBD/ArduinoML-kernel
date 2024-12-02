
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {a, b, c};

STATE currentState = a;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(9, OUTPUT); // red_led [Actuator]
		pinMode(10, OUTPUT); // buzzer [Actuator]
		pinMode(11, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case a:
					digitalWrite(9,LOW);
					digitalWrite(10,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == HIGH  && buttonBounceGuard))  {
                        currentState = b;
                        buttonLastDebounceTime = millis();
                    }
                    break;
				case b:
					digitalWrite(9,LOW);
					digitalWrite(10,HIGH);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == HIGH  && buttonBounceGuard))  {
                        currentState = c;
                        buttonLastDebounceTime = millis();
                    }
                    break;
				case c:
					digitalWrite(9,HIGH);
					digitalWrite(10,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(11) == HIGH  && buttonBounceGuard))  {
                        currentState = a;
                        buttonLastDebounceTime = millis();
                    }
                    break;
		}
	}
	
