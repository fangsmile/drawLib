import { HashTable, HashValue, List } from './DataStructure';
import { EventUtil } from "./util";
declare global {
  interface MouseEvent {
    toElement: Function;
  }
}

interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    entries(): IterableIterator<[K, V]>;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    keys(): IterableIterator<K>;
    set(key: K, value?: V): Map<K, V>;
    size: number;
    values(): IterableIterator<V>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
}

interface MapConstructor {
    new <K, V>(): Map<K, V>;
    new <K, V>(iterable: Iterable<[K, V]>): Map<K, V>;
    prototype: Map<any, any>;
}
interface IterableIterator<T> {
    next(): any;
}
declare var Map: MapConstructor;




/**
 * !!!!!!!!!!!!!!!!!!!!
 * !!!!注意：阻止默认事件，需要在页面上添加 style="touch-action:none"属性
 * !!!!!!!!!!!!!!!!!!!!
 */



/**
 * 支持的鼠标和触控事件类型
 * 根据业务需求，以鼠标操作为基础，将touch操作映射到鼠标操作，二者进行整合。然后以PointerEvent的基本事件封装成鼠标操作。
 */
export enum PointerEventType {
    pointerDown = 0,
    pointerUp,
    pointerMove,
    click,
    dragStart,
    dragMove,
    dragEnd,
    pointerout,
    pinch,
    pinchEnd,
    fiveFingerMove,
    moreFingerEnd,
    moreFingerDown
}
export enum ButtonType {
    noButton = -1,//鼠标在无按键的情况下移动
    LTPButton = 0,//Left Mouse, Touch Contact, Pen contact (with no modifier buttons pressed)
    MiddleButton = 1,//Middle Mouse
    RGButton = 2,//Right Mouse, Pen contact with barrel button pressed
    X1Button = 3,//X1 (back) Mouse
    X2Button = 4,//X2 (forward) Mouse
    P_EButton = 5//Pen contact with eraser button pressed
}
export enum ButtonsType {
    noButton = 0,//鼠标在无按键的情况下移动
    LTPButton = 1,//Left Mouse, Touch Contact, Pen contact (with no modifier buttons pressed)
    MiddleButton = 4,//Middle Mouse
    RGButton = 2,//Right Mouse, Pen contact with barrel button pressed
    X1Button = 8,//X1 (back) Mouse
    X2Button = 16,//X2 (forward) Mouse
    P_EButton = 32//Pen contact with eraser button pressed
}

export class HandlerInfo {
    constructor(eventType: PointerEventType, handler: Function, isCancelBubble: boolean, buttonType: ButtonType, applyContext: object) {
        this.eventType = eventType;
        this.handler = handler;
        this.isCancelBubble = isCancelBubble;
        this.buttonType = buttonType;
        this.applyContext = applyContext;
    }
    applyContext: object;
    eventType: PointerEventType;
    handler: Function;
    isCancelBubble: boolean;
    buttonType: ButtonType;
    el: HTMLElement;
}

export class PinchInfo {
    pinchType: string;
    pinchDiff: number;
    events: Array<PointerEvent>;
}

export class PointerEventInfo {
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;

    down: boolean;
    dragging: boolean;
    lastX: number;
    lastY: number;
    startX: number;
    startY: number;
    moveCount: number;
    evt: PointerEvent;
    target: EventTarget;
    pinchType: string;
    pinchDiff: number;
    lastPinchDiff: number;
    pinchMiddleX: number;
    pinchMiddleY: number;
    events: Array<PointerEvent>;

    button: ButtonType;
    noRoteDiffX: number;
    noRoteDiffY: number;
    totalX: number;
    totalY: number;
    contextX: number;
    conttextY: number;
    lastContextX: number;
    lastContextY: number;

    constructor(down: boolean, target: EventTarget, dragging: boolean, lastX: number,
        lastY: number, startX: number, startY: number, moveCount: number, evt: PointerEvent
        , pinchType: string
        , pinchDiff: number
        , lastPinchDiff: number
        , pinchMiddleX: number, pinchMiddleY: number, events: Array<PointerEvent>) {
        this.clientX = evt.clientX;
        this.clientY = evt.clientY;
        this.screenX = evt.screenX;
        this.screenY = evt.screenY;
        this.pageX = evt.pageX;
        this.pageY = evt.pageY;
        this.down = down;
        this.dragging = dragging;
        this.lastX = lastX;
        this.lastY = lastY;
        this.startX = startX;
        this.startY = startY;
        this.moveCount = moveCount;
        this.evt = evt;
        this.target = target;
        this.button = evt.button;
        this.noRoteDiffX = this.clientX - this.lastX;
        this.noRoteDiffY = this.clientY - this.lastY;
        this.totalX = this.clientX - this.startY;
        this.totalY = this.clientY - this.startY;
        this.pinchType = pinchType;
        this.pinchDiff = pinchDiff;
        this.lastPinchDiff = lastPinchDiff;
        this.pinchMiddleX = pinchMiddleX;
        this.pinchMiddleY = pinchMiddleY;
        this.events = events;
    }

}

export class PointerEventWrapper {
    /**
     *
     * 只保留目前需要的事件类型
     * 一次性注册所有事件到目标元素上
     * 每个元素初始化一个该类的实例，
     * 同一类型事件只能绑定一个handler
     */
    pointEventsName: Array<string> = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'mouseout'];

    private screenX: number;
    private screenY: number;
    private clientX: number;
    private clientY: number;
    private pageX: number;
    private pageY: number;
    private down: boolean;
    private dragging: boolean;
    private lastX: number;
    private lastY: number;
    private startX: number;
    private startY: number;
    private moveCount: number;
    private currentRawEvent: PointerEvent;
    private el: HTMLElement;
    private eventHandlers = new HashTable<HashTable<HandlerInfo>>();
    private target: EventTarget;
    private downEvents: Map<number, PointerEvent>;
    private pinchDiff: number;
    private lastPinchDiff: number;
    private pinchType: string;
    private pinchMiddleX: number;
    private pinchMiddleY: number;
    private initState: any;
    private currentState: boolean;
    private moreMoveState: boolean;
    private startFingerCount: number;
    private firstDragMove: boolean;
    private isPrimary: boolean;
    private pointerId: number;  //主控手指的id
    private clickDragging: boolean;
    [key: string]: any;
    private countDown: number;
    private isClearPointer: boolean;
    constructor(el: HTMLElement) {
        this.moveCount = 0;
        this.screenX = 0;
        this.screenY = 0;
        this.clientX = 0;
        this.clientY = 0;
        this.pageX = 0;
        this.pageY = 0;


        this.lastX = 0;
        this.lastY = 0;
        this.startX = 0;
        this.startY = 0;
        this.down = false;
        this.dragging = false;
        this.el = el;
        this.pinchDiff = 0;
        this.downEvents = new Map();
        this.eventHandlers = new HashTable<HashTable<HandlerInfo>>();
        this.initState = {
            "first": false,
            "five": false
        }
        this.currentState = false;
        this.moreMoveState = false;
        this.startFingerCount = 0;
        this.firstDragMove = false;
        this.countDown = 0;
        this.isClearPointer = true;
        this.clickDragging = false;
        this.init();
    }

    init() {
        try {
            var p = this;
            if (this.el) {
                for (let eventName of this.pointEventsName) {
                    EventUtil.on(this.el, eventName, this[eventName + "Handler"].bind(this));
                }
            };
        }
        catch (e) {
            console.log("init", e)
        }
    }
    registerEvent(handlerInfo: HandlerInfo) {
        if (!this.eventHandlers.has(PointerEventType[handlerInfo.eventType])) {
            let eventTypeHandlers = new HashTable<HandlerInfo>();
            this.eventHandlers.set(PointerEventType[handlerInfo.eventType], eventTypeHandlers);

        }
        let eventTypeHandlers = this.eventHandlers.get(PointerEventType[handlerInfo.eventType]);
        if (!eventTypeHandlers.has(ButtonType[handlerInfo.buttonType])) {
            eventTypeHandlers.set(ButtonType[handlerInfo.buttonType], handlerInfo)
        }

    }


    pointerdownHandler(e: PointerEvent): void {

        if (e.button == ButtonType.LTPButton || e.button == ButtonType.RGButton) {
            if (this.downEvents.size < 6) {
                this.downEvents.set(e.pointerId, e);
            }
            this.startFingerCount++;
            this.countDown++;
            if (!this.currentState) {//按下初始化设置几指
                this.initState.first = false;
                this.initState.five = false;
                switch (this.downEvents.size) {
                    case 1:
                        this.initState.first = true;
                        break;
                    case 5:
                        this.initState.five = true;
                        break;
                }
            }
            if (e.isPrimary) {
                this.pointerId = e.pointerId; //主控手指id
                this.down = true;
                this.setXY(e);
                this.dragging = false;
                this.clickDragging = false;
                this.startX = this.pageX;
                this.startY = this.pageY;
                this.lastX = this.pageX;
                this.lastY = this.pageY;
                this.moveCount = 0;
                this.target = e.target;

                this.dispatchEvent(PointerEventType.pointerDown, e.button);
            }
            if (this.countDown == 2 && !this.dragging) {//多指按下的时候清除一指按下点
                this.dispatchEvent(PointerEventType.moreFingerDown, e.button);
                this.isClearPointer = false;
                console.log("清除")
            }
            // // if (e.isPrimary || e.pointerId == this.pointerId) {
            //     if (this.countDown == 2) {
            //         // if (!this.dragging && this.downEvents.size == 2) {//pinch
            //             console.log("2指 down")

            //             let first: any, second: any;
            //             this.downEvents.forEach((value, index, map) => {
            //                 if (first && second)
            //                     return false;
            //                 if (!first)
            //                     first = value;
            //                 else
            //                     second = value;
            //             })

            //             var curDiff = Math.sqrt(Math.pow(first.clientX - second.clientX, 2) + Math.pow(first.clientY - second.clientY, 2));

            //             if (curDiff <= 30)
            //                 this.pinchType = "pinchMove";
            //         // }
            //     }
            // // }
        }
    }

    private getPointerEventInfo(): PointerEventInfo {

        return new PointerEventInfo(this.down, this.target, this.dragging, this.lastX,
            this.lastY, this.startX, this.startY, this.moveCount, this.currentRawEvent
            , this.pinchType, this.pinchDiff, this.lastPinchDiff, this.pinchMiddleX, this.pinchMiddleY, this.downEvents.size > 0 ? Array.prototype.slice.call(this.downEvents.values()) : []);

    }
    private setXY(e: PointerEvent) {
        this.clientX = e.clientX;
        this.clientY = e.clientY;
        this.screenX = e.screenX;
        this.screenY = e.screenY;
        this.pageX = e.pageX;
        this.pageY = e.pageY;
        this.currentRawEvent = e;

    }
    pointermoveHandler(e: PointerEvent): void {
        try {
            if (this.down && this.downEvents.size > 0) {
                if (this.downEvents.has(e.pointerId)) {
                    Object.defineProperty(e, "button", {
                        configurable: true,
                        value: this.downEvents.get(e.pointerId).button
                    });
                    this.downEvents.set(e.pointerId, e);
                }
            } else {
                Object.defineProperty(e, "button", {
                    configurable: true,
                    value: 0
                });
            }

            if (e.button == ButtonType.LTPButton || e.button == ButtonType.RGButton) {
                let pointLlen = this.downEvents.size;
                if (this.down && !this.currentState && this.startFingerCount != pointLlen) {
                    this.initState.first = false;
                    this.initState.five = false;
                    switch (this.downEvents.size) {
                        case 1:
                            this.initState.first = true;
                            break;
                        case 5:
                            this.initState.five = true;
                            break;
                    }
                }

                if (this.down && !this.initState.first && this.isClearPointer) {
                    this.dispatchEvent(PointerEventType.moreFingerDown, e.button);
                    this.isClearPointer = false;
                    console.log("move清除")
                }
                // if (!this.dragging && this.downEvents.size == 2) {//pinch
                //     console.log("2指 move")

                //     let first: any, second: any;
                //     this.downEvents.forEach((value, index, map) => {
                //         if (first && second)
                //             return false;
                //         if (!first)
                //             first = value;
                //         else
                //             second = value;
                //     })

                //     var curDiff = Math.abs(first.clientX - second.clientX);
                //     this.pinchMiddleX = (first.clientX - second.clientX) / 2;
                //     this.pinchMiddleY = (first.clientY - second.clientY) / 2

                //     if (this.pinchDiff > 0) {
                //         if (this.lastPinchDiff > 0) {
                //             if (curDiff > this.pinchDiff) {
                //                 // pinchOut
                //                 this.pinchType = 'pinchOut';
                //                 debugger
                //                 this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                //             }
                //             if (curDiff < this.pinchDiff) {
                //                 //pinchIn
                //                 this.pinchType = 'pinchIn';
                //                 debugger
                //                 this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);

                //             }
                //         }
                //         this.lastPinchDiff = this.pinchDiff;
                //     }
                //     // 缓存当前值
                //     this.pinchDiff = curDiff;
                // }
                this.setXY(e);
                if (pointLlen <= 1 || this.initState.first) {
                    // this.setXY(e);
                    if (!e.isPrimary) {
                        return;
                    }
                    this.moveCount++;
                    let disx = Math.abs(this.pageX - this.startX);
                    let disy = Math.abs(this.pageY - this.startY);


                    let dis = disx > disy ? disx : disy;
                    if (dis > 3) {
                        if (this.down) {
                            this.dragging = true;
                        };
                    }
                    if (dis < 15) {
                        if (this.down && !this.clickDragging) {
                            this.clickDragging = true;
                        };
                    } else {
                        if (this.down && this.clickDragging) {
                            this.clickDragging = false;
                        }
                    }
                    //调用回调
                    if (this.dragging && this.initState.first) {
                        if (!this.currentState && (disx > 10 || disy > 10)) { //判断是否处于拖拽
                            this.firstDragMove = true; //TODO:单指是否执行拖拽
                            this.currentState = true
                        }
                        // console.log("dis",dis)
                        if (dis == 1) {
                            this.dispatchEvent(PointerEventType.dragStart, e.button);
                        }
                        else if (dis > 1) {

                            this.dispatchEvent(PointerEventType.dragMove, e.button);
                        }

                    } else {
                        this.target = e.target;

                        this.dispatchEvent(PointerEventType.pointerMove, e.button);
                    }

                    this.lastX = this.pageX;
                    this.lastY = this.pageY;
                } else {
                    // console.log("isPrimary", e.isPrimary, "e.pointerId == this.pointerId", e.pointerId, this.pointerId)
                    // if (e.isPrimary || e.pointerId == this.pointerId) {//pad上面isPrimary每个手指该属性都是true
                    if (e.pointerId == this.pointerId) {
                        if (!this.currentState && ((Math.abs(this.startY - this.clientY) > 20) || (Math.abs(this.startX - this.clientX) > 20))) {
                            this.moreMoveState = true; //TODO:多指是否执行拖拽
                            this.currentState = true
                        }
                        if (this.moreMoveState && this.initState.five) {
                            this.dispatchEvent(PointerEventType.fiveFingerMove, e.button);
                        }

                        if (this.moreMoveState && this.countDown == 2) {
                            if (!this.dragging && this.downEvents.size == 2) {//pinch
                                if (this.pinchType == "pinchMove") {
                                    this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                                } else {
                                    let first: any, second: any;
                                    this.downEvents.forEach((value, index, map) => {
                                        if (first && second)
                                            return false;
                                        if (!first)
                                            first = value;
                                        else
                                            second = value;
                                    })

                                    var curDiff = Math.sqrt(Math.pow(first.clientX - second.clientX, 2) + Math.pow(first.clientY - second.clientY, 2));
                                    this.pinchMiddleX = (first.clientX + second.clientX) / 2;
                                    this.pinchMiddleY = (first.clientY + second.clientY) / 2;
                                    if (this.pinchDiff > 0) {
                                        if (this.lastPinchDiff > 0) {
                                            if (Math.abs(curDiff - this.pinchDiff) <= 2) {
                                                this.pinchType = 'pinchMove';
                                                this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                                            } else if (curDiff - this.pinchDiff > 0) {
                                                // pinchOut
                                                this.pinchType = 'pinchOut';
                                                this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                                            }
                                            else if (curDiff - this.pinchDiff < 0) {
                                                //pinchIn
                                                this.pinchType = 'pinchIn';
                                                this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);

                                            }
                                        }
                                        this.lastPinchDiff = this.pinchDiff;
                                    }
                                    // 缓存当前值
                                    this.pinchDiff = curDiff;
                                }
                            }
                        }
                        this.lastX = this.pageX;
                        this.lastY = this.pageY;
                    }

                }
            }
        } catch (e) {
            console.log("pointermoveHandler", e)
        }
    }

    private dispatchEvent(enventType: PointerEventType, buttonType: ButtonType): void {
        try {
            if (this.eventHandlers.has(PointerEventType[enventType])) {
                let moveHandlers = this.eventHandlers.get(PointerEventType[enventType]);
                if (moveHandlers.has(ButtonType[buttonType])) {
                    let handlerInfo = moveHandlers.get(ButtonType[buttonType]);
                    handlerInfo.handler.apply(handlerInfo.applyContext, [this.getPointerEventInfo()]);
                }
            }
        } catch (e) {
            console.log("dispatchEvent", e)
        }
    }
    pointerupHandler(e: PointerEvent) {
        // if (e.button == ButtonType.LTPButton || e.button == ButtonType.RGButton) {//加入pinch去掉的，学生笔记双指缩放拖拽画布  加上这个判断全部松开有时候this.downEvents.size不能为0
        this.startFingerCount--;
        this.downEvents.delete(e.pointerId);

        if (this.downEvents.size < 2) {
            this.pinchDiff = 0;
        }

        if (e.pointerId == this.pointerId && !this.initState.first) {
            let point = this.downEvents.values().next().value;//主控手指抬起后，数组里第一个手指作为主控手指
            point && (this.pointerId = point.pointerId) && this.setXY(point);
        }
        this.moveCount++;
        if (this.downEvents.size == 0 && !this.initState.first) {
            this.dispatchEvent(PointerEventType.moreFingerEnd, e.button);
        }
        if (e.isPrimary && this.initState.first) {
            if (this.dragging) {
                this.dispatchEvent(PointerEventType.dragEnd, e.button);
                if (this.clickDragging) {
                    this.dispatchEvent(PointerEventType.click, e.button);
                }
            }
            else {
                this.dispatchEvent(PointerEventType.pointerUp, e.button);
                this.dispatchEvent(PointerEventType.click, e.button);
            }
        }
        if (this.pinchType) {
            this.dispatchEvent(PointerEventType.pinchEnd, ButtonType.LTPButton);
        }
        if (this.downEvents.size == 0) {
            this.down = false;
            this.moreMoveState = false;
            this.currentState = false;
            this.initState.first = false;
            this.initState.five = false;
            this.firstDragMove = false;
            this.startFingerCount = 0;
            this.countDown = 0;
            this.dragging = false;
            this.clickDragging = false;
            this.isClearPointer = true;
        }
        // this.lastX = this.pageX;
        // this.lastY = this.pageY;

        this.pinchDiff = 0;
        this.lastPinchDiff = 0;
        this.pinchType = null;
        // }
    }

    pointercancelHandler(e: PointerEvent) {
        console.log('pointer cancel');

        this.down && this.pointerupHandler(e);
    }

    mouseoutHandler(e: MouseEvent) {
        var to = e.relatedTarget || e.toElement!
        if (!to || (<HTMLElement>to).nodeName == "HTML") {
            this.down && this.pointerupHandler(this.currentRawEvent);
        }
    }

    getXY() {
        return { x: this.clientX, y: this.clientY };
    }
}
