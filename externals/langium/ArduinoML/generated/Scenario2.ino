
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool button1BounceGuard = false;
long button1LastDebounceTime = 0;

            

bool button2BounceGuard = false;
long button2LastDebounceTime = 0;

            

	void setup(){
		pinMode(9, OUTPUT); // buzzer [Actuator]
		pinMode(11, INPUT); // button1 [Sensor]
		pinMode(12, INPUT); // button2 [Sensor]
	}
	void loop() {
			switch(currentState){

				case off:
					digitalWrite(9,LOW);
                    button1BounceGuard = millis() - button1LastDebounceTime > debounce;
                    button2BounceGuard = millis() - button2LastDebounceTime > debounce;
                    if ((( digitalRead(11) == HIGH  && button1BounceGuard) && ( digitalRead(12) == HIGH  && button2BounceGuard)))  {
                        currentState = on;
                        button1LastDebounceTime = millis();
                        button2LastDebounceTime = millis();
                    }
                    break;
				case on:
					digitalWrite(9,HIGH);
                    button1BounceGuard = millis() - button1LastDebounceTime > debounce;
                    button2BounceGuard = millis() - button2LastDebounceTime > debounce;
                    if ((( digitalRead(11) == LOW  && button1BounceGuard) || ( digitalRead(12) == LOW  && button2BounceGuard)))  {
                        currentState = off;
                        button1LastDebounceTime = millis();
                        button2LastDebounceTime = millis();
                    }
                    break;
		}
	}
	
