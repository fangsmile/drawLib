import { HashTable, HashValue, List } from './DataStructure';
import { EventUtil } from "./util";
import { XlMath } from '../drawing/GraphLib/XlMath';

// require("./../../shared/hand.js")

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
    fiveFingerMove,
    moreFingerEnd,
    moreFingerDown,
    rightDragMove,//右键拖拽
    threeDragMoveEnd,//三指拖拽结果处理
    swipe,//快速滑动
    pinchEnd
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
// export enum ButtonsType {
//     noButton = 0,//鼠标在无按键的情况下移动
//     LTPButton = 1,//Left Mouse, Touch Contact, Pen contact (with no modifier buttons pressed)
//     MiddleButton = 4,//Middle Mouse
//     RGButton = 2,//Right Mouse, Pen contact with barrel button pressed
//     X1Button = 8,//X1 (back) Mouse
//     X2Button = 16,//X2 (forward) Mouse
//     P_EButton = 32//Pen contact with eraser button pressed
// }

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
    // moveCount: number;
    evt: PointerEvent;
    target: EventTarget;
    pinchType: string;
    pinchDiff: number;
    lastPinchDiff: number;
    pinchMiddleX: number;
    pinchMiddleY: number;
    rotateDegree: number;
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
    initState: any;//按下初始化设置几指  one two three five 
    direction: string;//方向，三指拖拽，swipe快速滑动方向
    constructor(down: boolean, target: EventTarget, dragging: boolean, lastX: number,
        lastY: number, startX: number, startY: number, evt: PointerEvent
        , pinchType: string
        , pinchDiff: number
        , lastPinchDiff: number
        , pinchMiddleX: number, pinchMiddleY: number, rotateDegree: number, direction: string, events: Array<PointerEvent>, initState: any) {
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
        // this.moveCount = moveCount;
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
        this.rotateDegree = rotateDegree;
        this.events = events;
        this.initState = initState;
        this.direction = direction;
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
    private startX: number;//记录主控手指的初始位置
    private startY: number;
    private secondX: number;//记录第二根手指的初始位置
    private secondY: number;
    // private moveCount: number;
    private currentRawEvent: PointerEvent;
    private el: HTMLElement;
    private eventHandlers = new HashTable<HashTable<HandlerInfo>>();
    private target: EventTarget;
    private downEvents: Map<number, PointerEvent>;
    private pinchDis: number;
    private lastPinchDis: number;
    private pinchType: string;
    private lastDegree: number;
    private pinchMiddleX: number;
    private pinchMiddleY: number;
    private rotateDegree: number;
    private initState: any;//按下初始化设置几指  one two three five 
    private currentDragMoveState: boolean; //表示当前是否已经处于拖拽状态 dis>10
    // private moreMoveState: boolean;
    private startFingerCount: number;
    private pointerId: number;  //主控手指的id
    private clickDragging: boolean;
    [key: string]: any;
    private countDown: number;
    private direction: string;
    private swipeInfo: any;
    private startPinchDis: number;//多指 记录两指初始间距
    constructor(el: HTMLElement) {
        // this.moveCount = 0;
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
        this.secondX = 0;
        this.secondY = 0;
        this.down = false;
        this.dragging = false;
        this.el = el;
        this.pinchDis = 0;
        this.lastDegree = null;
        this.direction = null;
        this.downEvents = new Map();
        this.eventHandlers = new HashTable<HashTable<HandlerInfo>>();
        this.initState = {
            "one": false,
            "two": false,
            "three": false,
            "five": false
        }
        this.startPinchDis = null;
        this.currentDragMoveState = false;
        // this.moreMoveState = false;
        this.startFingerCount = 0;
        this.countDown = 0;
        // this.isClearPointer = true;
        this.clickDragging = false;
        this.swipeInfo = {};
        this.init();
    }

    init() {
        var p = this;
        if (this.el) {
            for (let eventName of this.pointEventsName) {
                EventUtil.on(this.el, eventName, this[eventName + "Handler"].bind(this));
            }
        };
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
        console.log("pointer down e.pointerId", e.pointerId, e.pageX, e.pageY);
        //加判断解决该bug  改bug造成的原因是客户端在录微课功能上模拟了鼠标点击事件，导致触屏接收到多余事件 http://jira.xuelebj.net/browse/CLASSROOM-7667
        if(this.downEvents.size>=1&& e.pointerId==1)
            return
        //http://jira.xuelebj.net/browse/CLASSROOM-7671 this.pinchType判断 如果当前有确定了双指行为类型 再加入手指不再当做三指事件
        //http://jira.xuelebj.net/browse/CLASSROOM-7769 this.dragging 判断 如果是已经拖拽状态，再加入手指不再设置
        if(this.pinchType||this.dragging)
            return;
        if (e.button == ButtonType.LTPButton || e.button == ButtonType.RGButton) {
            if (this.downEvents.size < 6) {
                this.downEvents.set(e.pointerId, e);
            }
            this.startFingerCount++;
            this.countDown++;
            this.resetFingers();
            if (!this.pointerId) {
                this.pointerId = e.pointerId; //主控手指id
            }
            this.down = true;
            let mainPointer = this.downEvents.get(this.pointerId);
            this.setXY(mainPointer);
            this.dragging = false;
            this.clickDragging = false;
            this.startX = mainPointer.pageX;
            this.startY = mainPointer.pageY;
            this.lastX = mainPointer.pageX;
            this.lastY = mainPointer.pageY;
            // this.moveCount = 0;
            this.target = mainPointer.target;
            if(e.isPrimary){
                this.dispatchEvent(PointerEventType.pointerDown, e.button);
            }
            this.swipeInfo.prevDate = e.timeStamp;
            this.swipeInfo.prevX = e.pageY;
            this.swipeInfo.prevY = e.pageY;
            // this.swipeInfo.prevDistance = XlMath.distance({ x: 0, y: 0 }, { x: this.pageX, y: this.pageY });
            this.swipeInfo.prevVelocity = 0;
            if (this.downEvents.size == 2) {//多指按下的时候清除一指按下点
                this.dispatchEvent(PointerEventType.moreFingerDown, e.button);
                // this.isClearPointer = false;
                let first: any = this.downEvents.get(this.pointerId), second: any;
                this.downEvents.forEach((value, index, map) => {
                    if (first && second)
                        return false;
                    if (value.pointerId != this.pointerId)
                        second = value;
                })
                this.secondX = second.pageX;
                this.secondY = second.pageY;
                let degree = XlMath.angleFromNorth_ClockWise(second.pageX, second.pageY, first.pageX, first.pageY) * 180 / Math.PI;
                var curDis = XlMath.distance({ x: first.pageX, y: first.pageY }, { x: second.pageX, y: second.pageY });//两手指间距
                this.lastDegree == null && (this.lastDegree = degree);//初始设置
                this.lastPinchDis == null && (this.lastPinchDis = curDis);//初始设置
                this.startPinchDis == null && (this.startPinchDis = curDis);//初始设置
            }

        }
    }

    private getPointerEventInfo(): PointerEventInfo {

        return new PointerEventInfo(this.down, this.target, this.dragging, this.lastX,
            this.lastY, this.startX, this.startY, this.currentRawEvent
            , this.pinchType, this.pinchDis, this.lastPinchDis, this.pinchMiddleX, this.pinchMiddleY, this.rotateDegree, this.direction, this.downEvents.size > 0 ? Array.prototype.slice.call(this.downEvents.values()) : [], this.initState);

    }
    resetFingers() {
        this.initState.one = false;
        this.initState.two = false;
        this.initState.three = false;
        this.initState.five = false;
        switch (this.downEvents.size) {
            case 1:
                this.initState.one = true;
                break;
            case 2:
                this.initState.two = true;
                break;
            case 3:
                this.initState.three = true;
                break;
            case 5:
                this.initState.five = true;
                break;
        }
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

        if (this.downEvents.size > 0) {
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

        if (e.button == ButtonType.LTPButton || e.button == ButtonType.RGButton) {//鼠标按下左键或者右键
            
            if (this.downEvents.get(this.pointerId))
                this.setXY(this.downEvents.get(this.pointerId));//设置鼠标坐标位置  这里只针对主控手指
            // else
            //     return;
            let dis = XlMath.distance({ x: this.pageX, y: this.pageY }, { x: this.startX, y: this.startY });

            if (this.downEvents.size <= 1 || this.initState.one) {//一指
                this.setXY(e);
                if (!e.isPrimary) {
                    return;
                }
                // this.moveCount++;
                if (dis > 3 && this.down) {
                    this.dragging = true;
                }
                // if (dis < 15) {//事件暂时无用
                //     if (this.down && !this.clickDragging) {
                //         this.clickDragging = true;
                //     };
                // } else {
                //     if (this.down && this.clickDragging) {
                //         this.clickDragging = false;
                //     }
                // }
                //调用回调
                if (this.dragging && this.initState.one) {
                    // if (!this.currentDragMoveState && dis > 3) { //判断是否处于拖拽
                    //     this.currentDragMoveState = true
                    // }
                    //事件修改吗TODO LFF  下面的if注释掉了
                    // if (dis == 1) {
                    //     this.dispatchEvent(PointerEventType.dragStart, e.button);
                    // }

                    // else if (dis > 1) {
                    if (e.button == ButtonType.RGButton)
                        this.dispatchEvent(PointerEventType.rightDragMove, e.button);
                    else {
                        this.dispatchEvent(PointerEventType.dragMove, e.button);
                    }
                    // }

                } else {
                    this.target = e.target;

                    this.dispatchEvent(PointerEventType.pointerMove, e.button);
                }

                //计算加速度
                let nowDate = e.timeStamp;
                let time = (nowDate - this.swipeInfo.prevDate) / 1000;
                if (time > 0.06) {
                    let newDistance = XlMath.distance({ x: this.pageX, y: this.pageY }, { x: this.swipeInfo.prevX, y: this.swipeInfo.prevY });
                    let newVelocity = newDistance / time;//以秒为单位
                    this.swipeInfo.acce = (newVelocity - this.swipeInfo.prevVelocity) / time;//以秒为单位
                    this.swipeInfo.prevVelocity = newVelocity;
                    this.swipeInfo.prevX = this.pageX;
                    this.swipeInfo.prevY = this.pageY;
                    this.swipeInfo.prevDate = e.timeStamp;
                }

                this.lastX = this.pageX;
                this.lastY = this.pageY;
            } else {//多指 
                // console.log("isPrimary", e.isPrimary, "e.pointerId == this.pointerId", e.pointerId, this.pointerId)
                // if (e.isPrimary || e.pointerId == this.pointerId) {//pad上面isPrimary每个手指该属性都是true 去掉该逻辑判断
                // if (e.pointerId == this.pointerId) {
                if (!this.dragging && dis > 3 && this.down) {
                    // this.moreMoveState = true; //多指是否执行拖拽
                    this.dragging = true;
                }
                if (this.dragging && this.initState.five ) {//确保五指事件过程中 如果抬起了手指 也按照五指执行 http://jira.xuelebj.net/browse/CLASSROOM-7694
                    if(e.pointerId == this.pointerId){
                        let first: any = this.downEvents.get(this.pointerId);
                        this.dispatchEvent(PointerEventType.fiveFingerMove, e.button);
                    }
                    this.lastX = this.pageX;
                    this.lastY = this.pageY;
                    return;
                }

                if (this.downEvents.size == 2&&this.initState.two) {
                    //pinch
                    let first: any = this.downEvents.get(this.pointerId), second: any;
                    this.downEvents.forEach((value, index, map) => {
                        if (first && second)
                            return false;
                        if (value.pointerId != this.pointerId)
                            second = value;
                    })
                    //计算两手指移动是否为旋转
                    let degree = XlMath.angleFromNorth_ClockWise(second.pageX, second.pageY, first.pageX, first.pageY) * 180 / Math.PI;
                    var curPinchDis = XlMath.distance({ x: first.pageX, y: first.pageY }, { x: second.pageX, y: second.pageY });//两手指间距
                    let secondFingerDragDis = XlMath.distance({ x: second.pageX, y: second.pageY }, { x: this.secondX, y: this.secondY });

                    if (!this.dragging && (curPinchDis - this.startPinchDis > 3 || dis > 3 || secondFingerDragDis > 3) && this.down) {
                        // this.moreMoveState = true; //多指是否执行拖拽
                        this.dragging = true;
                    }
                    if (this.dragging) {

                        this.pinchMiddleX = (first.pageX + second.pageX) / 2;
                        this.pinchMiddleY = (first.pageY + second.pageY) / 2;
                        // console.log("curPinchDis", curPinchDis, "pinchDis", this.pinchDis, "lastPinchDis", this.lastPinchDis,dis,secondFingerDragDis);
                        // let v = { x: second.pageX - first.pageX, y: second.pageY - first.pageY };
                        // let prev = { x: this.secondX - this.startX, y: this.secondY - this.startY };
                        // let angleDegree = this.getRotateAngle(v, prev);
                        if (this.pinchDis == null)
                            this.pinchType = "";
                        //一开始设定pinchType后 就可以处理相应事件
                        if (this.pinchType == "pinchMove") {
                            this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                        } else if (this.pinchType == "pinchRotate") {
                            this.rotateDegree = this.lastDegree - degree;
                            this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                            this.lastDegree = degree;
                        } else if (this.pinchType == "pinchIn" || this.pinchType == "pinchOut") {
                            if (curPinchDis - this.pinchDis > 0) {
                                this.pinchType = 'pinchOut';
                                this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                            }
                            else if (curPinchDis - this.pinchDis < 0) {
                                this.pinchType = 'pinchIn';
                                this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                            }
                            this.lastPinchDis = this.pinchDis;
                        } else {
                            if (dis >= 30&& secondFingerDragDis >= 30) {//手指移动了一段距离后 再去识别是哪种手势
                                this.pinchType = 'pinchMove';
                                this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                            }else if(this.lastPinchDis>45){
                                
                                // console.log("angleDegree", angleDegree,degree,this.lastDegree,"---",second.pageX ,second.pageY , first.pageX,  first.pageY,
                                // this.secondX , this.secondY , this.startX, this.startY)
                                if (Math.abs(this.lastDegree - degree) >= 8 && this.lastPinchDis > 100) {
                                    this.pinchType = 'pinchRotate';
                                    this.rotateDegree = this.lastDegree - degree;
                                    this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                                    this.lastDegree = degree;
                                }

                                if (this.pinchType != 'pinchRotate' && this.lastPinchDis != null && this.pinchDis != null) {

                                    // if (Math.abs(curPinchDis - this.lastPinchDis) <= 12) {
                                    //     this.pinchType = 'pinchMove';
                                    //     this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                                    // }
                                    // else
                                     if (curPinchDis - this.lastPinchDis >= 12) {
                                        // pinchOut
                                        this.pinchType = 'pinchOut';
                                        this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);
                                    }
                                    else if (curPinchDis - this.lastPinchDis <= -12) {
                                        //pinchIn
                                        this.pinchType = 'pinchIn';
                                        this.dispatchEvent(PointerEventType.pinch, ButtonType.LTPButton);

                                    }
                                    this.lastPinchDis = this.pinchDis;
                                }
                            }
                        }
                        // 缓存当前值
                        this.pinchDis = curPinchDis;
                    }
                }
                this.lastX = this.pageX;
                this.lastY = this.pageY;
                // }

            }
        }

    }
    getLen(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    getAngle(v1, v2) {
        var mr = this.getLen(v1) * this.getLen(v2);
        if (mr === 0) return 0;
        var r = this.dot(v1, v2) / mr;
        if (r > 1) r = 1;
        return Math.acos(r);
    }

    cross(v1, v2) {
        return v1.x * v2.y - v2.x * v1.y;
    }

    getRotateAngle(v1, v2) {
        var angle = this.getAngle(v1, v2);
        if (this.cross(v1, v2) > 0) {
            angle *= -1;
        }

        return angle * 180 / Math.PI;
    }
    private dispatchEvent(enventType: PointerEventType, buttonType: ButtonType): void {
        console.log("dispathcEvent", PointerEventType[enventType])
        if (this.eventHandlers.has(PointerEventType[enventType])) {
            let moveHandlers = this.eventHandlers.get(PointerEventType[enventType]);
            if (moveHandlers.has(ButtonType[buttonType])) {
                let handlerInfo = moveHandlers.get(ButtonType[buttonType]);
                handlerInfo.handler.apply(handlerInfo.applyContext, [this.getPointerEventInfo()])
            }
        }
    }
    pointerupHandler(e: PointerEvent) {
        console.log('pointer up');
        // if (e.button == ButtonType.LTPButton || e.button == ButtonType.RGButton) {//加入pinch去掉的，学生笔记双指缩放拖拽画布  加上这个判断全部松开有时候this.downEvents.size不能为0
        this.startFingerCount--;
        this.downEvents.delete(e.pointerId);

        if (this.downEvents.size < 2) {
            this.pinchDis = 0;
        }

        if (e.pointerId == this.pointerId && !this.initState.one) {
            let point = this.downEvents.values().next().value;//主控手指抬起后，数组里第一个手指作为主控手指
            point && (this.pointerId = point.pointerId) && this.setXY(point);
        }
        if (this.downEvents.size == 0) {
            this.setXY(e);
        }
        // this.moveCount++;


        if (this.downEvents.size == 0 && this.initState.three) {   //三指结束
            let disX = this.pageX - this.startX;
            let disY = this.pageY - this.startY;
            let dir = this._getDirection(disX, disY);
            let dis = XlMath.distance({ x: this.pageX, y: this.pageY }, { x: this.startX, y: this.startY });
            this.direction = dir;
            if (dis > 60) {
                this.dispatchEvent(PointerEventType.threeDragMoveEnd, e.button);
            } else {
                this.direction = null;
            }
        }
        if (this.downEvents.size == 0 && !this.initState.one) {
            this.dispatchEvent(PointerEventType.moreFingerEnd, e.button);
        }
        if (e.pointerId == this.pointerId && this.initState.one) {
            if (this.dragging) {
                let dis = XlMath.distance({ x: this.lastX, y: this.lastY }, { x: this.startX, y: this.startY });
                if (this.swipeInfo.acce > 30000 && dis > 100&&e.type!='pointercancel') {//pointercancel的时候不响应swipe
                    let disX = this.pageX - this.startX;
                    let disY = this.pageY - this.startY;
                    let dir = this._getDirection(disX, disY);
                    this.direction = dir;
                    this.dispatchEvent(PointerEventType.swipe, e.button);
                }
                this.dispatchEvent(PointerEventType.dragEnd, e.button);
                // if (this.clickDragging) {
                //     this.dispatchEvent(PointerEventType.click, e.button);
                // }
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
            this.pointerId = null;
            this.down = false;
            // this.moreMoveState = false;
            this.currentDragMoveState = false;
            this.startPinchDis = null;
            this.resetFingers();
            this.startFingerCount = 0;
            this.countDown = 0;
            this.dragging = false;
            this.clickDragging = false;
            // this.isClearPointer = true;
        }
        // this.lastX = this.pageX;
        // this.lastY = this.pageY;

        this.pinchDis = null;
        this.lastDegree = null;
        this.lastPinchDis = null;
        this.pinchType = null;
        this.direction = null;
        this.swipeInfo = {};
        // }
    }

    pointercancelHandler(e: PointerEvent) {
        console.log('pointer cancel');

        this.down && this.pointerupHandler(e);
    }

    mouseoutHandler(e: MouseEvent) {
        var to = e.relatedTarget || e.toElement
        if (!to || (<HTMLElement>to).nodeName == "HTML") {
            this.down && this.pointerupHandler(this.currentRawEvent);
        }
    }

    getXY() {
        return { x: this.clientX, y: this.clientY };
    }
    _getDirection(x, y) {
        if (Math.abs(x) >= Math.abs(y)) {
            return x < 0 ? "left" : "right";
        }
        return y < 0 ? "top" : "down";
    }
}
