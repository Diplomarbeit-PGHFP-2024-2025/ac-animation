import {makeScene2D} from '@motion-canvas/2d';
import {
    all,
    createRef,
    linear,
    tween, Vector2,
    waitFor
} from '@motion-canvas/core';
import {Car, TIRE_DIAMETER} from '../custom/car'

export default makeScene2D(function* (view) {
    const car = createRef<Car>();
    const tireLength = TIRE_DIAMETER * Math.PI;

    view.add(<>
        <Car ref={car} position={[-700, -150]}></Car>
    </>);

    yield* all(
        car().position([700, -150], 3),
        tween(3, value => {
            car().soc(linear(value, 1, 0.7));
        })
    )

    yield* waitFor(0.5)

    car().flipped(true)
    car().position([700, 150])

    yield* all(
        car().position([-700, 150], 3),
        tween(3, value => {
            car().soc(linear(value, 0.7, 0.4));
        })
    )

    car().flipped(false)
    car().position([-700, 0])

    yield* all(
        car().position([0, 0], 2),
        tween(2, value => {
            car().soc(linear(value, 0.4, 0.2));
        })
    )

    yield* waitFor(0.1)
    car().look(Vector2.left)
    yield* waitFor(1.5)
    car().look(Vector2.zero)
    yield* waitFor(1.5)

    yield* all(
        car().position([700, 0], 2),
    )
});
