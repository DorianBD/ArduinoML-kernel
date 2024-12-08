sensor "button1" onPin 9
actuator "led" pin 12
actuator "buzzer" pin 11

state "on" means "led" becomes "high" and "buzzer" becomes "low"
state "off" means led becomes low and buzzer becomes high

initial "off"

from "on" to "off" when "button1" becomes "high" end
from "off" to "on" when "button1" becomes "high" end

export "Scenario4!"