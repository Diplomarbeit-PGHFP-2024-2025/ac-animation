import {Circle, Img, Node, makeScene2D, Grid, View2D, Rect} from '@motion-canvas/2d';
import {all, any, chain, createRef, Reference, ThreadGenerator, waitFor} from "@motion-canvas/core";
import {useFormattedNumber} from "@motion-canvas/ui";

const CELL_SIZE = 80;

const HOUSES = [
    {x: 10, y: -300, width: 400, height: 200},
    {x: 400, y: 0, width: 500, height: 200},
    {x: -300, y: 200, width: 300, height: 300}
]


export default makeScene2D(function* (view) {
    yield* all(
        displayHouses(view),
        displayGrid(view),
        displayGridMaker(view)
    )
})

function* displayGrid(parent: Node): ThreadGenerator {
    const grid = createRef<Grid>();

    parent.add(<>
        <Grid
            ref={grid}
            width={'100%'}
            height={'100%'}
            stroke={'#666'}
            start={0.5}
            end={0.5}
            lineWidth={3}
            spacing={[CELL_SIZE, CELL_SIZE]}
            zIndex={-1}
        />
    </>);

    yield* waitFor(3)
    yield* all(
        grid().end(0.0, 1),
        grid().start(1.0, 1),
    );
}

function* displayHouses(parent: Node): ThreadGenerator {

    let group = <Node></Node>
    parent.add(group)

    let houses = HOUSES.map((house) => createHouse(group, house.x, house.y, house.width, house.height))

    yield* all(
        ...houses.map((house) => house().scale(1, 1))
    )
    yield* chain(
        waitFor(10),
        all(
            ...houses.map((house) => house().opacity(0.0, 1))
        )
    )
}

function createHouse(parent: Node, x: number, y: number, width: number, height: number): Reference<Rect> {
    let rect = createRef<Rect>();

    parent.add(<Rect
            ref={rect}
            position={[x, y]}
            width={width}
            height={height}
            scale={0}
            opacity={0.8}
            fill={'#ccc'}
        />);

    return rect;
}

function* displayGridMaker(parent: Node): ThreadGenerator {
    let group = <Node></Node>
    parent.add(group)

    yield* waitFor(5)

    for (let house of HOUSES) {
        const startX = Math.floor((house.x - house.width / 2) / CELL_SIZE);
        const endX = Math.ceil((house.x + house.width / 2) / CELL_SIZE);
        const startY = Math.floor((house.y - house.height / 2) / CELL_SIZE);
        const endY = Math.ceil((house.y + house.height / 2) / CELL_SIZE);

        for (let x = startX; x < endX; x += 1) {
            for (let y = startY; y < endY; y += 1) {
                let rect = createRef<Rect>();

                parent.add(<Rect
                        ref={rect}
                        position={[x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2]}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        scale={0}
                        zIndex={-2}
                        fill={'#000'}
                    />);

                yield* any(
                    rect().scale(1,1),
                    waitFor(0.05)
                )
            }
        }
    }

    yield* waitFor(1)
}


