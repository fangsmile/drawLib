import { Serializable, Serialize, SerializeProperty } from "../../utility/ts-serializer";
@Serialize({})//序列化
export class Point extends Serializable  {
    @SerializeProperty()
    x: number;
    @SerializeProperty()
    y: number;
    @SerializeProperty()
    private lineWidth: number=null;//优化笔锋的时候加入
    constructor(x:number, y:number) {
        super();
        this.x = x;
        this.y = y;
    }
    getLineWidth() {
        return this.lineWidth;
    }
    setLineWidth(lineWidth: number) {
        this.lineWidth = lineWidth;
    }
}