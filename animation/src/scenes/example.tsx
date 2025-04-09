import {makeScene2D} from '@motion-canvas/2d';
import {
    all,
    createRef,
    linear,
    tween,
    waitFor
} from '@motion-canvas/core';
import {Car, TIRE_DIAMETER} from '../custom/car'

export default makeScene2D(function* (view) {
    const car = createRef<Car>();
    const tireLength = TIRE_DIAMETER * Math.PI;

    view.add(<>
        <Car ref={car}></Car>
    </>);

    yield* all(
        car().position([tireLength, 0], 2),
        tween(2, value => {
            car().soc(linear(value, 1, 0.6));
        })
    )

    yield* waitFor(0.5)

    car().flipped(true)

    yield* waitFor(0.5)

    yield* all(
        car().position([0, 0], 2),
        tween(2, value => {
            car().soc(linear(value, 0.6, 0.2));
        })
    )

    yield* waitFor(0.5)

    yield* tween(2, value => {
        car().soc(linear(value, 0.2, 1.0));
    })
});
