import *  as PointerEvent from '../utility/PointerEvent';
// import { Promise } from 'es6-promise';
/**
 * 定义基于Canvas的文本编辑器的接口
 * 文本编辑器的基本组成：
 * 1）全局控制器
 * 2）文本输入处理器
 * 3）文字领域对象
 * 4）UI编辑器
 * 5）文字渲染器
 */

export interface ITextInputHandler {
    /**
        * 回调，接收按键按下
        */
    onKeydown: Function;
    /**
     * 回调，输入中文的过程中（未按回车和空格）
     */
    onKeydownWhenInputChinese: Function;

    /**
     * 回调，完成一次输入
     * 1）中文输入为按回车或者空格
     * 2）英文输入keyup时
     */
    onTyped: Function;
    /**
    * 回调，接收按键抬起
    */
    onKeyup: Function;
    /**
    * 回调，textarea获取焦点
    */
    onFocus: Function;
    /**
    * 回调，textare失去焦点
    */
    onBlur: Function;
    init(): Promise<any>;
    updateTextarea(selectionStart: number, selectionEnd: number, text: string): void;
    focusTextrea(): void;
    blurTextArea(): void;
    setSelectionRange(start: number, end: number): void;
    clearTextArea(): void;
    setTextAreaValue(v: string): void;
    getTexareaSelectionStart(): number;
    setPrestart(index: number):void;
    updatePreSelectionStart?: Function;
    setPrestartInChinesing(index: number):void;
}

export enum TextAlgin {//文字对齐方式
    left = 0,
    center = 1,
    right = 2,
}
export enum TextStyleType {
    bold = 0,
    italic,
    underLine,
    alginLeft,
    alginRight,
    alginMid
}
export enum DirectionType {
    leftTop = 0,
    rightTop = 1,
    leftBottom = 2,
    rightBottom = 3,
    rotate = 4,
    center = 5,
    up,
    down,
    right,
    left
}
export interface IRichText {
    text: string;//文字内容
    fontSize: number;//字号
    fontWeight: string;//加粗值
    fontFamily: string;//字体
    underline: boolean;//下划线
    italic: boolean;//斜体
    color: string;//颜色
    textAlign: TextAlgin;//对齐方式
    fontStyle: string;
    fill: string;
    isVertical: boolean;
    textDecoration: string;
    minWidth: number;
    maxWidth: number;
    fixedWidth: boolean;
    currentHeight: number;
    /**
     * 用于快速判断字体是否被显示
     */
    maxFontSize: number;
}
export interface ITextEditorController {
    currentText: IRichText;
    isEditting: boolean;
    changeToEditModeImg:HTMLImageElement;

    onMouseUp(mouseInfo: PointerEvent.PointerEventInfo,downEl:any): void
    onMouseDown(mouseInfo: PointerEvent.PointerEventInfo,downEl:any): void
    onDragStart(mouseInfo: PointerEvent.PointerEventInfo,downEl:any): void
    onDragMove(mouseInfo: PointerEvent.PointerEventInfo,downEl:any): void
    onDragEnd(mouseInfo: PointerEvent.PointerEventInfo,downEl:any): void
    changeStyle(role: string, value?: any):void;
    ChangeCurentTextStyle(role: string, value: any):void;
    focusTextrea():void;

    blurTextArea():void;
    setCurrentText(txt: IRichText) :void;
    clearTextArea():void;
    endEditForOther(isChangeMode:boolean):void;
    init(): Promise<any>;
}

export interface ITextUI {
    container:HTMLElement;
    init(): Promise<any>;
    show(): void;
    hide(): void;
    onClickHandler(e: PointerEvent.PointerEventInfo):void;
}

export interface ITextEditor {
    inputHandler: ITextInputHandler;
    ui: ITextUI;
    controller: ITextEditorController;
    init(): Promise<any>;
}