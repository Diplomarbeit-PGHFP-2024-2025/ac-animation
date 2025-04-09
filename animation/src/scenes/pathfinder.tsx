import {Circle, Img, Node, makeScene2D, Grid} from '@motion-canvas/2d';
import {all, createRef, waitFor} from "@motion-canvas/core";

const TIRE_SOURCE = "resources/tire.svg"

export default makeScene2D(function* (view) {
    const grid = createRef<Grid>();

    view.add(<>
        <Grid
            ref={grid}
            width={'100%'}
            height={'100%'}
            stroke={'#666'}
            start={0.5}
            end={0.5}
            lineWidth={2}
            gap={4}
        />,
    </>);

    yield* all(
        grid().end(0.0, 1).wait(1),
        grid().start(1.0, 1).wait(1),
        waitFor(5)
    );
});
