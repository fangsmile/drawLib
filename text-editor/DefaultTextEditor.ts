
import { ITextInputHandler, ITextEditor, ITextUI, ITextEditorController } from './ITextEditor'
// import { Promise } from 'es6-promise';

export class DefaultTextEditor implements ITextEditor {
    inputHandler: ITextInputHandler;

    ui: ITextUI;

    controller: ITextEditorController;

    constructor(inputHandler: ITextInputHandler, ui: ITextUI, controller: ITextEditorController) {
        this.inputHandler = inputHandler;
        this.ui = ui;
        this.controller = controller;
    }

    init(): Promise<any> {
        return Promise.all([this.inputHandler.init(), this.ui.init(), this.controller.init()]);
    }
}
