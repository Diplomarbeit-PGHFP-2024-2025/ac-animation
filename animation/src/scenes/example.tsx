import {Circle, Img, Node, makeScene2D} from '@motion-canvas/2d';
import {all, createEaseInBack, createRef, createRefMap, createSignal, waitFor} from '@motion-canvas/core';
import {Car, TIRE_DIAMETER} from '../custom/car'

const TIRE_SOURCE = "resources/tire.svg"

export default makeScene2D(function* (view) {

    const car = createRef<Car>();

    view.add(<>
        <Car ref={car}></Car>
    </>);

    yield* all(
        car().position([TIRE_DIAMETER*Math.PI,0], 5)
    )
    yield* waitFor(1)
    yield* all(
        car().position([0,0], 5)
    )
});
