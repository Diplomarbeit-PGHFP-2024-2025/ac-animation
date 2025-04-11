import {makeScene2D, Img, Layout, Node, Line, Rect, View2D, Txt} from '@motion-canvas/2d';
import {
    all,
    chain,
    createRef, createSignal,
    Reference, SimpleSignal,
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

interface MessagePath {
    a: Vector2,
    b: Vector2,
    message: string
    scale: SimpleSignal<number>,
    left: boolean,
}

class CommunicationAnimation {
    private REGISTRY_MESSAGE_PATH: MessagePath[] = [
        {
            a: new Vector2(-350, -150),
            b: new Vector2(-100, -150),
            message: "Nahe Stationen?",
            scale: createSignal(0),
            left: true
        },
        {
            a: new Vector2(-100, -50),
            b: new Vector2(-350, -50),
            message: "Stationen",
            scale: createSignal(0),
            left: false
        },
    ]

    private STATION_MESSAGE_PATH: MessagePath[] = [
        {
            a: new Vector2(-350, 50),
            b: new Vector2(350, 50),
            message: "Deine Parameter?",
            scale: createSignal(0),
            left: false
        },
        {a: new Vector2(350, 150), b: new Vector2(-350, 150), message: "Parameter", scale: createSignal(0), left: true},
        {
            a: new Vector2(-350, 250),
            b: new Vector2(350, 250),
            message: "Reservieren?",
            scale: createSignal(0),
            left: false
        },
        {a: new Vector2(350, 350), b: new Vector2(-350, 350), message: "Ok", scale: createSignal(0), left: true},
    ]

    private readonly scene: Node;

    private readonly layout = createRef<Layout>();
    private readonly message = createRef<Node>();
    private agents: Agent[] = []
    private readonly messageText = createSignal<string>("abc")
    private lines: Reference<Line>[] = []

    constructor() {
        this.scene = <Node>
            <Layout ref={this.layout} width={1000} justifyContent={'space-between'} layout></Layout>
            <Node ref={this.message} scale={0} position={[500, 500]} zIndex={2}>
                <Message width={60}/>
            </Node>
        </Node>

        this.addAgent("resources/agent.svg")
        this.addAgent("resources/registry_body.svg")
        this.addAgent("resources/station_body.svg")

        this.addText()
    }

    * animate(view: View2D): ThreadGenerator {
        view.add(this.scene)

        yield* all(
            this.appearAgent(this.agents[0]),
            this.appearAgent(this.agents[1]),
            this.appearAgent(this.agents[2]),
        )

        yield* this.animateMessage(this.REGISTRY_MESSAGE_PATH)

        yield* this.animateMessage(this.STATION_MESSAGE_PATH)

        yield* waitFor(0.5)
        yield* all(
            this.disappearAgent(this.agents[0]),
            this.disappearAgent(this.agents[1]),
            this.disappearAgent(this.agents[2]),
            this.disappearLines(),
            this.disappearText()
        )

        yield* waitFor(10)
    }

    addAgent(src: string) {
        const agent: Agent = {img: createRef<Img>(), rect: createRef<Rect>()};

        this.layout().add(
            <Layout height={1000} gap={20} alignItems={'center'} justifyContent={'center'} direction={'column'} layout>
                <Img ref={agent.img} src={src} size={100} scale={0}/>
                <Rect ref={agent.rect} width={10} height={0} radius={20} fill="#000"/>
            </Layout>
        )

        this.agents.push(agent)
    }

    addText() {
        for (let path of [...this.REGISTRY_MESSAGE_PATH, ...this.STATION_MESSAGE_PATH]) {
            const position = path.b.add(path.a).div(new Vector2(2, 2)).add(new Vector2(0, -35));

            if (position.x === 0) {
                if (!path.left) {
                    position.x = -150;
                } else {
                    position.x = 150;

                }
            }

            useLogger().info("" + position)
            this.scene.add(
                <Txt scale={path.scale} zIndex={3} position={position} text={path.message} fontSize={25}/>
            )
        }
    }

    * appearAgent(agent: Agent): ThreadGenerator {
        yield* all(
            agent.img().scale(1, 1),
            agent.rect().height(700, 1)
        )
    }

    * disappearAgent(agent
                     :
                     Agent
    ):
        ThreadGenerator {
        yield* all(
            agent.img().scale(0, 1),
            agent.rect().height(0, 1)
        );
    }

    * animateMessage(path
                     :
                     MessagePath[]
    ):
        ThreadGenerator {
        for (let i = 0; i < path.length; i++) {
            this.messageText(path[i].message)
            this.message().position(path[i].a)
            yield* this.message().scale(1, 0.5)

            const line = createRef<Line>();
            this.scene.add(<Line ref={line} end={0} points={[path[i].a, path[i].b]} endArrow lineWidth={6}
                                 arrowSize={20}
                                 stroke={'black'}/>);
            this.lines.push(line);
            yield* all(
                this.message().position(path[i].b, 1),
                line().end(1, 1.1),
                path[i].scale(1, 0.5)
            )
            yield* this.message().scale(0, 0.5)
        }
    }

    *disappearLines(): ThreadGenerator {
        const actions = this.lines.map(line => line().end(0, 1))

        yield* all(...actions)
    }

    *disappearText(): ThreadGenerator {
        const actions = []
        for (let path of [...this.REGISTRY_MESSAGE_PATH, ...this.STATION_MESSAGE_PATH]) {
            actions.push(path.scale(0,1))
        }

        yield* all(...actions)
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
