import { CanvasContext } from "../CanvasContext";
import { LianXiGeConfig, RegionConfig, RenderStyle } from "./OptionConfig";
import { Shape } from "./Shape";

export class SiXianGe extends Shape {
    type: string = "Shape";

    className: string = "SiXianGe";

    lianXiGeConfig: LianXiGeConfig;

    linesX: Array<number>;

    linesY: Array<number>;

    constructor(lianXiGeConfig: LianXiGeConfig, regionConfig: RegionConfig = null) {
        super(new RenderStyle(false, true, "", lianXiGeConfig.lineColor, lianXiGeConfig.lineWidth, false), null, regionConfig);
        this.lianXiGeConfig = lianXiGeConfig;
        this.initLines();
    }

    initLines() {
        this.linesX = new Array();
        this.linesY = new Array();
        const startX = this.regionConfig.x;
        const startY = this.regionConfig.y;
        const x = startX;
        let y = startY;

        this.linesX.push(x);
        this.linesX.push(this.regionConfig.x + this.regionConfig.width);

        while (y <= this.regionConfig.y + this.regionConfig.height) {
            this.linesY.push(y);
            if (this.linesY.length % 4 == 0) {
                y += this.lianXiGeConfig.lineSpace;
            } else {
                y += this.lianXiGeConfig.innerLineHeight;
            }
        }
    }

    drawPath(ctx: CanvasContext) {
        // 四线第一条实线
        for (let j = 0;j < this.linesY.length;j += 4) {
            ctx.moveTo(this.linesX[0], this.linesY[j]);
            ctx.lineTo(this.linesX[this.linesX.length - 1], this.linesY[j])
        }
        // 四线第四条实线
        for (let j = 3;j < this.linesY.length;j += 4) {
            ctx.moveTo(this.linesX[0], this.linesY[j]);
            ctx.lineTo(this.linesX[this.linesX.length - 1], this.linesY[j])
        }
        ctx.stroke();
        ctx.beginPath();
        this.setLineDash(ctx, [8, 4]);
        // 四线第二条虚线
        for (let j = 1;j < this.linesY.length;j += 4) {
            ctx.moveTo(this.linesX[0], this.linesY[j]);
            ctx.lineTo(this.linesX[this.linesX.length - 1], this.linesY[j])
        }
        // 四线第三条虚线
        for (let j = 2;j < this.linesY.length;j += 4) {
            ctx.moveTo(this.linesX[0], this.linesY[j]);
            ctx.lineTo(this.linesX[this.linesX.length - 1], this.linesY[j])
        }
    }
}
