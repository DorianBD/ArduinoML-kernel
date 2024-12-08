sensor "bouton" onPin 9
actuator "led" pin 12

state "on" means "led" becomes "high"
state "off" means led becomes low

initial "off"

from off to on when bouton becomes high end
from on to off after 800

export "AcceptTempCondition!"