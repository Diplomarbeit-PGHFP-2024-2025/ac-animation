import {initial, NodeProps, signal, Node, Circle, Rect, Img} from "@motion-canvas/2d";
import {createComputed, createEffect, createRef, SignalValue, SimpleSignal} from "@motion-canvas/core";

export interface CarProps extends NodeProps {
    tireRotation?: SignalValue<number>
}

export class Car extends Node {
    @initial(0)
    @signal()
    public declare readonly tireRotation: SimpleSignal<number>

    public constructor(props?: CarProps) {
        super({
            ...props,
        });

        const parent = createRef<Node>();


        this.add(<Node ref={parent} position={this.position}>
            <Img src={'resources/tire.svg'} position={[-100,0]} rotation={this.tireRotation}/>
            <Img src={'resources/tire.svg'} position={[100,0]} rotation={this.tireRotation}/>
        </Node>)
    }
}