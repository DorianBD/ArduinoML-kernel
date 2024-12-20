 when becomes and 2  or 2  and 2  or 2 button == HIGH && !(button == LOW) || io.github.mosser.arduinoml.kernel.behavioral.TemporalCondition@724bade8 && io.github.mosser.arduinoml.kernel.behavioral.TemporalCondition@16fb356 || button == LOW
// Wiring code generated from an ArduinoML model
// Application name: Switch!

long debounce = 200;

enum STATE {on, off};
STATE currentState = off;

boolean buttonBounceGuard = false;
long buttonLastDebounceTime = 0;

long startTime = millis();

void setup(){
  pinMode(9, INPUT);  // button [Sensor]
  pinMode(12, OUTPUT); // led [Actuator]
}

void loop() {
	switch(currentState){
		case on:
			digitalWrite(12,HIGH);
			digitalWrite(12,HIGH);
			buttonBounceGuard = millis() - buttonLastDebounceTime > debounce;
			if((button == HIGH && !(button == LOW) || io.github.mosser.arduinoml.kernel.behavioral.TemporalCondition@724bade8 && io.github.mosser.arduinoml.kernel.behavioral.TemporalCondition@16fb356 || button == LOW)) {
				startTime = millis();
				buttonLastDebounceTime = millis();
				currentState = off;
			}
		break;
		case off:
			digitalWrite(12,LOW);
	}
}
