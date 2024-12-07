package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitable;
import io.github.mosser.arduinoml.kernel.generator.Visitor;

public interface Condition extends Visitable {

    @Override
    void accept(Visitor visitor);

    @Override
    abstract String toString();
}
