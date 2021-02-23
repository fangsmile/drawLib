
import { HashTable, HashValue, List } from "./DataStructure";
import { UUID } from './UUID'

export class StateManger {
    /* 
    *声明所有状态栈
    */
    stateDic: HashTable<HashTable<Object>>;
    stateEventHandlers: HashTable<HashTable<List<Function>>>;

    observeStateDic: HashTable<object>;
    private uuidInstance: UUID;

    constructor() {
        this.stateDic = new HashTable<HashTable<Object>>();
        this.observeStateDic = new HashTable<Object>();
        this.stateEventHandlers = new HashTable<HashTable<List<Function>>>();
        this.uuidInstance = UUID.getInstance();
    }

    converJsObjToImmutable() {

    }
    convertPlainObjToImmutable(obj: any) {
    }
    convertXhListToImmutable() { }
    convertXhHashtableToImmutable() {

    }



    /**
     * 添加一个对象，将该对象变为可观察对象，应用程序可以注册该对象的属性变化的回调
     * @param name 对象名称
     * @param obj 对象数据
     */
    addObservableState(name: string, obj: object) {
        Object.defineProperty(obj, "_name", {
            value: name
        });
        this.observeData(obj);
        this.observeStateDic.set(name, obj);
        let that = this;

    }



    private observeData(obj: object) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                this.makeReactive(obj, key)
            }

        }
    }
    // 简单实现，只考虑了第一层级，后续再继续修改
    private makeReactive(obj: any, key: string) {
        let val = obj[key]
        let that = this;
        Object.defineProperty(obj, key, {
            get() {
                return val;
            },
            set(newVal) {
                if (val !== newVal) {
                    val = newVal;
                    that.dispatchObserveEvent(obj['_name'], key);
                }

            }
        })
    }

    subscribeObservableState(name: string, func: Function) {
        this.on(stateEventType.observeStateChange, name, func);
    }


    addState(subtoolId: string, state: any): string {
        let timeStamp = Date.now().toString();
        if (!this.stateDic.has(subtoolId)) {
            let subtoolStatDic = new HashTable<any>();
            this.stateDic.set(subtoolId, subtoolStatDic);
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        subtoolStatDic.set(timeStamp, state);
        return timeStamp;
    }

    updateState(subtoolId: string, timeStamp: string, state: any): boolean {
        if (!this.stateDic.has(subtoolId)) {
            return false;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        subtoolStatDic.set(timeStamp, state);
        return true;
    }

    deleteState(subtoolId: string, timeStamp: string, state: any): boolean {
        if (!this.stateDic.has(subtoolId)) {
            return false;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        subtoolStatDic.del(timeStamp);
        return true;
    }

    /**
     * 从当前index开始（不包含当前index）
     * @param subtoolId 
     * @param timeStamp 
     */
    deleteFrom(subtoolId: string, timeStamp: string): void {
        if (!this.stateDic.has(subtoolId)) {
            return;
        }
        let keys: Array<any> = [];
        let subtoolStatDic = this.stateDic.get(subtoolId);
        let currIndex = subtoolStatDic.indexOf(timeStamp);
        subtoolStatDic.delFrom(currIndex);

    }

    getState(subtoolId: string, timeStamp: string): any {
        if (!this.stateDic.has(subtoolId)) {
            return null;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        let state = subtoolStatDic.get(timeStamp);

        return state;

    }

    shift(subtoolId: string) {
        if (!this.stateDic.has(subtoolId)) {
            return;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        let key = subtoolStatDic.getKeyByIndex(0);
        subtoolStatDic.del(key);

    }
    getPreState(subtoolId: string, timeStamp: string): any {
        if (!this.stateDic.has(subtoolId)) {
            return null;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        let currIndex = subtoolStatDic.indexOf(timeStamp);
        let preState = subtoolStatDic.getByIndex(currIndex - 1);
        (<any>preState).stateId = subtoolStatDic.getKeyByIndex(currIndex - 1);

        return preState;
    }

    getNextState(subtoolId: string, timeStamp: string): any {
        if (!this.stateDic.has(subtoolId)) {
            return null;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        let currIndex = subtoolStatDic.indexOf(timeStamp);
        let preState = subtoolStatDic.getByIndex(currIndex + 1);
        (<any>preState).stateId = subtoolStatDic.getKeyByIndex(currIndex + 1);

        return preState;
    }

    getStateCount(subtoolId: string): number {
        if (!this.stateDic.has(subtoolId)) {
            return 0;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);

        return subtoolStatDic.count();
    }
    clearState(subtoolId: string) {
        if (!this.stateDic.has(subtoolId)) {
            return 0;
        }
        let subtoolStatDic = this.stateDic.get(subtoolId);
        subtoolStatDic.clear();
    }
    /**
     * 注册事件
     * @param eventType 事件类型 
     * @param name 组件名称
     * @param fun 回调函数
     */
    on(eventType: stateEventType, name: string, fun: Function) {
        let funHash = null;
        //判断是否第一次 这个方法调取
        if (!this.stateEventHandlers.has(eventType.toString())) {
            funHash = new HashTable<List<Function>>();

            this.stateEventHandlers.set(eventType.toString(), funHash)
        } else {
            funHash = this.stateEventHandlers.get(eventType.toString());
        }
        let funcList = funHash.get(name);
        if (!funcList) {
            funcList = new List<Function>();
            funHash.set(name, funcList);
        }
        funcList.add(fun);
        funHash.set(name, funcList)
    }
    /**
    * 
    * @param name 组件名称
    * @param eventType 事件类型
    */
    //卸载
    unRegister(name: string, eventType?: stateEventType) {
        //只卸载这个组件的这一个事件
        if (Boolean(eventType)) {
            let funHash = this.stateEventHandlers.get(eventType.toString());
            //查找是否删除
            if (funHash.get(name)) {
                funHash.del(name);
            }
        } else {
            //卸载这个组件名下的所有方法
            this.stateEventHandlers.foreach((keys: string, values: HashTable<List<Function>>) => {
                let funHash = values;
                //组件如果包含这个
                if (funHash.get(name)) {
                    funHash.del(name);
                }
            });
        }
    }
    /**
     * 
     * @param eventType 事件类型
     * @param toolName 工具名称
     */

    dispatchEvent(eventType: stateEventType, timeStamp: string, toolName?: string): boolean {
        let eventList = this.stateEventHandlers.get(eventType.toString());

        if (!eventList) {
            return false;
        }
        if (toolName) {
            let handlers = eventList.get(toolName);
            if (handlers) {
                let toolStateDic = this.stateDic.get(timeStamp);
                if (toolStateDic) {
                    let toolState = toolStateDic.get(toolName);
                    handlers.foreach((i: number, handler: Function) => {
                        handler(toolState);
                    })
                }
            } else {
                return false
            }
        } else {
            eventList.foreach((key: string, fun: Function) => {
                let toolStateDic = this.stateDic.get(timeStamp);
                if (toolStateDic) {
                    fun(toolStateDic.get(key))
                }
            })
        }
        return true;
    }

    dispatchObserveEvent(name: string, proerName: string): boolean {
        let eventList = this.stateEventHandlers.get(stateEventType.observeStateChange.toString());

        if (!eventList) {
            return false;
        }
        if (name) {
            let handlers = eventList.get(name);
            if (handlers) {
                let state = this.observeStateDic.get(name);
                handlers.foreach((i: number, handler: Function) => {
                    handler(state, proerName);
                })

            } else {
                return false
            }
        }
        return true;
    }



}


/**
 * 组件名称与属性
 */
export class ComponentObject {
    name: string;
    data: Object;
    constructor(name: string, data: Object) {
        this.name = name;
        this.data = data;
    }
}


/** 
 * 所有事件类型名称
*/
export enum stateEventType {
    observeStateChange = 0,
    stateChange = 1,

    // eraseLine = 2
}


