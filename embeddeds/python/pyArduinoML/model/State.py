__author__ = 'pascalpoizat'

from pyArduinoML.model.NamedElement import NamedElement
import pyArduinoML.model.SIGNAL as SIGNAL

class State(NamedElement):
    """
    A state in the application.

    """

    def __init__(self, name, actions=(), transition=None):
        """
        Constructor.

        :param name: String, name of the state
        :param actions: List[Action], sequence of actions to do when entering the state (size should be > 0)
        :param transition: Transition, unique outgoing transition
        :return:
        """
        NamedElement.__init__(self, name)
        self.transition = transition
        self.actions = actions

    def settransition(self, transition):
        """
        Sets the transition of the state
        :param transition: Transition
        :return:
        """
        self.transition = transition

    def setup(self, errors):
        """
        Arduino code for the state.

        :return: String
        """
        rtr = ""
        rtr += "void state_%s() {\n" % self.name

        # Generate the code for the actions
        for action in self.actions:
            rtr += "\tdigitalWrite(%s, %s);\n" % (action.brick.name, SIGNAL.value(action.value))

        rtr += "\tboolean guard = millis() - time > debounce;\n"

        # Generate the code for the transition
        transition_condition = self.transition.to_arduino_condition()
        rtr += "\tif (%s && guard) {\n" % transition_condition
        rtr += "\t\ttime = millis();\n \t\tstate_%s();\n" % self.transition.nextstate.name
        if(errors != ()):
            for error in errors:
                rtr += "\t} else if (digitalRead(%s) == %s && guard) {\n" % (error.sensor, error.value)
                rtr += "\t\ttime = millis();\n \t\tstate_error(%s);\n" % error.error_code
        rtr += "\t} else {\n"
        rtr += "\t\tstate_%s();\n" % self.name  # Loop on the same state
        rtr += "\t}\n"
        rtr += "}\n"

        return rtr
