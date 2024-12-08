__author__ = 'pascalpoizat'

"""
DSL version of the demo application
uses MethodChaining, nothing Python-specific
"""


def demo1():
    """
    State-based alarm: Pushing the button once switches the system in a mode where the LED is switched on. Pushing it again switches it off.
    Direct use of the DSL.
    + : auto-completion (limited due to python typing system)
    - : verbose, Python syntax requires '\' to cut lines.

    :return:
    """
    from pyArduinoML.methodchaining.AppBuilder import AppBuilder
    from pyArduinoML.model.SIGNAL import HIGH, LOW

    print("State-based alarm: Pushing the button once switches the system in a mode where the LED is switched on. Pushing it again switches it off.")

    app = AppBuilder("Switch!") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(12) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("off") \
        .get_contents()

    print(app)

def demo2():
    """
    Use of a wrapper to avoid some python syntax constraints.
    + : simpler syntax
    - : no auto-completion

    :return:
    """
    from pyArduinoML.methodchaining.AppStringBuilder import AppStringBuilder

    app2 = AppStringBuilder("""
    AppBuilder("Switch!")
        .sensor("BUTTON").on_pin(9)
        .actuator("LED").on_pin(12)
        .state("off")
            .set("LED").to(LOW)
            .when("BUTTON").has_value(HIGH).go_to_state("on")
        .state("on")
            .set("LED").to(HIGH)
            .when("BUTTON").has_value(HIGH).go_to_state("off")
    """)

    print (app2)

def demo3():
    """Very simple alarm: Pushing a button activates a LED and a buzzer. Releasing the button switches the actuators off."""


    from pyArduinoML.methodchaining.AppBuilder import AppBuilder
    from pyArduinoML.model.SIGNAL import HIGH, LOW

    print("Very simple alarm: Pushing a button activates a LED and a buzzer. Releasing the button switches the actuators off.")

    app3 = AppBuilder("Switch!") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(12) \
        .state("off") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .state("on") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(LOW).go_to_state("off") \
        .get_contents()
    
    print(app3)

def demo4():
    """Dual-check alarm: It will trigger a buzzer if and only if two buttons are pushed at the very same time. Releasing at least one of the button stop the sound."""
    
    from pyArduinoML.methodchaining.AppBuilder import AppBuilder
    from pyArduinoML.model.SIGNAL import HIGH, LOW

    print("Dual-check alarm: It will trigger a buzzer if and only if two buttons are pushed at the very same time. Releasing at least one of the button stop the sound.")

    app4 =  AppBuilder("DualCheckAlarm") \
    .sensor("BUTTON1").on_pin(9) \
    .sensor("BUTTON2").on_pin(10) \
    .actuator("BUZZER").on_pin(12) \
    .state("idle") \
        .set("BUZZER").to(LOW) \
        .when("BUTTON1").has_value(HIGH).and_when("BUTTON2").with_value(HIGH).go_to_state("buzzing") \
    .state("buzzing") \
        .set("BUZZER").to(HIGH) \
        .when("BUTTON1").has_value(LOW).or_when("BUTTON2").with_value(LOW).go_to_state("idle") \
    .get_contents()
    
    
    print(app4)

def demo5():
    """
    Multi-state alarm: Pushing the button starts the buzz noise. Pushing it again stop the buzzer and
    switch the LED on. Pushing it again switch the LED off, and makes the system ready to make noise
    again after one push, and so on
    """

    from pyArduinoML.methodchaining.AppBuilder import AppBuilder
    from pyArduinoML.model.SIGNAL import HIGH, LOW

    print("Multi-state alarm: Pushing the button starts the buzz noise. Pushing it again stop the buzzer and switch the LED on. Pushing it again switch the LED off, and makes the system ready to make noise again after one push, and so on")

    app5 = AppBuilder("MultiStateAlarm") \
        .sensor("BUTTON").on_pin(9) \
        .actuator("LED").on_pin(12) \
        .actuator("BUZZER").on_pin(13) \
        .state("off") \
            .set("LED").to(LOW) \
            .set("BUZZER").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("buzzing") \
        .state("buzzing") \
            .set("BUZZER").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("buzzing_off_led_on") \
        .state("buzzing_off_led_on") \
            .set("BUZZER").to(LOW) \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("off") \
        .get_contents()
    
    print(app5)

def demo6():
    """
    Exception Throwing : To implement this extension, we assume that a red LED is always connected on a given port (e.g., D12).
    One can use ArduinoML to model erroneous situations (e.g., inconsistent data received, functional error)
    as special states. These error states are sinks, associated to a given numerical error code. When the sketch
    falls in such a state the red LED blinks conformingly to the associated error code to signal the error to the
    outside world. For example, in an “error 3” state, the LED will blink 3 times, then a void period, then 3
    times again, etc.
    """

    from pyArduinoML.methodchaining.AppBuilder import AppBuilder
    from pyArduinoML.model.SIGNAL import HIGH, LOW

    print("Exception Throwing : To implement this extension, we assume that a red LED is always connected on a given port (e.g., D12). One can use ArduinoML to model erroneous situations (e.g., inconsistent data received, functional error) as special states. These error states are sinks, associated to a given numerical error code. When the sketch falls in such a state the red LED blinks conformingly to the associated error code to signal the error to the outside world. For example, in an “error 3” state, the LED will blink 3 times, then a void period, then 3 times again, etc.")

    app6 = AppBuilder("ErrorAlarm") \
        .sensor("BUTTON").on_pin(9) \
        .sensor("BUTTON2").on_pin(10) \
        .actuator("LED").on_pin(11) \
        .throw_error(3).if_sensor("BUTTON2").is_(HIGH) \
        .state("on") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("off") \
        .state("off") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .get_contents()
    
    print(app6)

def demo7():
    """
    Two Exception Throwing
    """

    from pyArduinoML.methodchaining.AppBuilder import AppBuilder
    from pyArduinoML.model.SIGNAL import HIGH, LOW

    print("Two Exception Throwing")

    app7 = AppBuilder("ErrorAlarm") \
        .sensor("BUTTON").on_pin(9) \
        .sensor("BUTTON2").on_pin(10) \
        .sensor("BUTTON3").on_pin(13) \
        .actuator("LED").on_pin(11) \
        .throw_error(3).if_sensor("BUTTON2").is_(HIGH) \
        .throw_error(5).if_sensor("BUTTON3").is_(HIGH) \
        .state("on") \
            .set("LED").to(LOW) \
            .when("BUTTON").has_value(HIGH).go_to_state("off") \
        .state("off") \
            .set("LED").to(HIGH) \
            .when("BUTTON").has_value(HIGH).go_to_state("on") \
        .get_contents()
    
    print(app7)



if __name__ == '__main__':
    demo1()
    demo3()
    demo4()
    demo5()
    demo6()
    demo7()
    
