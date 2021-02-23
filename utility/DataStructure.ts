import { Serialize, Serializable, SerializeProperty } from './ts-serializer'
import RbTree from './RBTree';
@Serialize({})
export class HashValue<T> extends Serializable {
    @SerializeProperty()
    index: number;
    @SerializeProperty()
    key: string;
    @SerializeProperty({type:Object})
    value: T;
}

//扩展插入功能，玄魂@2015-03-04
@Serialize({})
export class HashTable<T> extends Serializable {

    private items: { [key: string]: HashValue<T> };
    @SerializeProperty({ list: true, type:  Array})
    private itemList: Array<HashValue<T>>;
    constructor() {
        super();
        this.items = {};
        this.itemList = [];
    }
    get type() {
        return "xhHashTable";
    }
    set(key: string, value: T): void {
        var vl = new HashValue<T>();
        vl.key = key;
        vl.value = value;
        var index = this.itemList.length;
        if (this.has(key)) {
            index = this.items[key].index;
        }
        vl.index = index;
        this.itemList[index] = vl;
        this.items[key] = vl;
    }


    clear() {
        this.items = {};
        this.itemList = [];
    }
    del(key: string): void {
        if (this.has(key)) {
            var index = this.items[key].index;
            if (index > -1) {
                this.itemList.splice(index, 1);
            }
            delete this.items[key];
            this.resetIndex();
        }
    }

    /**
     * 不包含当前index
     * @param index
     */
    delFrom(index: number) {
        for (let i = index+1; i < this.count(); i++) {
            let key = this.itemList[i].key;
            delete this.items[key];
        }
        this.itemList.splice(index+1, this.count() - index);
        this.resetIndex();
    }


    resetIndex(): void {

        this.foreachHashv((k: any, v: HashValue<T>) => {
            var index = this.itemList.indexOf(v);
            this.items[k].index = index;
        });
    }

    has(key: string): boolean {
        return key in this.items;
    }

    get(key: string): T {
        if (this.has(key)) {
            return this.items[key].value;
        }
        return null;
    }

    count(): number {
        return this.itemList.length;
    }

    all(): Array<T> {
        return this.itemList.map(vl => {
            return vl.value;
        });

    }
    first(): T {
        return this.itemList[0].value;
    }
    last(): T {
        return this.itemList[this.itemList.length - 1].value;
    }
    getByIndex(index: number): T {
        return this.itemList[index].value;
    }

    getKeyByIndex(index: number): string {
        return this.itemList[index].key;
    }

    //遍历 扩展
    foreach(callback: any) {
        for (var key in this.items) {
            let returnVal = callback(key, this.items[key].value);
            if (returnVal === false) {
                return false;
            }
        }
    }
    private foreachHashv(callback: any) {
        for (var key in this.items) {
            let returnVal = callback(key, this.items[key]);
            if (returnVal === false) {
                return false;
            }
        }
    }
    hasValue(value: any): boolean {
        for (var key in this.items) {
            if (this.items[key].value == value)
                return true;
        }
        return false;
    }
    //获取index
    indexOf(key: any): number {
        if (this.has(key)) {
            return this.items[key].index;
        }
    }

    //插入
    insertAt(index: number, value: T, key: string) {
        var hashV = new HashValue<T>();

        hashV.index = index;
        hashV.key = key;
        hashV.value = value;
        this.itemList.splice(index, 0, hashV);
        this.items[key] = hashV;
        this.resetIndex();
    }

    sort(callback: Function) {
        return this.itemList.sort((a: HashValue<T>, b: HashValue<T>) => { return callback(a.value, b.value); });
    }
    toArray(): Array<T> {
        return this.itemList.slice(0, this.itemList.length).map(vl => {
            return vl.value;
        });

    }
    push(lists: HashTable<any>) {
        lists.foreach((key: string, value: any) => {
            this.set(key, value);
        })
    }
    mapKey(): Array<string> {
        var returnArr = new Array<string>();
        for (var key in this.items) {
            returnArr.push(key)
        }
        return returnArr;
    }

    toImmutableMap() {
    }
}



@Serialize({})
export class List<T> extends Serializable {
    @SerializeProperty({ list: true, type: Array })
    private items: Array<T>;

    private checkIndex(index: any): boolean {
        return !(index < 0 || isNaN(index) || index >= this.items.length);
    }
    constructor() {
        super();
        this.items = new Array<T>();
    }
    get type() {
        return "xhList";
    }
    length(): number {
        return this.items.length;
    }

    add(value: T): void {
        this.items.push(value);
    }
    addList(valueList: List<T>) {
        for (var i = 0; i < valueList.length(); i++) {

            var value = valueList.get(i);
            this.items.push(value);
        }
    }
    pop(): T {
        return this.items.pop();
    }

    shift() {
        this.items.shift();
    }

    remove(index: number): void {
        if (this.checkIndex(index)) {
            this.items.splice(index, 1);

        }
    }
    /**
     * 從指定索引處開始刪除指定個數的元素
     * 玄魂 @ 2017
     * @param from
     * @param count
     */
    removeMany(from: number, count: number) {

        if (this.checkIndex(from)) {
            this.items.splice(from, count);
        }
    }

    clear(): void {
        this.items = [];
    }

    contains(value: T): boolean {
        for (var i in this.items) {
            return value == this.items[i];
        }
        return false;
    }

    indexOf(value: T): number {
        return this.items.indexOf(value);
    }

    insert(index: number, value: T) {
        //this.checkIndex(index) && this.items.splice(index , 0, value);
        this.items.splice(index, 0, value);
    }

    get(index: number): T {
        return this.items[index];
    }
    set(index: any, value: T) {
        this.items[index] = value;
    }
    all(): Array<T> {
        return this.items;
    }
    foreach(callback: (i: number, item: T) => any) {
        var len = this.items.length;
        for (var i = 0; i < len; i++) {
            if (callback(i, this.items[i]) === false) break;
        }
    }
    reverseForeach(callback: any) {
        var len = this.items.length;
        for (var i = len - 1; i >= 0; i--) {
            if (callback(i, this.items[i]) === false) break;
        }
    }
    sort(callback: Function) {
        this.items.sort((a: T, b: T) => { return callback(a, b); });
    }
    some(callback:Function){
       const length = this.items.length;
       for(let i = 0;i < length;i ++){
           let bool = callback(i,this.items[i],this.items);
           if(bool){
               return bool;
           }
       }
    }
    every(callback:Function){
        const length = this.items.length;
        for(let i = 0;i < length;i ++){
            let bool = callback(i,this.items[i],this.items);
            if(!bool){
                return bool;
            }
       }
    }
    filter(callback:Function){
        const arr = new List<any>();
        this.foreach((index,item) => {
            const isAdd = callback(index,item,this.items);
            if(isAdd){
                arr.add(item);
            }
        })
        return arr;
    }
}

/**
 * @description 基于红黑树的SortedMap
 * @author 玄魂
 * @ 2018-06-12
 */
export class SortedMap<T>{
    /**
     * 排序的对象
     */
    private orderBy: string;
    tree: RbTree;
    private items: { [key: string]: HashValue<T> };

    private itemList: Array<T>;

    constructor(orderBy: string) {
        this.orderBy = orderBy;
        this.tree = new RbTree();
        this.items = {};
        this.itemList = [];
    }

    get type() {
        return "xhSortedMap";
    }
    set(key: string, value: T): void {

        let keyForTree = ((<any>value)[this.orderBy]).toString();

        if (keyForTree) {
            if (this.tree.find(keyForTree)) {
                keyForTree += key;

            }
            (<any>value)['_sortMapKey'] = keyForTree;

            var vl = new HashValue<T>();
            vl.key = key;
            vl.value = value;

            this.tree.insert(keyForTree, vl);
            this.itemList = this.tree.toSortedArray();
            vl.index = this.itemList.indexOf(value);
            this.items[key] = vl;
        }

    }


    clear() {
        this.items = {};
        this.itemList = [];
        this.tree.emptyTree();
    }
    del(key: string): void {
        if (this.has(key)) {
            var index = this.items[key].index;
            if (index > -1) {
                let sortKey = (<any>this.items[key])['_sortMapKey']
                this.tree.remove(sortKey)
                this.itemList = this.tree.toSortedArray();
            }
            delete this.items[key];
            this.resetIndex();
        }
    }


    resetIndex(): void {

        this.foreach((k: any, v: T) => {
            var index = this.itemList.indexOf(v);
            this.items[k].index = index;
        });
    }

    has(key: string): boolean {
        return key in this.items;
    }

    get(key: string): T {
        if (this.has(key)) {
            return this.items[key].value;
        }
        return null;
    }

    count(): number {
        return this.itemList.length;
    }

    all(): Array<T> {
        return this.itemList;
    }
    first() {
        return this.itemList[0];
    }
    last() {
        return this.itemList[this.itemList.length - 1];
    }
    getByIndex(index: number): T {
        return this.itemList[index];
    }
    //遍历 扩展
    foreach(callback: any) {
        for (var key in this.items) {
            callback(key, this.items[key].value);
        }
    }
    //获取index
    indexOf(key: any) {
        if (this.has(key)) {
            return this.items[key].index;
        }
    }

    toArray(): Array<T> {
        return this.itemList.slice(0, this.itemList.length)
    }
    push(lists: HashTable<any>) {
        lists.foreach((key: string, value: any) => {
            this.set(key, value);
        })
    }
    mapKey(): Array<string> {
        var returnArr = new Array<string>();
        for (var key in this.items) {
            returnArr.push(key)
        }
        return returnArr;
    }
    /**
     * 获取排序值小于等于输入值的所有元素
     * @param input 输入的值，和排序值比较
     */
    getLessThanByOrder(input: any): Array<T> {

        let maxV: HashValue<T> = this.tree.findleastBigger(input);
        if (maxV) {
            let index = maxV.index;
            for (let i = index + 1; i < this.itemList.length; i++) {
                if ((<any>this.itemList[i])[this.orderBy] > input) {
                    break;
                }
            }

            return this.itemList.slice(0, index + 1);
        }
        return null;
    }

    /**
     * 获取排序值大于等于输入值的所有元素
     * @param input 输入的值，和排序值比较
     */
    getMoreThanByOrder(input: any): Array<T> {
        let minV: HashValue<T> = this.tree.findleastBigger(input);
        if (minV) {
            let index = minV.index;
            for (let i = index + 1; i <= 0; i--) {
                if ((<any>this.itemList[i])[this.orderBy] < input) {
                    break;
                }
            }

            return this.itemList.slice(index, this.itemList.length);
        }
        return null;
    }

}





