import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { CanvasContext } from "../CanvasContext";
import { XlMath } from "./XlMath";
import { Serialize, Serializable, SerializeProperty } from "../../utility/ts-serializer";
@Serialize({})// 序列化
export class CircleConfig extends Serializable {
    @SerializeProperty()
    startDegree: number = 0;

    @SerializeProperty()
    endDegree: number = 360;

    @SerializeProperty()
    radius: number;

    @SerializeProperty()
    clockWise: boolean = true;

    @SerializeProperty({
        type: Point
    })
    centerPoint: Point;

    constructor(
        radius: number,
        centerPoint: Point,
        startDegree: number = 0,
        endDegree: number = 360,
        clockWise: boolean = true,
        isSector: boolean = false) {
        super();
        this.startDegree = startDegree;
        this.endDegree = endDegree;
        this.radius = radius;
        this.clockWise = clockWise;
        this.centerPoint = centerPoint;
    }
}
@Serialize({})// 序列化
export class Circle extends Shape {
    className: string = "Circle";

    @SerializeProperty({
        type: CircleConfig
    })
    circleConfig: CircleConfig;

    // renderStyle: RenderStyle;
    isScaleRadius: boolean;// 圆的半径是否需要跟随画布scale值而变化，true的时候绘制draw的时候 radius需要重新计算

    constructor(circleConfig: CircleConfig, renderStyle: RenderStyle, isScaleRadius: boolean = false, colorKey: string = null) {
        super(renderStyle, null, null, colorKey);
        this.circleConfig = circleConfig;
        this.isScaleRadius = isScaleRadius;
    }

    drawPath(ctx: CanvasContext) {
        ctx.arc(this.circleConfig.centerPoint.x, this.circleConfig.centerPoint.y, this.isScaleRadius ? this.circleConfig.radius / ctx.scaleVal : this.circleConfig.radius, this.circleConfig.startDegree * Math.PI / 180, this.circleConfig.endDegree * Math.PI / 180, !this.circleConfig.clockWise);
    }

    prepareStyle(ctx: CanvasContext) {
        ctx.strokeStyle = this.renderStyle.strokeColor;
        ctx.fillStyle = this.renderStyle.fillColor;
        ctx.lineCap = "round";
        ctx.lineJoin = 'round';// 转折的时候不出现尖角
        ctx.lineWidth = this.renderStyle.lineWidth / ctx.scaleVal;
        // 以下代码解决bug：http://jira.xuelebj.net/browse/CLASSROOM-4274
        const lineDash = []
        for (let i = 0;i < this.renderStyle.lineDash.length;i++) {
            lineDash[i] = this.renderStyle.lineDash[i] / ctx.scaleVal;
        }
        ctx.setLineDash(lineDash)
        if (this.renderStyle.lineDash.length > 1) {
            ctx.lineJoin = this.renderStyle.lineJoin;
            ctx.lineCap = this.renderStyle.lineCap;
        }
    }

    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        if (this.circleConfig) {
            this.circleConfig.centerPoint.x += diffX;
            this.circleConfig.centerPoint.y += diffY;
        }
    }

    changeRadius(radius: number) {
        this.circleConfig.radius = radius;
    }

    changeStartDegree(degree: number) {
        this.circleConfig.startDegree = degree;
    }

    changeEndDegree(degree: number) {
        this.circleConfig.endDegree = degree;
    }

    getCircleConfig() {
        return this.circleConfig;
    }

    getCircleCenter() {
        return this.circleConfig.centerPoint;
    }

    getRadius() {
        return this.circleConfig.radius;
    }

    getTopCenterPoint() {
        const p = XlMath.computePointAfterRotate(this.getCircleCenter().x + this.getRadius(), this.getCircleCenter().y, this.getCircleCenter().x, this.getCircleCenter().y, 270);
        return p;
    }

    getBottomCenterPoint() {
        const p = XlMath.computePointAfterRotate(this.getCircleCenter().x + this.getRadius(), this.getCircleCenter().y, this.getCircleCenter().x, this.getCircleCenter().y, 90);
        return p;
    }

    getLeftCenterPoint() {
        const p = XlMath.computePointAfterRotate(this.getCircleCenter().x + this.getRadius(), this.getCircleCenter().y, this.getCircleCenter().x, this.getCircleCenter().y, 180);
        return p;
    }

    getRightCenterPoint() {
        const p = XlMath.computePointAfterRotate(this.getCircleCenter().x + this.getRadius(), this.getCircleCenter().y, this.getCircleCenter().x, this.getCircleCenter().y, 0);
        return p;
    }

    getPointRange() {
        const minX = this.getLeftCenterPoint().x;
        const maxX = this.getRightCenterPoint().x;
        const minY = this.getTopCenterPoint().y;
        const maxY = this.getBottomCenterPoint().y;
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        }
    }
}
