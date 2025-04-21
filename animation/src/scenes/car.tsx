import {makeScene2D, Camera, Txt, Img} from '@motion-canvas/2d';
import {
    all, chain, createDeferredEffect, createEffect,
    createRef, createSignal,
    linear,
    tween, useLogger, Vector2,
    waitFor, waitUntil,

} from '@motion-canvas/core';
import {AGENT_EYE_RADIUS, AGENT_EYES_OFFSET, Car, TIRE_DIAMETER} from '../custom/car'
import {Message} from '../custom/message'

export const MESSAGE_START_POSITION = new Vector2(0, -150)
export const AUTOCHARGE_Y = -150
export const BOSCH_Y = 150

export default makeScene2D(function* (view) {
    const background = createRef<Img>();

    const car = createRef<Car>();
    const camera = createRef<Camera>();

    const autoCharge = createRef<Txt>();
    const bosch = createRef<Img>();

    const message = createRef<Message>();

    const hideAutoCharge = createSignal(false)
    const autoChargeX = createSignal(() => {
            if (hideAutoCharge()) {
                return 2000;
            } else if (car().position.x() > -autoCharge().width() * 0.73) {
                return car().position.x() + autoCharge().width() * 0.73
            } else {
                return 0
            }
        }
    )

    const hideBosch = createSignal(false)
    const boschX = createSignal(() => {
            if (hideBosch()) {
                return -2000;
            } else if (hideAutoCharge() && car().position.x() < autoCharge().width() * 0.65) {
                return car().position.x() - bosch().width() * 0.65
            } else {
                return 0
            }
        }
    )

    view.add(<Camera ref={camera}>
        <Img ref={background} src={"resources/background.svg"} height={1920} width={1920}/>
        <Txt ref={autoCharge} position={() => [autoChargeX(), AUTOCHARGE_Y + 50]} fontSize={200}
             fontFamily={'helvetica'}>AutoCharge</Txt>
        <Img ref={bosch} position={() => [boschX(), BOSCH_Y]} height={400} width={1000}
             src={'resources/bosch.svg'}/>

        <Car ref={car} position={[-1400, AUTOCHARGE_Y + 50]}/>
        <Message ref={message} width={75} position={MESSAGE_START_POSITION} scale={0}/>
    </Camera>);

    yield* waitUntil("Logo")

    yield* all(
        car().position([1400, AUTOCHARGE_Y + 50], 1.5),
        tween(1.5, value => {
            car().soc(linear(value, 1, 0.7));
        })
    )
    hideAutoCharge(true);

    yield* waitUntil("bosch")

    car().flipped(true)
    car().position([1400, BOSCH_Y - 50])

    yield* all(
        car().position([-1400, BOSCH_Y - 50], 1.5),
        tween(1.5, value => {
            car().soc(linear(value, 0.7, 0.4));
        })
    )

    hideBosch(true)

    car().flipped(false)
    car().position([-1400, 0])

    camera().scale(0.5)
    background().scale(0.5)

    yield* waitUntil("carCenter")

    yield* all(
        car().position([0, 0], 1),
        tween(1, value => {
            car().soc(linear(value, 0.4, 0.2));
        })
    )

    yield* waitFor(0.1)
    car().look(Vector2.left)
    yield* waitFor(1)
    let messagePosition = message().position();
    let agentPosition = car().position().add(AGENT_EYES_OFFSET);
    let direction = messagePosition.sub(agentPosition).normalized;
    car().look(direction);
    yield* waitFor(0.25)
    createDeferredEffect(() => {
        let messagePosition = message().position();
        let agentPosition = car().position().add(AGENT_EYES_OFFSET);

        let direction = messagePosition.sub(agentPosition).normalized;
        direction = direction.mul(new Vector2(AGENT_EYE_RADIUS, AGENT_EYE_RADIUS));
        useLogger().info("Direction: " + direction);
        car().eyeOffset(direction);
    })
    yield* message().scale(1, 1)

    yield* all(
        message().position.y(message().position().y - 2000, 1.5),
        chain(
            waitFor(0.1),
            camera().position.y(car().position().y - 4000, 1.5),
        )
    )
});
