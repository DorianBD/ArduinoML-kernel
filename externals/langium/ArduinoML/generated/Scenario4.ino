
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {a, b, c};

STATE currentState = a;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(12, OUTPUT); // red_led [Actuator]
		pinMode(13, OUTPUT); // buzzer [Actuator]
		pinMode(8, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case a:
					digitalWrite(12,LOW);
					digitalWrite(13,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    
                    if (digitalRead(8) == HIGH && buttonBounceGuard)  {
                        currentState = b;
                        buttonLastDebounceTime = millis();
                        
                    }
				break;
				case b:
					digitalWrite(12,LOW);
					digitalWrite(13,HIGH);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    
                    if (digitalRead(8) == HIGH && buttonBounceGuard)  {
                        currentState = c;
                        buttonLastDebounceTime = millis();
                        
                    }
				break;
				case c:
					digitalWrite(12,HIGH);
					digitalWrite(13,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    
                    if (digitalRead(8) == HIGH && buttonBounceGuard)  {
                        currentState = a;
                        buttonLastDebounceTime = millis();
                        
                    }
				break;
		}
	}
	
