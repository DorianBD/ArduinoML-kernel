
__author__ = 'carlawagschal'

class Error:
    """
    Error class
    """
    def __init__(self, root, error_code, sensor, value):
        """
        Constructor

        :param root: AppBuilder, root builder
        :param error_code: int, error code
        :return:
        """
        self.root = root
        self.error_code = error_code
        self.sensor = sensor
        self.value = value

    def build(self):
        """
        Builds the error

        :return: Error, the error
        """
        return self.root
    

    def setup(self):
        """
        Defines the error state where the LED blinks the error code.
        :param error_code: Integer, the error code (e.g., 3 for error 3)
        :return: String, the Arduino code for the error state
        """
        rtr = ""
        rtr += "void state_error(int error_code) {\n"
        
        rtr += "\tfor (int i = 0; i < error_code; i++) {\n"
        rtr += "\t\tdigitalWrite(ERROR, HIGH);\n"
        rtr += "\t\tdelay(1000);\n"
        rtr += "\t\tdigitalWrite(ERROR, LOW);\n"
        rtr += "\t\tdelay(1000);\n"
        rtr += "\t}\n"
        rtr += "\tdelay(5000);\n"
        rtr += "\tstate_error(error_code);\n"
        rtr += "}\n"
        
        return rtr