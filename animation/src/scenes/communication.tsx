import {makeScene2D, Img, Layout, Node, Rect, View2D} from '@motion-canvas/2d';
import {
    all,
    chain,
    createRef,
    Reference,
    spawn,
    ThreadGenerator,
    useLogger,
    Vector2,
    waitFor
} from "@motion-canvas/core";
import {Message} from "../custom/message"
import {MESSAGE_START_POSITION} from "./car";

interface Agent {
    img: Reference<Img>
    rect: Reference<Rect>
}

class CommunicationAnimation {
    private MESSAGE_PATH = [
        new Vector2(-400, -200), new Vector2(400, -200),
        new Vector2(400, -50), new Vector2(-400, -50),
        new Vector2(-400, 100), new Vector2(400, 100),
        new Vector2(400, 250), new Vector2(-400, 250),
    ]

    private readonly scene: Node;

    private readonly layout = createRef<Layout>();
    private readonly message = createRef<Message>();
    private agents: Agent[] = []

    constructor() {
        this.scene = <>
            <Layout ref={this.layout} gap={800} width={1000} alignContent={'center'} layout></Layout>
            <Message ref={this.message} scale={0} width={75} position={[500, 500]}/>
        </>

        this.addAgent("resources/agent_body.svg")
        this.addAgent("resources/station_body.svg")
    }

    * animate(view: View2D): ThreadGenerator {
        view.add(this.scene)

        yield* this.appearAgents()
        yield* this.animateMessage()

        yield* waitFor(10)
    }

    addAgent(src: string) {
        const agent: Agent = {img: createRef<Img>(), rect: createRef<Rect>()};

        this.layout().add(
            <Layout height={900} gap={20} alignItems={'center'} justifyContent={'center'} direction={'column'} layout>
                <Img ref={agent.img} src={src} size={100} scale={0}/>
                <Rect ref={agent.rect} width={10} height={0} radius={20} fill="#000"/>
            </Layout>
        )

        this.agents.push(agent)
    }

    * appearAgents(): ThreadGenerator {
        const actions = this.agents.map((agent: Agent) => {
            return all(
                agent.img().scale(1, 1),
                agent.rect().height(600, 1)
            )
        });

        yield* all(
            ...actions
        );
    }

    * animateMessage(): ThreadGenerator {
        this.message().position(this.MESSAGE_PATH[0])
        yield* this.message().scale(1,0.5)
        yield* waitFor(0.5)

        for (let i = 1; i < this.MESSAGE_PATH.length; i+=2) {
            yield* this.message().position(this.MESSAGE_PATH[i], 1)
            yield* this.message().scale(0,0.5)
            if (i < this.MESSAGE_PATH.length - 2) {
                this.message().position(this.MESSAGE_PATH[i + 1])
                yield* this.message().scale(1,0.5)
            }
        }
    }
}


export default makeScene2D(function* (view) {
    yield* new CommunicationAnimation().animate(view)

    // const message = createRef<Message>()
    //
    // let layout = <Layout gap={800} width={1000} alignContent={'center'} layout></Layout>;
    // view.add(layout);
    // view.add(<Message ref={message} scale={1} width={75} position={[500, 500]}/>);
    //
    // yield* all(
    //     addAgent(layout, "resources/agent_body.svg"),
    //     addAgent(layout, "resources/station_body.svg")
    // )
    //
    // useLogger().info("Moin")
    // message().position([0, 0])
    // yield* waitFor(15)
});
//
// function* addAgent(parent: Node, src: string): ThreadGenerator {
//     const img = createRef<Img>();
//     const rect = createRef<Rect>();
//
//     parent.add(
//         <Layout height={900} gap={20} alignItems={'center'} justifyContent={'center'} direction={'column'} layout>
//             <Img ref={img} src={src} size={100} scale={0}/>
//             <Rect ref={rect} width={10} height={0} radius={20} fill="#000"/>
//         </Layout>
//     )
//
//
//     yield* all(
//         img().scale(1, 1),
//         rect().height(600, 1)
//     )
//
//     spawn(chain(
//         waitFor(10),
//         all(
//             img().scale(0, 1),
//             rect().height(0, 1)
//         )
//     ))
// }
//
// function* animateMessage(message: Reference<Message>): ThreadGenerator {
//     message().position(MESSAGE_PATH[0])
// }
//
