import { XlMath } from "./XlMath";

export class GraphLib {
    static shapes: any = {}// 存储全部的图形

    static MaxScale = 100;

    static MinScale = 1 / 100

    static getColor() {
        let key;
        while (true) {
            key = XlMath.getRandomColor();
            if (key && !(key in GraphLib.shapes)) {
                break;
            }
        }
        return key
    }
}
export class SizeConfig {
    minX: number;

    minY: number;

    maxX: number;

    maxY: number;

    constructor(minX: number, minY: number, maxX: number, maxY: number) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }
}
