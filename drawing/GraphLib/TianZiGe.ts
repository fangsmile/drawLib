import { CanvasContext } from "../CanvasContext";
import { LianXiGeConfig, RegionConfig, RenderStyle } from "./OptionConfig";
import { Shape } from "./Shape";

export class TianZiGe extends Shape {
    type: string = "Shape";

    className: string = "TianZiGe";

    lianXiGeConfig: LianXiGeConfig;

    linesX: Array<number>;

    linesY: Array<number>;

    constructor(lianXiGeConfig: LianXiGeConfig, regionConfig: RegionConfig = null) {
        super(new RenderStyle(false, true, "", lianXiGeConfig.lineColor, lianXiGeConfig.lineWidth, false), null, regionConfig);

        this.isDrawHit = false;
        this.lianXiGeConfig = lianXiGeConfig;
        this.initLines();
    }

    initLines() {
        this.linesX = new Array();
        this.linesY = new Array();
        const startX = this.regionConfig.x;
        const startY = this.regionConfig.y;

        // 实线的x和y的坐标数组
        let x = startX;
        let y = startY;
        while (x <= this.regionConfig.x + this.regionConfig.width) {
            this.linesX.push(x);
            x += this.lianXiGeConfig.gridWidth;
        }
        while (y <= this.regionConfig.y + this.regionConfig.height) {
            this.linesY.push(y);
            y += this.lianXiGeConfig.gridHeight;
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
            ctx.moveTo(this.linesX[i], this.linesY[0]);
            ctx.lineTo(this.linesX[i], this.linesY[this.linesY.length - 1])
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = this.lianXiGeConfig.dashLineColor;
        ctx.lineWidth = this.lianXiGeConfig.dashLineWidth / ctx.scaleVal;
        this.setLineDash(ctx, [8, 4]);// 有问题：最后一条线不是真实的虚线  待解决 TODO
        // 虚线横线
        for (let j = 0;j < this.linesY.length - 1;j++) {
            ctx.moveTo(this.linesX[0], this.linesY[j] + this.lianXiGeConfig.gridHeight / 2);
            ctx.lineTo(this.linesX[this.linesX.length - 1], this.linesY[j] + this.lianXiGeConfig.gridHeight / 2)
        }
        // 虚线竖线
        for (let i = 0;i < this.linesX.length - 1;i++) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.linesX[i] + this.lianXiGeConfig.gridWidth / 2, this.linesY[0]);
            ctx.lineTo(this.linesX[i] + this.lianXiGeConfig.gridWidth / 2, this.linesY[this.linesY.length - 1])
        }
    }
}
