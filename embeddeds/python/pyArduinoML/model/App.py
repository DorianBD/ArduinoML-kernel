__author__ = 'pascalpoizat'

from pyArduinoML.model.NamedElement import NamedElement


class App(NamedElement):
    """
    Application built over bricks.

    """

    def __init__(self, name, bricks=(), states=(), errors=()):
        """
        Constructor.

        :param name: String, the name of the application
        :param bricks: List[Brick], bricks over which the application operates
        :param states: List[State], states of the application with the first one being the initial state
        :return:
        """
        NamedElement.__init__(self, name)
        self.bricks = bricks
        self.states = states
        self.errors = errors

    def __repr__(self):
        """
        External representation: Arduino program

        :return: String
        """

        # Bricks declaration and setup
        brick_declarations = "\n".join(map(lambda b: b.declare(), self.bricks))
        brick_setup = "\n".join(map(lambda b: b.setup(), self.bricks))

        # States setup
        state_setups = "\n".join(map(lambda s: s.setup(self.errors), self.states))

        # Error state setup
        error_state_setup = ""
        if self.errors:  # Vérifie s'il existe des erreurs
            error_state_setup = self.errors[0].setup()

        # Génération du code final
        rtr = f"""// generated by ArduinoML

{brick_declarations}

void setup() {{
{brick_setup}
}}

int state = LOW; int prev = HIGH;
long time = 0; long debounce = 200;

{state_setups}
{error_state_setup}
void loop() {{ state_{self.states[0].name}(); }}"""
        return rtr
