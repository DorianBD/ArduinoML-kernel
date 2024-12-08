sensor "button1" onPin 9
sensor "button2" onPin 10
sensor "button3" onPin 8
actuator "buzzer" pin 11

state "on" means "buzzer" becomes "high"
state "off" means buzzer becomes low

initial "off"

from "on" to "off" after 1000 end
from "off" to "on" when "button2" becomes "high" andwhen "button3" becomes "high" end
from "off" to "on" when "button1" becomes "high" andwhen "button3" doesntbecome "high" andwhen "button2" doesntbecome "high" end

throwerror 3 when "button1" becomes "high" andwhen "button2" becomes "high" end
throwerror 4 when "button1" becomes "high" andwhen "button3" becomes "high" end
throwerror 5 after 10000 end


export "ThrowErr!"