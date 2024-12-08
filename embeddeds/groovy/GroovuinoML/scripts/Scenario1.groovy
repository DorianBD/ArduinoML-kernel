sensor "button" onPin 9
actuator "led" pin 10
actuator "buzzer" pin 11

state "on" means "led" becomes "high" and "buzzer" becomes "high"
state "off" means led becomes low and buzzer becomes low

initial "off"

from "on" to "off" when "button" becomes "low" end
from "off" to "on" when "button" becomes "high" end

export "Switch!"