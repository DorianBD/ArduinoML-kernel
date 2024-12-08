sensor "bouton" onPin 9
actuator "led" pin 12

state "on" means "led" becomes "high"
state "off" means led becomes low

initial "off"

from off to on after 6000 orwhen bouton becomes high end
from on to off when bouton becomes high andafter 3000 orafter 20000 end

export "TempCondition!"