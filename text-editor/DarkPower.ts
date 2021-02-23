import { ITextInputHandler } from './ITextEditor';
import { EventUtil } from '../utility/util';
// import { Promise } from 'es6-promise';
/**
 * 利用隐藏的TextArea来监听键盘输入，
 * 监听鼠标切换和位置选中
 * 更新TextArea的valu值，
 * 传递当前编辑的文字内容到外部
 * 维护选中信息
 */
export class TextDarkPower implements ITextInputHandler {
    private hiddenTextArea: HTMLTextAreaElement;
    private container: HTMLElement;
    /**
     * 是否是非直接输入,目前主要是兼容中文输入法引起的问题
    */
    private isCompositionsting: boolean;
    private isUse229: boolean;
    private isFirstChinese:boolean;
    private isHasComposing:boolean;
    /**
     * 中文输入法，文字输入的起始位置。
     */
    private preStart: number;
    /**
     * 回调，接收按键按下
     */
    public onKeydown: Function;
    /**
     * 回调，输入中文的过程中（未按回车和空格）
     */
    public onKeydownWhenInputChinese: Function;

    /**
     * 回调，完成一次输入
     * 1）中文输入为按回车或者空格
     * 2）英文输入keyup时
     */
    public onTyped: Function;
    /**
    * 回调，接收按键抬起
    */
    public onKeyup: Function;
    /**
    * 回调，textarea获取焦点
    */
    public onFocus: Function;
    /**
    * 回调，textare失去焦点
    */
    public onBlur: Function;


    constructor(container: HTMLElement) {
        this.container = container;
        this.preStart = -1;

        this.isFirstChinese = true;
        this.isHasComposing = false;
    }

    init(): Promise<any> {
        this.initHiddenTextArea();
        return Promise.resolve();
    }

    initHiddenTextArea() {
        if (!this.hiddenTextArea) {
            this.hiddenTextArea = <HTMLTextAreaElement>document.createElement('textarea');
            this.hiddenTextArea.id = "ghostTextArea";
            this.hiddenTextArea.style.width = '1000px';
            this.hiddenTextArea.style.height = '1px';
            this.hiddenTextArea.style.position = "static";
            this.hiddenTextArea.style.top = "0";
            this.hiddenTextArea.style.zIndex = "5";
            this.hiddenTextArea.style.opacity = "0";
            this.hiddenTextArea.tabIndex = 0;

            var that = this;
            this.container.appendChild(this.hiddenTextArea);
            var textArea = this.hiddenTextArea;

            this.hiddenTextArea.onkeyup = (e: KeyboardEvent) => {
                this.onKeyup && this.onKeyup(e);
            }

            this.hiddenTextArea.onkeydown = (e) => {
                if (e.keyCode == 229) {// 为了搜狗输入法在触屏下的诡异行为，才这么判断
                    that.isUse229 = true;
                    if(this.preStart === -1){
                        this.preStart = textArea.selectionStart;
                    }
                    // 转移到外部回调处理
                    this.onKeydownWhenInputChinese && this.onKeydownWhenInputChinese(textArea.selectionStart);
                }
                else {
                    that.isUse229 = false;
                }
                // editor.bdCanvas.textEditor && editor.bdCanvas.textEditor.currentText && editor.bdCanvas.textEditor.textControler.onKeyDown(e);

                this.onKeydown && this.onKeydown(e);
            }

            this.hiddenTextArea.addEventListener('compositionstart', function () {
                that.isCompositionsting = true;
            })
            this.hiddenTextArea.addEventListener('compositionend', function () {
                that.isCompositionsting = false;
                if(that.isHasComposing){
                    that.onTyped && that.onTyped(that.preStart, textArea.selectionStart, textArea.selectionEnd, textArea.value,that.isHasComposing,that.changeFirstChinese.bind(that));
                }

            })
            //https://www.cnblogs.com/xuanhun/p/7053782.html
            this.hiddenTextArea.oninput = (e) => {
                if("isComposing" in e){
                    this.isHasComposing = true;
                    if((e as any).isComposing){
                        if(this.isFirstChinese){
                            this.isFirstChinese = false;
                            this.preStart = textArea.selectionStart - 1;
                        }
                        return;
                    }
                }else{
                    this.isHasComposing = false;
                }

                if (textArea.selectionStart == textArea.selectionEnd) {//输入结束
                    this.onTyped && this.onTyped(this.preStart, textArea.selectionStart, textArea.selectionEnd, textArea.value)
                } else {//到这儿说明输入的是中文（中文输入法未按空格之前）
                    //editor.bdCanvas.textEditor.currentText.preStart = textArea.selectionStart;
                    this.preStart = textArea.selectionStart;
                    this.onKeydownWhenInputChinese && this.onKeydownWhenInputChinese(textArea.selectionStart);
                }
            }

            EventUtil.on(this.hiddenTextArea, "focus", (e: any) => {
                console.log("focus");

            })

            EventUtil.on(this.hiddenTextArea, "blur", (e: any) => {
                this.onBlur && this.onBlur(e);
            })
        }
        this.hiddenTextArea.style.display = "block";


    }
    changeFirstChinese(isFirstChinese){
        this.isFirstChinese = isFirstChinese;
    }
    // updateMulStyle(start, end) {
    //     for (var i = start; i < end; i++) {
    //         editor.bdCanvas.textEditor.currentText.insertStyle(i, editor.bdCanvas.textEditor.currentTextColor);
    //     }
    //     editor.bdCanvas.textEditor.currentText.preStart = -1;
    //     this.isCompositionsting = false;
    // }


    //更新文本域属性
    public updateTextarea(selectionStart: number, selectionEnd: number, text: string) {
        if (!this.hiddenTextArea)
            return;
        this.hiddenTextArea.value = text;
        this.hiddenTextArea.selectionStart = selectionStart;
        this.hiddenTextArea.selectionEnd = selectionEnd;
    }
    focusTextrea() {
        this.hiddenTextArea.focus();
    }

    blurTextArea() {
        this.hiddenTextArea.blur();
    }
    setSelectionRange(start: number, end: number) {
        this.hiddenTextArea.setSelectionRange(start, end);
    }

    clearTextArea() {
        this.setTextAreaValue('');
    }
    setTextAreaValue(v: string) {
        this.hiddenTextArea.textContent = v;
        this.hiddenTextArea.value = v;
    }

    getTexareaSelectionStart() {
        return this.hiddenTextArea.selectionStart;
    }

    setPrestart(index: number) {
        this.preStart = index;
        if (index == -1) {
            // this.isCompositionsting = false;
        }
    }
    setPrestartInChinesing(index: number){
        if(this.preStart !== -1){//不等于-1说明正在输入中文。为解决客户端 输入中文时改变selectionstart
            this.preStart = index;
        }
    }

}