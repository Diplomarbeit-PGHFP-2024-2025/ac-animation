import {Circle, Img, Node, makeScene2D, Grid, View2D, Rect, Line, Camera} from '@motion-canvas/2d';
import {
    all,
    any,
    chain,
    createRef,
    createSignal,
    Reference,
    spawn,
    ThreadGenerator,
    waitFor, waitUntil,
    useDuration
} from "@motion-canvas/core";
import SAT, {Vector} from 'sat';
import {Car} from "../custom/car";

type House = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number
}

const CELL_SIZE = 80;

const HOUSES: House[] = [
    {x: 10, y: -300, width: 400, height: 200, rotation: 30},
    {x: 450, y: 0, width: 500, height: 200, rotation: 0},
    {x: -300, y: 200, width: 300, height: 300, rotation: 45},
]

const BASE_PATH: [number, number][] = [[-11.5, -4], [-10, -4], [-10, -3], [-9, -3], [-9, -2], [-8, -2], [-3, -2], [-3, -1], [-2, -1], [-2, 0], [-1, 0], [-1, 1], [1, 1], [1, 2], [12, 2]]
const OPTIMIZED_PATH: [number, number][] = [[-11.5, -4], [-10, -4], [-3, -2], [1, 2], [13, 2]]


export default makeScene2D(function* (view) {
    const car = createRef<Car>();
    const camera = createRef<Camera>();

    view.add(<Camera ref={camera} position={[0, -4000]}>
        <Car ref={car} position={[0, 0]}/>
    </Camera>);
    camera().scale(5)

    yield* all(
        camera().scale(1, 2),
        camera().position([0, 0], 2)
    )

    yield* all(
        camera().scale(3, 1),
        camera().position([2730, 900], 1)
    )

    spawn(car().opacity(1,2).do(() => car().remove()))

    yield* all(
        displayHouses(view),
        displayGrid(view),
        displayGridMarker(view),
        displayPath(view)
    )
})

function* displayPath(parent: Node): ThreadGenerator {
    const basicLine = createRef<Line>();
    const optimizedLine = createRef<Line>();

    const progress = createSignal(0);

    const basePath: [number, number][] = BASE_PATH.map((point) => [point[0] * CELL_SIZE + CELL_SIZE / 2, point[1] * CELL_SIZE + CELL_SIZE / 2]);
    const optimizedPath: [number, number][] = OPTIMIZED_PATH.map((point) => [point[0] * CELL_SIZE + CELL_SIZE / 2, point[1] * CELL_SIZE + CELL_SIZE / 2]);
    const car = createRef<Img>();

    parent.add(
        <>
            <Line
                ref={basicLine}
                points={basePath}
                end={0}
                stroke={'lightseagreen'}
                lineWidth={8}
            />,
            <Line
                ref={optimizedLine}
                points={optimizedPath}
                end={0}
                stroke={'lightseagreen'}
                lineWidth={8}
            />,
            <Img
                ref={car}
                opacity={0}
                src={"resources/car_top_down.svg"}
                size={128}
                position={() => optimizedLine().getPointAtPercentage(progress()).position}
                rotation={() => optimizedLine().getPointAtPercentage(progress()).tangent.degrees}
            />,
        </>
    );

    spawn(car().opacity(1,1))

    yield* waitUntil('basicPath');
    yield* basicLine().end(1, 1);
    yield* waitUntil('optimizedPath')
    yield* all(
        basicLine().start(1, 3),
        optimizedLine().end(1, 3)
    );
    yield* waitUntil('smoothPath')
    yield* optimizedLine().radius(256, 1)
    yield* waitUntil('carFollowPath')
    yield* all(
        progress(1, 3, value => value),
        optimizedLine().opacity(0, 1)
    )
}

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

    yield* waitUntil('gridAppear');
    yield* all(
        grid().end(0.0, 1),
        grid().start(1.0, 1),
    );
    yield* waitUntil('gridDisappear');
    yield* all(
        grid().end(0.5, 1),
        grid().start(0.5, 1),
    );
}

function* displayHouses(parent: Node): ThreadGenerator {

    let group = <Node></Node>
    parent.add(group)

    let houses = HOUSES.map((house) => createHouse(group, house))

    yield* all(
        ...houses.map((house) => house().scale(1, 1))
    )
}

function createHouse(parent: Node, house: House): Reference<Img> {
    let img = createRef<Img>();

    parent.add(
        <Img src={'resources/rooftop.svg'}
             ref={img}
             position={[house.x, house.y]}
             width={house.width}
             height={house.height}
             rotation={house.rotation}
             scale={0}
             fill={'#ccc'}
        />
    );

    return img;
}

function* displayGridMarker(parent: Node): ThreadGenerator {
    let group = <Node></Node>
    parent.add(group)

    yield* waitUntil("gridCells")

    yield* all(
        ...HOUSES.map(value => displayHouseMarker(group, value))
    )
}

function* displayHouseMarker(parent: Node, house: House): ThreadGenerator {
    let group = <Node></Node>
    parent.add(group)

    const startX = Math.floor((house.x - house.width) / CELL_SIZE);
    const endX = Math.ceil((house.x + house.width) / CELL_SIZE);
    const startY = Math.floor((house.y - house.height) / CELL_SIZE);
    const endY = Math.ceil((house.y + house.height) / CELL_SIZE);

    for (let x = startX; x < endX; x += 1) {
        for (let y = startY; y < endY; y += 1) {
            let rect = createRef<Rect>();

            if (!doesIntersect(house, x, y)) {
                continue;
            }

            parent.add(<Rect
                ref={rect}
                position={[x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2]}
                width={CELL_SIZE}
                height={CELL_SIZE}
                scale={0}
                fill={'#555'}
            />);

            spawn(rect().scale(1, 1))

            yield* waitFor(0.05)

            spawn(chain(
                waitFor(10),
                rect().scale(0, 1),
            ))
        }
    }
}

function doesIntersect(house: House, cellX: number, cellY: number): boolean {
    const cellBox = new SAT.Box(
        new SAT.Vector(cellX * CELL_SIZE, cellY * CELL_SIZE),
        CELL_SIZE,
        CELL_SIZE
    ).toPolygon();

    const houseBox = new SAT.Box(
        new SAT.Vector(house.x - house.width / 2, house.y - house.height / 2),
        house.width,
        house.height
    ).toPolygon();

    houseBox.translate(-house.width / 2, -house.height / 2);
    houseBox.rotate(house.rotation * (Math.PI / 180));
    houseBox.translate(house.width / 2, house.height / 2);

    return SAT.testPolygonPolygon(cellBox, houseBox);
}
