grammar ArduinoMl

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
		'bricks'
		bricks+=Brick
		(bricks+=Brick)* 
		
		'states'
		states+=State
		( states+=State)* 		
	'}';

Brick :
	(Actuator | Sensor);

Actuator:
	{infer Actuator}
	'Actuator' name=ID ':' outputPin=INT;

Sensor :
	{infer Sensor}
	'Sensor'  name=ID ':' inputPin=INT;
	
State :
	name=ID '{'
		actions+=Action
		(actions+=Action)*
		transition=Transition
	'}';


Action :
	actuator=[Actuator:ID] '<=' value=Signal;

Transition :
	condition=Condition '=>' next=[State:ID];

Condition :
    (SensorCondition | TemporalCondition | UnaryCondition | BinaryCondition);


UnaryCondition :
    operator=UnaryOperator condition=Condition;

BinaryCondition :
    '(' left=Condition operator=BinaryOperator right=Condition ')';

SensorCondition:
    sensor=[Sensor:ID] 'is' value=Signal;

TemporalCondition:
    'after' duration=INT;

BinaryOperator:
    value=(AND | OR);
terminal AND: 'AND';
terminal OR: 'OR';

UnaryOperator:
    value=NOT;
terminal NOT: 'NOT';

Signal:
    value=(HIGH | LOW);
terminal HIGH : 'HIGH';
terminal LOW : 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
