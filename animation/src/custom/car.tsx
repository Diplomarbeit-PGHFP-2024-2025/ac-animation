import {NodeProps, Node, Img} from "@motion-canvas/2d";
import {createEffect, createRef, createSignal, SimpleSignal, Vector2} from "@motion-canvas/core";

export const TIRE_DIAMETER = 100;

export interface CarProps extends NodeProps {
}

export class Car extends Node {
    public constructor(props?: CarProps) {
        super({
            ...props,
        });

        const carParent = createRef<Node>();

        const tireRotation = this.computedTireRotation();

        this.add(<Node ref={carParent} position={this.position}>
            <Img src={'resources/tire.svg'} position={[-150, 0]} width={TIRE_DIAMETER} height={TIRE_DIAMETER}
                 rotation={tireRotation}/>
            <Img src={'resources/tire.svg'} position={[150, 0]} width={TIRE_DIAMETER} height={TIRE_DIAMETER}
                 rotation={tireRotation}/>
        </Node>)
    }

    private computedTireRotation(): SimpleSignal<number> {
        const tireRotation = createSignal<number>(0);

        let lastPosition = this.position();
        createEffect(() => {
            const currentPosition = this.position();

            const distanceTraveled = Math.sign(currentPosition.sub(lastPosition).x) * currentPosition.sub(lastPosition).magnitude;
            const degreesTurned = distanceTraveled / (Math.PI * TIRE_DIAMETER) * 360;
            tireRotation(tireRotation() + degreesTurned);

            lastPosition = currentPosition;
        })

        return tireRotation;
    }
}