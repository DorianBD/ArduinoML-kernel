grammar ArduinoMl

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
		'bricks'
		bricks+=Brick
		(bricks+=Brick)*

		('exceptions'
        exceptions+=Exception
        (exceptions+=Exception)*)?
		
		'states'
		states+=State
		(states+=State)*
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
		transitions+=Transition
		(transitions+=Transition)*
	'}';

Exception :
	condition=Condition '=>' value=INT;


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

UnaryOperator:
    value=NOT;

Signal:
    value=(HIGH | LOW);

terminal AND: 'AND';
terminal OR: 'OR';
terminal NOT: 'NOT';
terminal HIGH : 'HIGH';
terminal LOW : 'LOW';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
