import {NodeProps, Node, Img, initial, signal, computed, Circle, Layout, Rect} from "@motion-canvas/2d";
import {
    createEffect,
    createRef,
    createSignal, Reference,
    SignalValue,
    SimpleSignal,
    useLogger,
    Vector2
} from "@motion-canvas/core";

export const TIRE_DIAMETER = 70;
export const FRONT_TIRE_OFFSET = new Vector2(138, 71)
export const BACK_TIRE_OFFSET = new Vector2(-181, 71)

export const BATTERIE_OFFSET = new Vector2(-15, 30)
export const BATTERIE_WIDTH = 125
export const INTERNAL_BATTERIE_WIDTH = BATTERIE_WIDTH * 0.75
export const LEFT_INTERNAL_BATTERIE_OFFSET = -BATTERIE_WIDTH / 2 + INTERNAL_BATTERIE_WIDTH / 2 + BATTERIE_WIDTH * 0.1
export const BATTERIE_BAR_COUNT = 5
export const BATTERIE_BAR_GAP = 8
export const BATTERIE_BAR_WIDTH = (INTERNAL_BATTERIE_WIDTH - (BATTERIE_BAR_COUNT - 1) * BATTERIE_BAR_GAP) / BATTERIE_BAR_COUNT
export const INTERNAL_BATTERIE_HEIGHT_FACTOR = 0.65

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

    private batterieColor = createSignal(() => {
        if (this.soc() < 0.35) {
            return "red"
        } else if (this.soc() < 0.65) {
            return "orange"
        } else {
            return "green"
        }
    })

    public constructor(props?: CarProps) {
        super({
            ...props,
        });

        const carParent = createRef<Node>();

        const tireRotation = this.computedTireRotation();
        const scale = this.createFlippedScale();
        const socLevel = this.computedSocLevel();

        const barContainer = createRef<Layout>();
        const batterie = createRef<Img>()

        this.add(<Node ref={carParent} position={this.position} scaleX={scale}>
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
            <Img src={'resources/tire.svg'} position={[BACK_TIRE_OFFSET.x, BACK_TIRE_OFFSET.y]} width={TIRE_DIAMETER}
                 height={TIRE_DIAMETER}
                 rotation={tireRotation}/>
            <Img src={'resources/tire.svg'} position={[FRONT_TIRE_OFFSET.x, FRONT_TIRE_OFFSET.y]} width={TIRE_DIAMETER}
                 height={TIRE_DIAMETER}
                 rotation={tireRotation}/>
        </Node>)

        const bars: Rect[] = []
        createEffect(() => {
            const currentAmount = bars.length;
            const barCountChange = socLevel() - currentAmount;

            for (let i = 0; i < barCountChange; i++) {
                const bar = (<Rect
                    width={BATTERIE_BAR_WIDTH}
                    height={() => batterie().height() * INTERNAL_BATTERIE_HEIGHT_FACTOR}
                    fill={this.batterieColor}
                />) as Rect;

                bars.push(bar);
                barContainer().add(bar);
            }

            for (let i = 0; i < -barCountChange; i++) {
                bars.pop().remove();
            }
        })
    }

    private createFlippedScale(): SimpleSignal<number> {
        const carScale = createSignal<number>(1)
        createEffect(() => {
            if (this.flipped()) {
                carScale(-1)
            } else {
                carScale(1)
            }
        })
        return carScale;
    }

    private computedTireRotation(): SimpleSignal<number> {
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

    private computedSocLevel(): SimpleSignal<number> {
        return createSignal(() => {
            return Math.round(this.soc() * BATTERIE_BAR_COUNT)
        })
    }

    private createBatterieBar(batterie: Reference<Layout>) {

    }
}