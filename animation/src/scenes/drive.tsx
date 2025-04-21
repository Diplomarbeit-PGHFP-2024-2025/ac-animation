import {makeScene2D, Camera, Txt, Img} from '@motion-canvas/2d';
import {
    all, chain, createDeferredEffect, createEffect,
    createRef, createSignal,
    linear,
    tween, useDuration, useLogger, Vector2,
    waitFor, waitUntil,

} from '@motion-canvas/core';
import {AGENT_EYE_RADIUS, AGENT_EYES_OFFSET, Car, TIRE_DIAMETER} from '../custom/car'
import {Message} from '../custom/message'

export const MESSAGE_START_POSITION = new Vector2(0, -150)
export const AUTOCHARGE_Y = -150
export const BOSCH_Y = 150

export default makeScene2D(function* (view) {
    const background = createRef<Img>();
    const background2 = createRef<Img>();

    const car = createRef<Car>();
    const camera = createRef<Camera>();

    view.add(<Camera ref={camera} zoom={1.4} position={[0, -1000]}>
        <Img ref={background} src={"resources/background.svg"} height={1920} width={1920}/>
        <Img src={"resources/small_station.svg"} width={400} position={[4350,0]}/>
        <Img ref={background2} src={"resources/background.svg"} height={1920} width={1920} position={[4000, 0]}
             scaleX={-1}/>

        <Car ref={car} position={[0, 0]}/>
        <Txt  position={[0,150]} fontSize={200}
             fontFamily={'helvetica'}>AutoCharge</Txt>
        <Img position={[0,-150]} height={400} width={1000}
             src={'resources/bosch.svg'}/>
    </Camera>);
    car().soc(0.2)
    car().flipped(true)

    camera().position([2000, 0])

    yield* all(
        car().position([3900, 0], useDuration("DriveTo")),
        camera().position([4000, 0], 2),
    )

    yield* waitFor(1)
    car().look(Vector2.left)
    yield* waitUntil("StartCharge")

    yield* car().soc(1, useDuration("FullyCharge"), linear)

    yield* waitFor(0.5)
    car().look(Vector2.right)
    yield* waitUntil("driveAway")

    yield* all(
        car().position([3000, 0], 2),
        camera().position([0, 0], 4),
        camera().zoom(1,4)
    )

    yield* waitUntil("end")
});
