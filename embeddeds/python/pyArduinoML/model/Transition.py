__author__ = 'pascalpoizat'

class Transition :
    """
    A transition between two states.
    """

    def __init__(self, conditions, nextstate):
        """
        Constructor.

        :param sensor: Sensor, sensor which value is checked to trigger the transition
        :param value: SIGNAL, value that the sensor must have to trigger the transition
        :param nextstate: State, state to change to when the transition is triggered
        :return:
        """
        
        self.nextstate = nextstate
        self.conditions = conditions

    

    def to_arduino_condition(self):
        """
        Returns the condition as an Arduino C condition.
        """
        conditions = []

        # Conditions and/or
        for cond in self.conditions:
            if cond["operator"] == "FIRST":
                conditions.append(f"digitalRead({cond['sensor']}) == {cond['value']}")
            elif cond["operator"] == "AND":
                conditions.append(f"digitalRead({cond['sensor']}) == {cond['value']}")
            elif cond["operator"] == "OR":
                conditions[-1] = f"({conditions[-1]} || digitalRead({cond['sensor']}) == {cond['value']})"
            else:
                raise Exception("Invalid operator in condition.")
            

        # Return the conditions
        return " && ".join(conditions)