import { Shape } from "./Shape";
import { Point } from "./Point";
import { CanvasContext } from "../CanvasContext";
import { RenderStyle, RotateConfig, RegionConfig } from "./OptionConfig";
export class Path extends Shape {
    className: string = "Path";
    private pointsArr: Array<Point> = [];
    constructor(renderStyle: RenderStyle, colorKey: string = null,isSetGraphLib:boolean=true) {
        super(renderStyle,null,null,colorKey,isSetGraphLib);

    }
    addPoint(p: Point) {

        this.pointsArr.push(p);
    }
    clearPoints() {
        this.pointsArr.length = 0;
    }

    getPoints() {
        return this.pointsArr;
    }
    changePoints(points: Array<Point>) {
        this.pointsArr = points;
    }
    changePoint(p: Point, index: number) {
        this.pointsArr[index] = p;
    }

    pushPoints(points: Array<Point>) {
        this.pointsArr = this.pointsArr.concat(points);
    }
    // render(ctx: CanvasRenderingContext2D, hitCtx: CanvasRenderingContext2D) {
    //     this.renderFillStroke(ctx);
    //     hitCtx && this.renderHit(hitCtx);
    // }
    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        var count = this.pointsArr.length;
        for (var i = count - 1; i >= 0; i--) {
            this.pointsArr[i].x = this.pointsArr[i].x + diffX;
            this.pointsArr[i].y = this.pointsArr[i].y + diffY;
        }
    }

    drawPath(ctx: CanvasContext) {

        if (this.pointsArr && this.pointsArr.length >= 1) {
            var count = this.pointsArr.length;
            var p: Point = this.pointsArr[0];

            if (count >= 2) {
                ctx.moveTo(p.x, p.y);

                for (var i = 1; i <= count - 1; i++) {
                    ctx.lineTo(this.pointsArr[i].x, this.pointsArr[i].y);
                }

                // this.isClosed && ctx.closePath();
            } else {
                var radius = this.renderStyle.lineWidth;
                ctx.arc(this.pointsArr[0].x, this.pointsArr[0].y, radius / 2, 0, 2 * Math.PI);
            }
        }
    }


}