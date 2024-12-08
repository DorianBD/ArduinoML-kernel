__author__ = 'pascalpoizat'

from pyArduinoML.model.Transition import Transition
from pyArduinoML.methodchaining.UndefinedBrick import UndefinedBrick
from pyArduinoML.methodchaining.UndefinedState import UndefinedState


class TransitionBuilder:
    """
    Builder for transitions.
    """

    def __init__(self, root, sensor):
        """
        Constructor.

        :param root: BehaviorBuilder, root builder
        :param sensor: String, name of the brick used to trigger the transition
        :return:
        """
        self.root = root
        self.next_state = None  # String, name of the target state
        self.conditions = []
        self.conditions.append({"sensor": sensor, "value": None, "operator": "FIRST"})
    

    def has_value(self, value):
        """
        Sets the action.

        :param value: SIGNAL, state of the brick to trigger the transition
        :return: TransitionBuilder, the builder
        """
        self.value = value
        self.conditions[0].update({"value": value})
        return self
    
    def and_when(self, sensor):
        """ 
        Add an action to the transition.
        """
        self.conditions.append({"sensor": sensor, "value": None, "operator": "AND"})
        return self
    
    def or_when(self, sensor):
        """ 
        Add an action to the transition.
        """
        self.conditions.append({"sensor": sensor, "value": None, "operator": "OR"})
        return self
    
    def with_value(self, value):
        """
        Specify the value of the last added action.
        """
        if len(self.conditions) == 0:
            raise Exception("No condition to set value to.")
        self.conditions[-1]["value"] = value
        return self

    def go_to_state(self, next_state):
        """
        Sets the target state.

        :param next_state: String, name of the target state
        :return: StateBuilder, the builder root
        """
        self.next_state = next_state
        return self.root.root

    def get_contents(self, bricks, states):
        """
        Builds the transition.

        :param bricks: Map[String,Brick], the bricks of the application
        :param states: Map[String,State], the states of the application
        :return: Transition, the transition to build
        :raises: UndefinedBrick, if the transition references an undefined brick
        :raises: UndefinedState, if the transition references an undefined state
        """
        if self.sensor not in bricks.keys():
            raise UndefinedBrick()
        for condition in self.conditions:
            if condition["sensor"] not in bricks.keys():
                raise UndefinedBrick()
        if self.next_state not in states.keys():
            raise UndefinedState()
        
        transition = Transition(
            sensor=bricks[self.sensor],
            value=self.value,
            next_state= states[self.next_state],
        )
        # Set the conditions of the transition with the correct sensors, values and operators
        transition.conditions = [
            {"sensor": bricks[cond["sensor"]], "value": cond["value"], "operator": cond["operator"]}
            for cond in self.or_conditions
        ]
    
        return transition