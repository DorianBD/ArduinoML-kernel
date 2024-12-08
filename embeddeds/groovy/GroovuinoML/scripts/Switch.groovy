sensor "button" onPin 9
actuator "led" pin 12

state "on" means "led" becomes "high"
state "off" means led becomes low

initial "off"

from "on" to "off" after 30 end
from "on" to "off" when "button" becomes "low" end

export "Switch!"