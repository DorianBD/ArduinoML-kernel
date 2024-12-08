package io.github.mosser.arduinoml.kernel.generator;

import io.github.mosser.arduinoml.kernel.App;
import io.github.mosser.arduinoml.kernel.behavioral.*;
import io.github.mosser.arduinoml.kernel.behavioral.Error;
import io.github.mosser.arduinoml.kernel.structural.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Quick and dirty visitor to support the generation of Wiring code
 */
public class ToWiring extends Visitor<StringBuffer> {
	enum PASS {ONE, TWO}


	public ToWiring() {
		this.result = new StringBuffer();
	}

	private void w(String s) {
		result.append(String.format("%s",s));
	}

	@Override
	public void visit(App app) {
		//first pass, create global vars
		context.put("pass", PASS.ONE);
		w("// Wiring code generated from an ArduinoML model\n");
		w(String.format("// Application name: %s\n", app.getName())+"\n");

		w("long debounce = 200;\n");

		if(!app.getErrors().isEmpty()){
			w("\nint errorNumber = 0;\n\n");
			w("bool error = false;\n");
		}

		w("\nenum STATE {");
		String sep ="";
		for(State state: app.getStates()){
			w(sep);
			state.accept(this);
			sep=", ";
		}
		w("};\n");
		if (app.getInitial() != null) {
			w("STATE currentState = " + app.getInitial().getName()+";\n");
		}

		for(Brick brick: app.getBricks()){
			brick.accept(this);
		}

		w("\nlong startTime = millis();\n");

		//second pass, setup and loop
		context.put("pass",PASS.TWO);
		w("\nvoid setup(){\n");

		if(!app.getErrors().isEmpty()){
			w("  pinMode(12, OUTPUT); //error associated led\n");
		}

		for(Brick brick: app.getBricks()){
			brick.accept(this);
		}
		w("}\n");

		w("\nvoid loop() {\n");

		if(!app.getErrors().isEmpty()) {
			w("\tif(");
			generateError(app.getErrors().get(0));
			w("\t}\n\n");
			for (int i = 1; i < app.getErrors().size(); i++) {
				app.getErrors().get(i).accept(this);
			}
			w("\tif(error){\n");
			w("\t\tfor(;;) {\n");
			w("\t\t\tfor(int i = 0; i < errorNumber; i++){\n");
			w("\t\t\t\tdigitalWrite(12, HIGH);\n");
			w("\t\t\t\tdelay(200);\n");
			w("\t\t\t\tdigitalWrite(12, LOW);\n");
			w("\t\t\t\tdelay(200);\n");
			w("\t\t\t}\n");
			w("\t\t\tdelay(500);\n");
			w("\t\t}\n");
			w("\t\treturn;\n");
			w("\t}\n\n");
		}

		w("\tswitch(currentState){\n");
		for (State state : app.getStates()) {
			state.accept(this);
		}
		w("\t}\n");
		w("}");
	}

	@Override
	public void visit(Actuator actuator) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  pinMode(%d, OUTPUT); // %s [Actuator]\n", actuator.getPin(), actuator.getName()));
			return;
		}
	}

	@Override
	public void visit(Sensor sensor) {
		if(context.get("pass") == PASS.ONE) {
			w(String.format("\nboolean %sBounceGuard = false;\n", sensor.getName()));
			w(String.format("long %sLastDebounceTime = 0;\n", sensor.getName()));
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("  pinMode(%d, INPUT);  // %s [Sensor]\n", sensor.getPin(), sensor.getName()));
			return;
		}
	}

	@Override
	public void visit(State state) {
		if(context.get("pass") == PASS.ONE){
			w(state.getName());
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w("\t\tcase " + state.getName() + ":\n");
			for (Action action : state.getActions()) {
				action.accept(this);
			}

			if (!state.getTransitions().isEmpty()) {
				for(Transition transition : state.getTransitions()) {
					transition.accept(this);
				}
				w("\t\tbreak;\n");
			}
			return;
		}

	}

	@Override
	public void visit(Transition transition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			Set<Sensor> sensors = getSensors(transition.getCondition());
			for (Sensor sensor : sensors) {
				String name = sensor.getName();
				w(String.format("\t\t\t%sBounceGuard = millis() - %sLastDebounceTime > debounce;\n",
						name, name));
			}
			w(String.format("\t\t\tif("));
			transition.getCondition().accept(this);
			w(") {\n");
			w("\t\t\t\tstartTime = millis();\n");
			for(Sensor sensor : sensors) {
				String name = sensor.getName();
				w(String.format("\t\t\t\t%sLastDebounceTime = millis();\n", name));
			}
			w("\t\t\t\tcurrentState = " + transition.getNext().getName() + ";\n");
			w("\t\t\t\tbreak;\n");
			w("\t\t\t}\n");
			return;
		}
	}

	@Override
	public void visit(SensorCondition condition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("digitalRead(%d) == %s", condition.getSensor().getPin(), condition.getValue()));
			return;
		}
	}

	@Override
	public void visit(TemporalCondition condition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			int time = condition.getDuration();
			w(String.format("(millis() - startTime) >= %d", time));
			return;
		}
	}

	@Override
	public void visit(BinaryCondition condition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			condition.getLeft().accept(this);
			w(" ");
			condition.getOperator().accept(this);
			w(" ");
			condition.getRight().accept(this);
			return;
		}
	}

	@Override
	public void visit(UnaryCondition condition) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("%s", condition.getOperator()));
			w("(");
			condition.getCondition().accept(this);
			w(")");
			return;
		}
	}

	@Override
	public void visit(UnaryOperator operator) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			switch (operator) {
				case NOT:
					w("!");
					break;
			}
			return;
		}
	}

	@Override
	public void visit(BinaryOperator operator) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			switch (operator) {
				case AND:
					w("&&");
					break;
				case OR:
					w("||");
					break;
			}
			return;
		}
	}

	@Override
	public void visit(Error error) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w("\telse if(");
			generateError(error);
			w("\t}\n");
			return;
		}
	}

	public void generateError(Error error) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {

			error.getCondition().accept(this);
			w("){\n");
			w("\t\terrorNumber = " + error.getNumberError() + ";\n");
			w("\t\terror = true;\n");
			return;
		}
	}

	@Override
	public void visit(Action action) {
		if(context.get("pass") == PASS.ONE) {
			return;
		}
		if(context.get("pass") == PASS.TWO) {
			w(String.format("\t\t\tdigitalWrite(%d,%s);\n",action.getActuator().getPin(),action.getValue()));
			return;
		}
	}


	private Set<Sensor> getSensors(Condition condition) {
		if (condition.getClass().equals(SensorCondition.class))
		{
			Set sensor = new HashSet<Sensor>();
			sensor.add(((SensorCondition) condition).getSensor());
			return sensor;
		}
		else if (condition.getClass().equals(UnaryCondition.class))
		{
			return getSensors(((UnaryCondition) condition).getCondition());
		}
		else if (condition.getClass().equals(BinaryCondition.class))
		{
			Set<Sensor> sens = getSensors(((BinaryCondition) condition).getLeft());
			Set<Sensor> sensRight = getSensors(((BinaryCondition) condition).getRight());
			sens.addAll(sensRight);
			return sens;
		}
		else if (condition.getClass().equals(TemporalCondition.class))
		{
			return Set.of();
		}
		else {
			return Set.of();
		}
	}
}
