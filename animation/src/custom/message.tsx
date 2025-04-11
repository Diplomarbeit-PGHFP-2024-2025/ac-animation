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

export interface MessageProps extends NodeProps {
    opened?: SignalValue<boolean>,
    width?: SignalValue<number>,
}

export class Message extends Node {
    @initial(false)
    @signal()
    public declare readonly opened: SimpleSignal<boolean>

    @initial(0)
    @signal()
    public declare readonly width: SimpleSignal<number>

    public constructor(props?: MessageProps) {
        super({
            ...props,
        });

        const svgPath = createSignal(() => {
            if (this.opened()) {
                return "resources/message.svg"
            } else {
                return "resources/message_open.svg"
            }
        });

        this.add(<Img src={svgPath} width={this.width}></Img>);
    }
}