import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { CanvasContext } from "../CanvasContext";
import { XlMath } from "./XlMath";
import { Serialize, SerializeProperty } from "../../utility/ts-serializer";
//该文件中的PenLine是没有涉及笔锋逻辑的
@Serialize({})//序列化
export class PenLine extends Shape {
    @SerializeProperty()
    className: string = "PenLine";
    @SerializeProperty()
    private points: Array<Point> = [];

    //铅笔还是蜡笔
    @SerializeProperty()
    penType: number;//1为铅笔 2为蜡笔  蜡笔的话 不绘制笔锋效果
    constructor(renderStyle: RenderStyle, penType: number = 1, colorKey: string = null) {
        super(renderStyle, null, null, colorKey);
        this.penType = penType;
    }

    addPoint(p: Point, isJudgeDis: boolean = false) {
        //因擦除逻辑已修改 这里加点逻辑可去除
        var lastPoint = this.points[this.points.length - 1];
        if (lastPoint) {
            if (lastPoint.x == p.x && lastPoint.y == p.y)
                return false;
            if (isJudgeDis) {
                var dis = Math.sqrt(Math.pow(p.x - lastPoint.x, 2) + Math.pow(p.y - lastPoint.y, 2));
                if (dis < 5)
                    return false;
            }
        }

        this.points.push(p);
        return true
    }

    draw(ctx: CanvasContext, hitCtx: CanvasContext) {
        if (ctx && this.isDraw) {
            ctx.save();
            this.rotateContext(ctx);
            this.prepareStyle(ctx);
            ctx.beginPath();
            this.drawPath(ctx);
            this.renderStyle.isClosePath && ctx.closePath();
            if (this.renderStyle.isFill) {
                this.fill(ctx);
            }
            // if (this.renderStyle.isStroke) {
            //     this.stroke(ctx);
            // }

            ctx.restore();
        }
        if (hitCtx && this.isDrawHit) {
            hitCtx.save();
            this.rotateContext(hitCtx);
            this.prepareHitStyle(hitCtx);
            hitCtx.beginPath();
            this.drawHitPath(hitCtx);
            this.renderStyle.isClosePath && hitCtx.closePath();
            if (this.renderStyle.isFill) {
                this.fill(hitCtx);
            }
            // if (this.renderStyle.isStroke) {
            //     this.stroke(hitCtx);
            // }

            hitCtx.restore();
        }
    }
    prepareHitStyle(hitCtx: CanvasContext) {
        hitCtx.strokeStyle = this.colorKey;
        hitCtx.fillStyle = this.colorKey;
        hitCtx.lineWidth = (this.renderStyle.lineWidth > 0 ? this.renderStyle.lineWidth + 25 : this.renderStyle.lineWidth) / hitCtx.scaleVal;
        hitCtx.setLineDash(this.renderStyle.lineDash)
        hitCtx.lineJoin = this.renderStyle.lineJoin;
        hitCtx.lineCap = this.renderStyle.lineCap;
    }
    removePoint() {
        this.points.pop();
        return this;
    }
    getPoints() {
        return this.points;
    }
    changePoints(points: Array<Point>) {
        this.points = points;
    }
    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        var count = this.points.length;
        for (var i = count - 1; i >= 0; i--) {
            this.points[i].x = this.points[i].x + diffX;
            this.points[i].y = this.points[i].y + diffY;
        }
    }

    drawPath(ctx: CanvasContext) {
        if (this.points) {
            var count = this.points.length;
            if (count >= 2) {
                this.drawPoints(ctx, this.points);
                // this.isClosed && ctx.closePath();
            } else {
                var radius = this.renderStyle.lineWidth;
                ctx.arc(this.points[0].x, this.points[0].y, radius / ctx.scaleVal / 2, 0, 2 * Math.PI);
            }
        }
    }
    drawHitPath(ctx: CanvasContext) {
        if (this.points) {
            var count = this.points.length;
            if (count >= 2) {
                this.drawPoints(ctx, this.points, true);
                // this.isClosed && ctx.closePath();
            } else {
                var radius = this.renderStyle.lineWidth + 13;
                ctx.arc(this.points[0].x, this.points[0].y, radius / ctx.scaleVal / 2, 0, 2 * Math.PI);
            }
        }
    }
    //笔锋  优化掉笔锋
    public drawAddPoint(ctx: CanvasContext, isUp: boolean) {

        if (this.points&&this.points.length>=2) {
            ctx.save();
            ctx.strokeStyle = this.renderStyle.strokeColor;
            if (this.penType == 2)
                ctx.globalCompositeOperation = "xor";//使用异或操作对源图像与目标图像进行组合。
            else
                ctx.globalCompositeOperation = "source-over";
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = this.renderStyle.lineWidth / ctx.scaleVal;
            ctx.beginPath();
            let x = (this.points[this.points.length - 2].x + this.points[this.points.length - 1].x) / 2,
                y = (this.points[this.points.length - 2].y + this.points[this.points.length - 1].y) / 2;
            if (this.points.length == 2) {
                ctx.moveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y);
                ctx.lineTo(x, y);
            } else {
                let lastX = (this.points[this.points.length - 3].x + this.points[this.points.length - 2].x) / 2,
                    lastY = (this.points[this.points.length - 3].y + this.points[this.points.length - 2].y) / 2;
                ctx.moveTo(lastX, lastY);
                ctx.quadraticCurveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y, x, y);
            }
            if(isUp){
                ctx.lineTo( this.points[this.points.length - 1].x,  this.points[this.points.length - 1].y);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    //笔锋
    private drawPoints(ctx: CanvasContext, points: Array<Point>, isDrawHit: boolean = false) {
        if (this.penType == 2)
            ctx.globalCompositeOperation = "xor";//使用异或操作对源图像与目标图像进行组合。
        else
            ctx.globalCompositeOperation = "source-over";
        //绘制points形成的线条
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        // ctx.strokeStyle = this.lineColor;
        for (let i = 1; i < points.length; i++) {
            var p0: Point = points[i];
            var p1: Point = points[i + 1];
            let c, d;
            if (!p1) {
                c = p0.x;
                d = p0.y;
            } else if (p1.getLineWidth() != null) {
                c = p1.x;
                d = p1.y;
            } else {
                c = (p0.x + p1.x) / 2;
                d = (p0.y + p1.y) / 2;
            }
            ctx.quadraticCurveTo(p0.x, p0.y, c, d); //二次贝塞曲线函数
            if (i == points.length - 1) {
                ctx.stroke();
            }

        }
    }
    getPointRange() {
        let rect = XlMath.rectPoint(this.points);
        return {
            minX: rect.minX,
            maxX: rect.maxX,
            minY: rect.minY,
            maxY: rect.maxY
        }
    }
}


