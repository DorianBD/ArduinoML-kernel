sensor "button1" onPin 9
actuator "led" pin 12

state "on" means "led" becomes "high"
state "off" means led becomes low

initial "off"

from "on" to "off" when "button1" becomes "high" end
from "off" to "on" when "button1" becomes "high" end

export "Switch!"