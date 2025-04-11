import {NodeProps, Node, Img, initial, signal, Layout, Rect} from "@motion-canvas/2d";
import {
    Color,
    createEffect,
    createRef,
    createSignal,
    easeInOutQuad,
    Reference,
    SignalValue,
    SimpleSignal,
    spawn, tween,
    Vector2
} from "@motion-canvas/core";

export const TIRE_DIAMETER = 70;
export const FRONT_TIRE_OFFSET = new Vector2(138, 71)
export const BACK_TIRE_OFFSET = new Vector2(-181, 71)

export const BATTERIE_OFFSET = new Vector2(-75, 30)
export const BATTERIE_WIDTH = 125
export const INTERNAL_BATTERIE_WIDTH = BATTERIE_WIDTH * 0.75
export const LEFT_INTERNAL_BATTERIE_OFFSET = -BATTERIE_WIDTH / 2 + INTERNAL_BATTERIE_WIDTH / 2 + BATTERIE_WIDTH * 0.1

export const BATTERIE_BAR_COUNT = 5
export const BATTERIE_BAR_GAP = 8
export const BATTERIE_BAR_WIDTH = (INTERNAL_BATTERIE_WIDTH - (BATTERIE_BAR_COUNT - 1) * BATTERIE_BAR_GAP) / BATTERIE_BAR_COUNT
export const INTERNAL_BATTERIE_HEIGHT_FACTOR = 0.65

export const AGENT_OFFSET = new Vector2(50, 30)
export const AGENT_WIDTH = 70
export const AGENT_EYES_OFFSET = new Vector2(50, 25)
export const AGENT_EYES_WIDTH = 28
export const AGENT_EYE_RADIUS = 4;

export interface CarProps extends NodeProps {
    flipped?: SignalValue<boolean>
    soc?: SignalValue<number>
}

export class Car extends Node {
    @initial(false)
    @signal()
    public declare readonly flipped: SimpleSignal<boolean>

    @initial(1)
    @signal()
    public declare readonly soc: SimpleSignal<number>

    private batterieColor = this.getBatterieColor()
    private tireRotation = this.getTireRotation();
    public eyeOffset = createSignal(Vector2.zero);

    public constructor(props?: CarProps) {
        super({
            ...props,
        });

        const carParent = createRef<Node>();
        const scale = this.carFlipScaleX();

        const batterie = createRef<Img>()
        const barContainer = createRef<Layout>();

        this.add(<Node ref={carParent} scaleX={scale}>
            <Img src={'resources/car_body.svg'}></Img>


            <Img ref={batterie} src={'resources/batterie.svg'} position={BATTERIE_OFFSET} width={BATTERIE_WIDTH}>
                <Layout layout
                        ref={barContainer}
                        justifyContent={'start'}
                        alignItems={'center'}
                        gap={BATTERIE_BAR_GAP}
                        width={INTERNAL_BATTERIE_WIDTH}
                        position={[LEFT_INTERNAL_BATTERIE_OFFSET, 0]}>
                </Layout>
            </Img>

            <Img src={'resources/agent_body.svg'} position={AGENT_OFFSET} width={AGENT_WIDTH}></Img>
            <Img src={'resources/agent_eyes.svg'}
                 position={() => AGENT_EYES_OFFSET.add(this.eyeOffset())}
                 width={AGENT_EYES_WIDTH}></Img>


            <Img src={'resources/tire.svg'} position={[BACK_TIRE_OFFSET.x, BACK_TIRE_OFFSET.y]} width={TIRE_DIAMETER}
                 height={TIRE_DIAMETER}
                 rotation={this.tireRotation}/>

            <Img src={'resources/tire.svg'} position={[FRONT_TIRE_OFFSET.x, FRONT_TIRE_OFFSET.y]} width={TIRE_DIAMETER}
                 height={TIRE_DIAMETER}
                 rotation={this.tireRotation}/>
        </Node>)

        this.displayBatterie(batterie, barContainer)
    }

    private displayBatterie(batterie: Reference<Img>, barContainer: Reference<Layout>) {
        const socLevel = this.getSocLevel();
        const batterieHeight = batterie().height();

        const bars: Rect[] = []
        createEffect(() => {
            const currentAmount = bars.length;
            const barCountChange = socLevel() - currentAmount;

            for (let i = 0; i < barCountChange; i++) {
                const bar = (<Rect
                    width={0}
                    height={batterieHeight * INTERNAL_BATTERIE_HEIGHT_FACTOR}
                    fill={this.batterieColor}
                />) as Rect;

                bars.push(bar);
                barContainer().add(bar);
                spawn(bar.width(BATTERIE_BAR_WIDTH, 0.25))
            }

            for (let i = 0; i < -barCountChange; i++) {
                let bar = bars.pop();
                spawn(bar.size(0, 0.25).do(() => bar.remove()));
            }
        })
    }

    public look(direction: Vector2) {
        const currentDirection = this.eyeOffset()
        spawn(tween(0.25, value => {
            this.eyeOffset(Vector2.lerp(
                currentDirection,
                direction.mul(new Vector2(AGENT_EYE_RADIUS)),
                easeInOutQuad(value)
            ))
        }))
    }

    private carFlipScaleX(): SimpleSignal<number> {
        return createSignal(() => {
            if (this.flipped()) {
                return -1
            } else {
                return 1
            }
        })
    }

    private getTireRotation(): SimpleSignal<number> {
        const tireRotation = createSignal<number>(0);
        let lastPosition = this.position();
        createEffect(() => {
            const currentPosition = this.position();
            const distanceTraveled = currentPosition.sub(lastPosition).magnitude;
            const degreesTurned = distanceTraveled / (Math.PI * TIRE_DIAMETER) * 360;
            tireRotation(tireRotation() + degreesTurned);

            lastPosition = currentPosition;
        })
        return tireRotation;
    }

    private getSocLevel(): SimpleSignal<number> {
        return createSignal(() => {
            return Math.round(this.soc() * BATTERIE_BAR_COUNT)
        })
    }

    private getBatterieColor(): SimpleSignal<Color> {
        return createSignal(() => {
            return Color.lerp(
                new Color("#ff0000"),
                new Color("#00ff00"),
                easeInOutQuad(this.soc())
            )
        })
    }
}