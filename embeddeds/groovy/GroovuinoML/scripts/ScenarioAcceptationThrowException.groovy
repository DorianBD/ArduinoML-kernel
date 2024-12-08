sensor "button1" onPin 9
sensor "button2" onPin 10
actuator "buzzer" pin 11

state "on" means "buzzer" becomes "high"
state "off" means buzzer becomes low

initial "off"

from "on" to "off" when "button1" becomes "high" orwhen "button2" becomes "high" end
from "off" to "on" when "button1" becomes "high" orwhen "button2" becomes "high" end

throwerror 5 when "button1" becomes "high" andwhen "button2" becomes "high" end

export "ThrowErr!"