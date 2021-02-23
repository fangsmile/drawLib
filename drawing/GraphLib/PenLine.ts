import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { CanvasContext } from "../CanvasContext";
import { XlMath } from "./XlMath";
import { Util } from "../../utility/util";
import { Serialize, SerializeProperty } from "../../utility/ts-serializer";

@Serialize({})//序列化
export class PenLine extends Shape {
    @SerializeProperty()
    className: string = "PenLine";
    @SerializeProperty()
    private points: Array<Point> = [];

    //铅笔还是蜡笔
    @SerializeProperty()
    penType: number;//1为铅笔 2为蜡笔  蜡笔的话 不绘制笔锋效果
    constructor(renderStyle: RenderStyle, penType: number = 1,colorKey:string=null) {
        super(renderStyle,null,null,colorKey);
        this.penType = penType;
    }

    addPoint(p: Point, isJudgeDis: boolean = false) {
        //因擦除逻辑已修改 这里加点逻辑可去除
        var lastPoint = this.points[this.points.length - 1];
        if (lastPoint) {
            if (lastPoint.x == p.x && lastPoint.y == p.y)
                return;
            if (isJudgeDis) {
                var dis = Math.sqrt(Math.pow(p.x - lastPoint.x, 2) + Math.pow(p.y - lastPoint.y, 2));
                if (dis < 1)//事件修改吗TODO LFF  if (dis < 5)
                    return;
            }
        }

        this.points.push(p);
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
    //笔锋
    public drawAddPoint(ctx: CanvasContext, isUp: boolean) {

        if (this.points) {
            let maxLineWidth = this.renderStyle.lineWidth;
            let minLineWidth = this.renderStyle.lineWidth / 3;
            let pointCounter = 0;
            let points: Array<Point>;
            if (isUp||this.penType != 1)//不是需要绘制笔锋的线条类型 或者鼠标松开时
                points = this.points;
            else
                points = Util.clone(this.points);
            //当前绘制的线条最后笔锋处补点 贝塞尔方式增加点
            if (this.penType == 1 && points.length >= 2) {
                let i = points.length - 1;
                let endPoint;
                let controlPoint;
                let startPoint = points[i];
                let allInsertPoints = new Array<Point>();
                while (i >= 0) {
                    endPoint = startPoint;
                    controlPoint = points[i];
                    if (i == 0)
                        startPoint = points[i];
                    else
                        startPoint = new Point((points[i].x + points[i - 1].x) / 2, (points[i].y + points[i - 1].y) / 2);
                    if (startPoint && controlPoint && endPoint) {//使用贝塞尔计算补点
                        let dis = (XlMath.distance(startPoint, controlPoint) + XlMath.distance(controlPoint, endPoint)) * ctx.scaleVal;
                        let insertPoints = XlMath.bezierCalculate([startPoint, controlPoint, endPoint], Math.floor(dis / 6) + 1);
                        // 把insertPoints 变成一个适合splice的数组（包含splice前2个参数的数组，第一个参数要插入的位置，第二个参数要删除的原数组个数）
                        insertPoints.unshift(0, 0);
                        Array.prototype.splice.apply(allInsertPoints, insertPoints);
                        points.pop();
                    }
                    pointCounter++;
                    if (pointCounter >= 6)
                        break;
                    i--;
                }
                //赋值最后几个点的线宽
                let insertCount = allInsertPoints.length;
                for (let i = 0; i < insertCount; i++) {
                    let w = (maxLineWidth - minLineWidth) / insertCount * (insertCount - i) + minLineWidth;
                    allInsertPoints[i].setLineWidth(XlMath.toDecimal(w));
                    points.push(allInsertPoints[i]);
                }
            }
            // if(points.get(0).lineWidth==null)
            // debugger
            ctx.clear();
            ctx.strokeStyle = this.renderStyle.strokeColor;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.lineWidth = this.renderStyle.lineWidth / ctx.scaleVal;
            this.drawPoints(ctx, points);
        }
    }
    //笔锋
    private drawPoints(ctx: CanvasContext, points: Array<Point>, isDrawHit: boolean = false) {
        //制造椭圆头
        if (this.penType == 1 && points.length >= 2 && !points[0].getLineWidth()) {
            //计算角度
            ctx.beginPath();
            ctx.fillStyle = this.renderStyle.strokeColor;
            let dire = Util.GetSlideDirection(points[0].x, points[0].y, points[1].x, points[1].y, false);
            if (dire == 1) {//向上
                ctx.ellipse(points[0].x, points[0].y + 1.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 5.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 4 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, Math.PI / 4, 0, Math.PI * 2);
            } else if (dire == 2) {//向下
                ctx.ellipse(points[0].x, points[0].y - 1.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 5.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 4 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, Math.PI / 4, 0, Math.PI * 2);
            } else if (dire == 3) {//向左
                ctx.ellipse(points[0].x + 1 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, points[0].y - 0.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 5.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 4 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, Math.PI * 5 / 4, 0, Math.PI * 2);
            } else {
                ctx.ellipse(points[0].x - 1.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, points[0].y, 5.5 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, 4 / 10 * this.renderStyle.lineWidth / ctx.scaleVal, Math.PI / 4, 0, Math.PI * 2);
            }
            ctx.fill();
        }
        //绘制points形成的线条
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        // ctx.strokeStyle = this.lineColor;
        for (let i = 1; i < points.length; i++) {
            //最后的一些点线宽变细
            if (this.penType == 1 && points[i - 1].getLineWidth() != null) {
                if (points[i - 2] && points[i - 2].getLineWidth() == null) {
                    ctx.stroke();//将之前的线条不变的path绘制完
                    continue;
                }
                ctx.beginPath();//为了开启新的路径 否则每次stroke 都会把之前的路径在描一遍
                // ctx.strokeStyle = "rgba(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ",0.5)";
                ctx.lineWidth = (isDrawHit ? (points[i].getLineWidth() + 25) / ctx.scaleVal : points[i].getLineWidth() / ctx.scaleVal);
                ctx.moveTo(points[i - 1].x, points[i - 1].y);//移动到之前的点
                ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();//将之前的线条不变的path绘制完
            } else {
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
