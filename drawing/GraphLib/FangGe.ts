import { CanvasContext } from "../CanvasContext";
import { LianXiGeConfig, RegionConfig, RenderStyle } from "./OptionConfig";
import { Shape } from "./Shape";

export class FangGe extends Shape {
    type: string = "Shape";

    className: string = "FangGe";

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
        let x = startX;
        let y = startY;

        while (x <= this.regionConfig.x + this.regionConfig.width) {
            this.linesX.push(x);

            x += this.lianXiGeConfig.gridWidth;
        }
        while (y <= this.regionConfig.y + this.regionConfig.height) {
            this.linesY.push(y);
            if (this.linesY.length % 2 == 0) {
                y += 16;
            } else {
                y += this.lianXiGeConfig.gridHeight;
            }
        }
    }

    drawPath(ctx: CanvasContext) {
        // 横线
        for (let j = 0;j < this.linesY.length;j++) {
            ctx.moveTo(this.linesX[0], this.linesY[j]);
            ctx.lineTo(this.linesX[this.linesX.length - 1], this.linesY[j])
        }

        // 竖线
        for (let i = 0;i < this.linesX.length;i++) {
            for (let j = 0;j < this.linesY.length - 1;j++) {
                ctx.moveTo(this.linesX[i], this.linesY[j]);
                ctx.lineTo(this.linesX[i], this.linesY[++j])
            }
        }
    }
}
