
sensor "B1" onPin 9
actuator "LED1" pin 12

state "on" means "LED1" becomes "high"
state "off" means LED1 becomes low

initial "off"

from off to on when B1 becomes high
//from on to off after 800.ms
from on to off after 800

export "Switch!"