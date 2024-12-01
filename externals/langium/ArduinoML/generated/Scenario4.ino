
//Wiring code generated from an ArduinoML model
// Application name: RedButton

long debounce = 200;
enum STATE {a, b, c};

STATE currentState = a;

bool buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

            

	void setup(){
		pinMode(8, OUTPUT); // red_led [Actuator]
		pinMode(9, OUTPUT); // buzzer [Actuator]
		pinMode(10, INPUT); // button [Sensor]
	}
	void loop() {
			switch(currentState){

				case a:
					digitalWrite(8,LOW);
					digitalWrite(9,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(10) == HIGH  && buttonBounceGuard))  {
                        currentState = b;
                        buttonLastDebounceTime = millis();
                    break;
				case b:
					digitalWrite(8,LOW);
					digitalWrite(9,HIGH);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(10) == HIGH  && buttonBounceGuard))  {
                        currentState = c;
                        buttonLastDebounceTime = millis();
                    break;
				case c:
					digitalWrite(8,HIGH);
					digitalWrite(9,LOW);
                    buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
                    if (( digitalRead(10) == HIGH  && buttonBounceGuard))  {
                        currentState = a;
                        buttonLastDebounceTime = millis();
                    break;
		}
	}
	
