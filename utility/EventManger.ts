import { PointerEventWrapper, HandlerInfo, PointerEventType, ButtonType, PointerEventInfo } from './PointerEvent';
import { HashTable } from './DataStructure';
import { EventUtil } from './util';

export enum DomEventType {
    inputChange = 0,
    input = 1,
    focus = 2,
    blur = 3,
    mousewheel = 4
}
export class EventManger {
    pointEventWrapper: PointerEventWrapper;
    /**
     * DOM元素冒泡过程中，定位到的元素绑定可以缓存下来。
     */
    handlersCache: HashTable<Function>;
    /**
     * 频繁的创建EventInfo 会导致GC频繁，内存升高，可以采用对象池的方法提升性能
     */
    eventInfoCache: HashTable<PointerEventInfo>;
    /**
     * 采用 eventType->组件id->handler
     */
    handlers: HashTable<HashTable<HandlerInfo>>;
    /**
     * 采用 eventType->组件id->handler
     */
    domHandlers: HashTable<HashTable<DomHandlerInfo>>;
    //keybinder: KeyBoardEvent;


    constructor() {
        this.pointEventWrapper = new PointerEventWrapper(window.document.documentElement);
        let pointerdownHandlerInfo = new HandlerInfo(PointerEventType.pointerDown, this.pointerdownHandler, false, ButtonType.LTPButton
            , this);
        let pointermoveHandlerInfo = new HandlerInfo(PointerEventType.pointerMove, this.pointermoveHandler, false, ButtonType.LTPButton
            , this);
        let pointerupHandlerInfo = new HandlerInfo(PointerEventType.pointerUp, this.pointerupHandler, false, ButtonType.LTPButton
            , this);
        let clickHandlerInfo = new HandlerInfo(PointerEventType.click, this.clickHandler, false, ButtonType.LTPButton
            , this);
        let dragStartHandlerInfo = new HandlerInfo(PointerEventType.dragStart, this.dragStartHandler, false, ButtonType.LTPButton
            , this);
        let dragMoveHandlerInfo = new HandlerInfo(PointerEventType.dragMove, this.dragMoveHandler, false, ButtonType.LTPButton
            , this);
        let rightDragMoveHandlerInfo = new HandlerInfo(PointerEventType.rightDragMove, this.rightDragMoveHandler, false, ButtonType.RGButton
            , this);
        let dragEndHandlerInfo = new HandlerInfo(PointerEventType.dragEnd, this.dragEndHandler, false, ButtonType.LTPButton
            , this);
        let fiveFingerMoveHandlerInfo = new HandlerInfo(PointerEventType.fiveFingerMove, this.fiveFingerMoveHandler, false, ButtonType.LTPButton
            , this);
        let pinchHandlerInfo = new HandlerInfo(PointerEventType.pinch, this.pinchHandler, false, ButtonType.LTPButton
            , this);
        let pinchEndHandlerInfo = new HandlerInfo(PointerEventType.pinchEnd, this.pinchEndHandler, false, ButtonType.LTPButton
            , this);
        let moreFingerEndHandlerInfo = new HandlerInfo(PointerEventType.moreFingerEnd, this.moreFingerEndHandler, false, ButtonType.LTPButton
            , this);
        let moreFingerDownHandlerInfo = new HandlerInfo(PointerEventType.moreFingerDown, this.moreFingerDownHandler, false, ButtonType.LTPButton
            , this);
        let threeDragMovEndHandlerInfo = new HandlerInfo(PointerEventType.threeDragMoveEnd, this.threeDragMoveEndHandler, false, ButtonType.LTPButton
            , this);
            let swipeHandlerInfo = new HandlerInfo(PointerEventType.swipe, this.swipeHandler, false, ButtonType.LTPButton
                , this);
            this.pointEventWrapper.registerEvent(pointerdownHandlerInfo);
            this.pointEventWrapper.registerEvent(pointermoveHandlerInfo);
            this.pointEventWrapper.registerEvent(pointerupHandlerInfo);
            this.pointEventWrapper.registerEvent(clickHandlerInfo);
            this.pointEventWrapper.registerEvent(dragStartHandlerInfo);
            this.pointEventWrapper.registerEvent(dragMoveHandlerInfo);
            this.pointEventWrapper.registerEvent(rightDragMoveHandlerInfo);
            this.pointEventWrapper.registerEvent(dragEndHandlerInfo);
            this.pointEventWrapper.registerEvent(fiveFingerMoveHandlerInfo);
            this.pointEventWrapper.registerEvent(pinchHandlerInfo);
            this.pointEventWrapper.registerEvent(pinchEndHandlerInfo);
            this.pointEventWrapper.registerEvent(moreFingerEndHandlerInfo);
            this.pointEventWrapper.registerEvent(moreFingerDownHandlerInfo);
            this.pointEventWrapper.registerEvent(threeDragMovEndHandlerInfo);
            this.pointEventWrapper.registerEvent(swipeHandlerInfo);
        this.handlers = new HashTable<HashTable<HandlerInfo>>();

        this.domHandlers = new HashTable<HashTable<DomHandlerInfo>>();
    }
    private rightDragMoveHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.rightDragMove, evt)
    }
    private threeDragMoveEndHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.threeDragMoveEnd, evt)
    }
    private swipeHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.swipe, evt)
    }
    private pointerdownHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.pointerDown, evt)
    }
    private pointermoveHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.pointerMove, evt)

    }

    private pointerupHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.pointerUp, evt)

    }

    private clickHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.click, evt)

    }

    private dragStartHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.dragStart, evt)

    }

    private dragMoveHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.dragMove, evt)
    }

    private dragEndHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.dragEnd, evt)

    }
    private fiveFingerMoveHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.fiveFingerMove, evt)

    }
    private pinchHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.pinch, evt)

    }
    private pinchEndHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.pinchEnd, evt)

    }
    private moreFingerEndHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.moreFingerEnd, evt)

    }
    private moreFingerDownHandler(evt: PointerEventInfo) {
        this.dispatchEvent(PointerEventType.moreFingerDown, evt)
    }
    /**
     * 原则上，回调函数只在组件这一级别产生作用，组件内部继续分发事件。
     * @param el 触发事件的dom元素
     * @param componentId 接收事件的组件ID
     * @param handler 回调函数。每个回调函数可以返回bool值，如果值为true，则不再调用其他组件的监听函数，如果为false，继续轮询。
     */
    registerPointerEvent(componentId: string, handlerInfo: HandlerInfo, el: HTMLElement) {
        handlerInfo.el = el;
        if (!this.handlers.has(PointerEventType[handlerInfo.eventType])) {
            let eventTypeHandlers = new HashTable<HandlerInfo>();
            this.handlers.set(PointerEventType[handlerInfo.eventType], eventTypeHandlers);

        }
        let eventTypeHandlers = this.handlers.get(PointerEventType[handlerInfo.eventType]);
        // if (!eventTypeHandlers.has(componentId)) {//改成直接覆盖
            eventTypeHandlers.set(componentId, handlerInfo)
        // }
    }
    clearPointerEvent(componentId: string) {
        this.handlers.foreach((evnetType: string, fs: HashTable<HandlerInfo>) => {
            if (fs.has(componentId)) {
                fs.del(componentId);
            }
        })
    }
    private dispatchEvent(enventType: PointerEventType, eventInfo: PointerEventInfo) {
        let that = this;
        if (this.handlers.has(PointerEventType[enventType])) {
            let moveHandlers = this.handlers.get(PointerEventType[enventType]);
            moveHandlers.foreach(function (key: string, handlerInfo: HandlerInfo) {
                if (handlerInfo.buttonType == eventInfo.button) {
                    if (handlerInfo.el == eventInfo.target || (<any>eventInfo.evt).propagationPath().some((t: HTMLElement) => { return t == handlerInfo.el; })) {
                        var isIntercepter: boolean = handlerInfo.handler.apply(handlerInfo.applyContext, [eventInfo, that.pointEventWrapper]);
                        if (isIntercepter) {
                            return;
                        }
                    }
                }
            });

        }
        return false;
    }
    /**
       * 原则上，回调函数只在组件这一级别产生作用，组件内部继续分发事件。
       * @param el 触发事件的dom元素
       * @param componentId 接收事件的组件ID
       * @param handler 回调函数。每个回调函数可以返回bool值，如果值为true，则不再调用其他组件的监听函数，如果为false，继续轮询。
       */
    registerDomEvent(componentId: string, eventType: DomEventType, handler: Function, el: HTMLElement, context: any) {
        if (!this.domHandlers.has(DomEventType[eventType])) {
            this.registerDomEventOnDocument(eventType);
            let eventTypeHandlers = new HashTable<DomHandlerInfo>();
            this.domHandlers.set(DomEventType[eventType], eventTypeHandlers);

        }
        let eventTypeHandlers = this.domHandlers.get(DomEventType[eventType]);
        // if (!eventTypeHandlers.has(componentId)) {//改成直接覆盖
            var handlerInfo = new DomHandlerInfo(eventType, handler, context, el);
            eventTypeHandlers.set(componentId, handlerInfo)
        // }
    }
    clearDomEvent(componentId: string) {
        this.domHandlers.foreach((evnetType: string, fs: HashTable<HandlerInfo>) => {
            if (fs.has(componentId)) {
                fs.del(componentId);
            }
        })
    }
    registerDomEventOnDocument(domEventType: DomEventType) {
        switch (domEventType) {
            case DomEventType.inputChange: EventUtil.on(document, "change", this.InputChangeHandler.bind(this)); break;
            case DomEventType.input: EventUtil.on(document, "input", this.inputHandler.bind(this)); break;
            case DomEventType.blur: EventUtil.on(document, 'focusout', this.inputBlurHandler.bind(this)); break;
            case DomEventType.mousewheel: EventUtil.on(document, 'mousewheel', this.documentWheel.bind(this)); break;
        }
    }

    private InputChangeHandler(evt: Event) {
        let einfo = {
            evt: evt,
            target: evt.target
        };
        this.dispatchDomEvent(DomEventType.inputChange, einfo);
    }
    private inputHandler(evt: Event) {
        let einfo = {
            evt: evt,
            target: evt.target
        };
        this.dispatchDomEvent(DomEventType.input, einfo);
    }
    private inputBlurHandler(evt: Event) {
        let einfo = {
            evt: evt,
            target: evt.target
        };
        this.dispatchDomEvent(DomEventType.blur, einfo);
    }

    private documentWheel(evt: WheelEvent) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) {
            const xy = this.pointEventWrapper.getXY();
            let einfo = {
                evt: evt,
                delta: delta,
                x: xy.x,
                y: xy.y,
                target: evt.target
            };
            this.dispatchDomEvent(DomEventType.mousewheel, einfo);
        }
    }
    private dispatchDomEvent(enventType: DomEventType, eventInfo: any) {
        if (this.domHandlers.has(DomEventType[enventType])) {
            let moveHandlers = this.domHandlers.get(DomEventType[enventType]);
            moveHandlers.foreach(function (key: string, handlerInfo: DomHandlerInfo) {
                // let eventPath: Array<HTMLElement> = eventInfo.evt.propagationPath;
                if (handlerInfo.el == eventInfo.target || (<Array<HTMLElement>>(eventInfo.evt.propagationPath())).some((t) => { return t == handlerInfo.el; })) {
                    var isIntercepter: boolean = handlerInfo.handler.apply(handlerInfo.applyContext, [eventInfo]);
                    if (isIntercepter) {
                        return true;
                    }
                }
            })

        }
        return false;
    }


    /**
     * 右键
     * @param evt 
     */
    contextMenuHandler(evt: MouseEvent) {
        // if (evt.ctrlKey) return false;
        // this.x = evt.pageX;
        // this.y = evt.pageY;
        // this.lastX = evt.pageX;
        // this.lastY = evt.pageY;

        // this.down = false;
        // this.dragging = false;
        // this.click = false;
        // if (this.eventInfo.onContextMenu) {
        //     this.eventInfo.onContextMenu({
        //         evt: evt,
        //         mouseX: this.x,
        //         mouseY: this.y
        //     });
        // }
    }

    /**
     *滚轮 
     * @param evt 
     */
    mouseWheelHandler(evt: MouseEvent) {
        // this.x = evt.pageX;
        // this.y = evt.pageY;
        // this.down = false;
        // this.dragging = false;
        // this.scroll = true;
        // var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        // if (delta && this.eventInfo.mouseWheel) {
        //     this.eventInfo.mouseWheel({
        //         evt: evt,
        //         delta: delta,
        //         mouseX: this.x,
        //         mouseY: this.y,
        //     });
        // }
        // this.scroll = false;
        //return evt.preventDefault() && false;
    }


}

export class DomHandlerInfo {
    constructor(eventType: DomEventType, handler: Function, applyContext: object, el: HTMLElement) {
        this.eventType = eventType;
        this.handler = handler;
        this.applyContext = applyContext;
        this.el = el;
    }
    handler: Function;

    applyContext: object;
    eventType: DomEventType;
    el: HTMLElement;
}