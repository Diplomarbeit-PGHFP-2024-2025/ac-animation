import {makeScene2D, Img, Layout, Node, Rect} from '@motion-canvas/2d';
import {all, createRef, ThreadGenerator, waitFor} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
    let layout = <Layout gap={800} width={1000} alignContent={'center'} layout></Layout>
    view.add(layout);

    yield* all(
        addAgent(layout, "resources/agent_body.svg"),
        addAgent(layout, "resources/station_body.svg")
    )
});

function* addAgent(parent: Node, src: string): ThreadGenerator {
    const img = createRef<Img>();
    const rect = createRef<Rect>();

    parent.add(
        <Layout height={900} gap={20} alignItems={'center'} justifyContent={'center'} direction={'column'} layout>
            <Img ref={img} src={src} size={100} scale={0}/>
            <Rect ref={rect} width={10} height={0} radius={20} fill="#000"/>
        </Layout>
    )

    yield* all(
        img().scale(1, 1),
        rect().height(600, 1)
    )

    yield* waitFor(10);

    yield* all(
        img().scale(0, 1),
        rect().height(0, 1)
    )
}

