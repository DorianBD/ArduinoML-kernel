
__author__ = 'carlawagschal'

from pyArduinoML.methodchaining.Error import Error

class ErrorBuilder:

    def __init__(self, root, error_code):
        """
        Constructor

        :param root: AppBuilder, root builder
        :param error_code: int, error code
        :return:
        """
        self.root = root
        self.error_code = error_code
        self.sensor = None
        self.value = None

    def if_sensor(self, sensor):
        """
        Sets the sensor of the error

        :param sensor: String, name of the sensor
        :return: ErrorBuilder, the builder
        """
        self.sensor = sensor
        return self
    
    def is_(self, value):
        """
        Sets the value of the sensor

        :param value: SIGNAL, value of the sensor
        :return: ErrorBuilder, the builder
        """
        self.value = value
        return self.root


    def build(self):
        """
        Builds the error

        :return: Error, the error
        """
        return Error(self.root, self.error_code, self.sensor, self.value)