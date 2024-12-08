	package main.groovy.groovuinoml.dsl

	import groovuinoml.main.GroovuinoML
	import io.github.mosser.arduinoml.kernel.behavioral.TimeUnit
	import io.github.mosser.arduinoml.kernel.behavioral.Action
	import io.github.mosser.arduinoml.kernel.behavioral.State
	import io.github.mosser.arduinoml.kernel.structural.Actuator
	import io.github.mosser.arduinoml.kernel.structural.Sensor
	import io.github.mosser.arduinoml.kernel.structural.SIGNAL
	import io.github.mosser.arduinoml.kernel.behavioral.Condition
	import io.github.mosser.arduinoml.kernel.behavioral.Transition
	import io.github.mosser.arduinoml.kernel.behavioral.SensorCondition
	import io.github.mosser.arduinoml.kernel.behavioral.TemporalCondition
	import io.github.mosser.arduinoml.kernel.behavioral.UnaryCondition
	import io.github.mosser.arduinoml.kernel.behavioral.UnaryOperator
	import io.github.mosser.arduinoml.kernel.behavioral.BinaryCondition
	import io.github.mosser.arduinoml.kernel.behavioral.BinaryOperator

	class ErrorBuilder extends ConditionBuilder {
		private int errornumber


		public ErrorBuilder(GroovuinoMLBinding binding, Number errornumber) {
			this.binding = binding
			this.errornumber = errornumber.intValue()
		}

		@Override
		def end() {
			def model = getBinding().getGroovuinoMLModel()
			model.createError(this.getCondition(), errornumber)
		}
	}

	class TransitionBuilder extends ConditionBuilder {
		private State state1
		private State state2

		public TransitionBuilder(GroovuinoMLBinding binding, State state1, State state2) {
			this.binding = binding
			this.state1 = state1
			this.state2 = state2
		}

		@Override
		def end() {
			def model = getBinding().getGroovuinoMLModel()
			model.createTransition(state1, state2, getCondition())
		}

	}


	abstract class ConditionBuilder {
		GroovuinoMLBinding binding
		List<Condition> conditions = []

		List<Condition> getConditions() {
			return conditions
		}

		GroovuinoMLBinding getBinding() {
			return binding
		}

		Condition getCondition() {
			return conditions.size() > 0 ? conditions.remove(0) : null
		}

		def when(sensor) {
			[
					becomes: { signal ->
						conditions.add(new SensorCondition(
								sensor instanceof String ? (Sensor) binding.getVariable(sensor) : sensor,
								signal instanceof String ? (SIGNAL) binding.getVariable(signal) : signal
						))
						this
					},
					doesnt: {
						[
								become: { signal ->
									conditions.add(new UnaryCondition(
											new SensorCondition(
													sensor instanceof String ? (Sensor) binding.getVariable(sensor) : sensor,
													signal instanceof String ? (SIGNAL) binding.getVariable(signal) : signal
											),
											UnaryOperator.NOT
									))
									this // Retourne "this" pour permettre la fluidité
								}
						]
					}
			]
		}



		def after(Number delay) {
			conditions.add(new TemporalCondition(delay.intValue()))
			this
		}

		def andwhen(sensor) {
				[
						becomes: { signal ->
							conditions.add(new SensorCondition(
									sensor instanceof String ? (Sensor) binding.getVariable(sensor) : sensor,
									signal instanceof String ? (SIGNAL) binding.getVariable(signal) : signal
							))
							this.andApply()
						},
						doesntbecome: { signal ->
										conditions.add(new UnaryCondition(
												new SensorCondition(
														sensor instanceof String ? (Sensor) binding.getVariable(sensor) : sensor,
														signal instanceof String ? (SIGNAL) binding.getVariable(signal) : signal
												),
												UnaryOperator.NOT
										))
										this.andApply()
									}
				]
		}

		def orwhen(sensor) {
			[
					becomes: { signal ->
						conditions.add(new SensorCondition(
								sensor instanceof String ? (Sensor) binding.getVariable(sensor) : sensor,
								signal instanceof String ? (SIGNAL) binding.getVariable(signal) : signal
						))
						this.orApply()
					},
					doesntbecome: { signal ->
									conditions.add(new UnaryCondition(
											new SensorCondition(
													sensor instanceof String ? (Sensor) binding.getVariable(sensor) : sensor,
													signal instanceof String ? (SIGNAL) binding.getVariable(signal) : signal
											),
											UnaryOperator.NOT
									))
									this.orApply()
								}
			]
		}

		def andafter(Number delay) {
			conditions.add(new TemporalCondition(delay))
			this.andApply()
		}

		def orafter(Number delay) {
			conditions.add(new TemporalCondition(delay))
			this.orApply()
		}

		def andApply() {
			// Ajoute une condition AND entre les deux dernières conditions
			if (conditions.size() >= 2) {
				Condition right = conditions.remove(conditions.size() - 1)
				Condition left = conditions.remove(conditions.size() - 1)
				conditions.add(new BinaryCondition(left, right, BinaryOperator.AND))
			}
			this
		}


		def orApply() {
			// Ajoute une condition OR entre les deux dernières conditions
			if (conditions.size() >= 2) {
				Condition right = conditions.remove(conditions.size() - 1)
				Condition left = conditions.remove(conditions.size() - 1)
				conditions.add(new BinaryCondition(left, right, BinaryOperator.OR))
			}
			this
		}

		abstract end()

		def propertyMissing(String name) {
			if(name == "end") {
				return end()
			}
			else {
				throw new MissingPropertyException(name, this.getClass())
			}
		}

	}



	abstract class GroovuinoMLBasescript extends Script {

		ConditionBuilder currentTransitionBuilder = null

		public getTransitionBuilder() {
			return currentTransitionBuilder
		}

		public setTransitionBuilder(ConditionBuilder transitionBuilder) {
			currentTransitionBuilder = transitionBuilder
		}

		public end() {
			currentTransitionBuilder.end
			currentTransitionBuilder = null

		}

	//	public static Number getDuration(Number number, TimeUnit unit) throws IOException {
	//		return number * unit.inMillis;
	//	}

		// sensor "name" pin n
		def sensor(String name) {
			[pin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createSensor(name, n) },
			 onPin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createSensor(name, n)}]
		}

		// actuator "name" pin n
		def actuator(String name) {
			[pin: { n -> ((GroovuinoMLBinding)this.getBinding()).getGroovuinoMLModel().createActuator(name, n) }]
		}

		// state "name" means actuator becomes signal [and actuator becomes signal]*n
		def state(String name) {
			List<Action> actions = new ArrayList<Action>()
			((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().createState(name, actions)
			// recursive closure to allow multiple and statements
			def closure
			closure = { actuator ->
				[becomes: { signal ->
					Action action = new Action()
					action.setActuator(actuator instanceof String ? (Actuator)((GroovuinoMLBinding)this.getBinding()).getVariable(actuator) : (Actuator)actuator)
					action.setValue(signal instanceof String ? (SIGNAL)((GroovuinoMLBinding)this.getBinding()).getVariable(signal) : (SIGNAL)signal)
					actions.add(action)
					[and: closure]
				}]
			}
			[means: closure]
		}

		// initial state
		def initial(state) {
			((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().setInitialState(state instanceof String ? (State)((GroovuinoMLBinding)this.getBinding()).getVariable(state) : (State)state)
		}



		def from(state1) {
			[to: { state2 ->
				def state1Resolved = state1 instanceof String ? (State) ((GroovuinoMLBinding) this.getBinding()).getVariable(state1) : (State) state1
				def state2Resolved = state2 instanceof String ? (State) ((GroovuinoMLBinding) this.getBinding()).getVariable(state2) : (State) state2
				new TransitionBuilder((GroovuinoMLBinding) this.getBinding(), state1Resolved, state2Resolved)
			}]
		}

		def throwerror(Number errornumber) {
			new ErrorBuilder((GroovuinoMLBinding) this.getBinding(), errornumber)
		}

		// export name
		def export(String name) {
			println(((GroovuinoMLBinding) this.getBinding()).getGroovuinoMLModel().generateCode(name).toString())
		}

		// disable run method while running
		int count = 0
		abstract void scriptBody()
		def run() {
			if(count == 0) {
				count++
				scriptBody()
			} else {
				println "Run method is disabled"
			}
		}
	}
