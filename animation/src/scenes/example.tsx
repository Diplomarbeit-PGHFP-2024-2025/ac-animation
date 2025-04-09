import {Circle, Img, Node, makeScene2D} from '@motion-canvas/2d';
import {all, createEaseInBack, createRef, createRefMap, createSignal, waitFor} from '@motion-canvas/core';
import {Car} from '../custom/car'

const TIRE_SOURCE = "resources/tire.svg"

export default makeScene2D(function* (view) {

    const car = createRef<Car>();

    view.add(<>
        <Car ref={car}></Car>
    </>);

    yield* all(
        car().tireRotation(3600, 20),
        car().position([250, 0], 20)
    )
    yield* waitFor(1)
    yield* all(
        car().tireRotation(-3600, 20),
        car().position([0, 0], 20)
    )
});
