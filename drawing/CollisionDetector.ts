
import {List} from '../utility/DataStructure';
import { Point } from './GraphLib/Point';
import{DirectionType} from './enum';

export class CollisiionDetector {


    private static _instance: CollisiionDetector;

    public static getInstance(): CollisiionDetector {
        if (!CollisiionDetector._instance) {
            CollisiionDetector._instance = new CollisiionDetector();
        }
        return CollisiionDetector._instance;
    }

    private constructor() {

    }
    //获取该矩形上的四条边
    private getFourLines(rectPointsArr: List<any>) {
        var p0 = rectPointsArr.get(0);
        var p1 = rectPointsArr.get(1);
        var p2 = rectPointsArr.get(2);
        var p3 = rectPointsArr.get(3);
        var l1 = [[p0.x, p0.y], [p1.x, p1.y]];
        var l2 = [[p1.x, p1.y], [p2.x, p2.y]];
        var l3 = [[p2.x, p2.y], [p3.x, p3.y]];
        var l4 = [[p3.x, p3.y], [p0.x, p0.y]];
        return [l1, l2, l3, l4];
        //ddd
    }
    private getTYPoing(p:Array<number>, axis:Array<number>) {//获取点在轴上的投影点
        //顶点在轴上的投影
        var x = ((p[0] * axis[0] + p[1] * axis[1]) / (axis[0] * axis[0] + axis[1] * axis[1])) * axis[0];
        var y = ((p[0] * axis[0] + p[1] * axis[1]) / (axis[0] * axis[0] + axis[1] * axis[1])) * axis[1];
        return [x, y];
    }
    private getLineTYToAxis(line:any, axis:any) {//线到轴的投影

        var a = [axis[1][0] - axis[0][0], axis[1][1] - axis[0][1]];//轴向量
        var p0 = line[0];//线的一个顶点0
        var p1 = line[1];//线的一个顶点1
        var pt0 = this.getTYPoing(p0, a);
        var pt1 = this.getTYPoing(p1, a);
        return [pt0, pt1];

    }
    private isLineOverlap(l1:any, l2:any) {//判断线段是否重叠

        var l1p1 = l1[0], l1p2 = l1[1], l2p1 = l2[0], l2p2 = l2[1];
        if (l1p1[0] != l2p1[0]) {//非垂直X轴的两线段
            if ((l1p1[0] - l2p1[0]) * (l1p1[0] - l2p2[0]) < 0 || (l1p2[0] - l2p1[0]) * (l1p2[0] - l2p2[0]) < 0 || (l2p1[0] - l1p1[0]) * (l2p1[0] - l1p2[0]) < 0 || (l2p2[0] - l1p1[0]) * (l2p2[0] - l1p2[0]) < 0) {
                return true;
            }
        }
        else {//垂直X轴
            if ((l1p1[1] - l2p1[1]) * (l1p1[1] - l2p2[1]) < 0 || (l1p2[1] - l2p1[1]) * (l1p2[1] - l2p2[1]) < 0 || (l2p1[1] - l1p1[1]) * (l2p1[1] - l1p2[1]) < 0 || (l2p2[1] - l1p1[1]) * (l2p2[1] - l1p2[1]) < 0) {
                return true;
            }
        }

        return false;
    }
    private detectAxisCollision(axis:any, lineArr:any) {//矩形的轴和另一个矩形要比较的四个边

        for (var i = 0, len = lineArr.length; i < len; i++) {
            var tyLine = this.getLineTYToAxis(lineArr[i], axis);//获取线段在轴上的投影线段 [[a,b],[a1,b1]]
            var tyAxis = this.getLineTYToAxis(axis, axis);

            if (this.isLineOverlap(tyLine, tyAxis)) {
                return true;
            }
        }
        return false;
    }
    RectToRectCollisionDec(r1PointArray: List<Point>, r2PointArray: List<Point>) {

        var linesArr1 = this.getFourLines(r1PointArray);//矩形1的四条边
        var linesArr2 = this.getFourLines(r2PointArray);//矩形2的四条边

        //矩形相邻的两个边作为两个轴，并且和另一个矩形的四个边进行投影重叠的比较
        if (this.detectAxisCollision(linesArr2[0], linesArr1) && this.detectAxisCollision(linesArr2[1], linesArr1) && this.detectAxisCollision(linesArr1[0], linesArr2) && this.detectAxisCollision(linesArr1[1], linesArr2)) {
            return true;
        }
        return false;

    }
    //直线和矩形相交判断，
    //依次判断直线是否和矩形的四条边中任意一边相交
    RectRoArcCollisionDec(arcPointArray: List<Point>, rectPointArray: List<Point>): boolean {
        var lenght = rectPointArray.length();
        var isCollision = false;
        for (var i = 0; i < lenght; i++) {
            var points = new List<Point>();
            points.add(rectPointArray.get(i));
            points.add(rectPointArray.get((i + 1) % 4));
            isCollision = this.LineToArcCollisionDec(points, arcPointArray);
            if (isCollision) {
                break;
            }
        }
        return isCollision
    }
    RectRoLineCollisionDec(linePointArray: List<Point>, rectPointArray: List<Point>): boolean {
        var lenght = rectPointArray.length();
        var isCollision = false;
        for (var i = 0; i < lenght; i++) {
            isCollision = this.LineToLineCollisionDec(linePointArray.get(0), linePointArray.get(1), rectPointArray.get(i), rectPointArray.get((i + 1) % 4));

            if (isCollision) {
                break;
            }
        }
        return isCollision
    }
    CCW(p1:any, p2:any, p3:any): boolean {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }


    LineToLineCollisionDec(line1Start: Point, line1End: Point, line2Start: Point, line2End:Point) {
        return (this.CCW(line1Start, line2Start, line2End) != this.CCW(line1End, line2Start, line2End)) && (this.CCW(line1Start, line1End, line2Start) != this.CCW(line1Start, line1End, line2End));
    }

    ///曲线相交判断
    ArcToArcCollisionDec(arc1PointArray: List<Point>, arc2PointArray: List<Point>): boolean {
        var l1 = this.LineToLineCollisionDec(arc1PointArray.get(0), arc1PointArray.get(2), arc2PointArray.get(0), arc2PointArray.get(2));
        if (l1) return true;
        var l2 = this.LineToLineCollisionDec(arc1PointArray.get(0), arc1PointArray.get(2), arc2PointArray.get(2), arc2PointArray.get(1));
        if (l2) return true;
        var l3 = this.LineToLineCollisionDec(arc1PointArray.get(2), arc1PointArray.get(1), arc2PointArray.get(2), arc2PointArray.get(1));
        if (l3) return true;
        var l4 = this.LineToLineCollisionDec(arc1PointArray.get(2), arc1PointArray.get(0), arc2PointArray.get(0), arc2PointArray.get(2));
        if (l4) return true;
        return false;
    }
    ///曲线相交判断
    LineToArcCollisionDec(linePointArray: List<Point>, arc2PointArray: List<Point>): boolean {
        var l1 = this.LineToLineCollisionDec(linePointArray.get(0), linePointArray.get(1), arc2PointArray.get(0), arc2PointArray.get(2));
        if (l1) return true;
        var l2 = this.LineToLineCollisionDec(linePointArray.get(0), linePointArray.get(1), arc2PointArray.get(2), arc2PointArray.get(1));
        if (l2) return true;

        return false;
    }


    pointInCircleDec(px: number, py: number, cx: number, cy: number, r: number): boolean {
        var dx = px - cx;
        var dy = py - cy;
        return (dx * dx + dy * dy < r * r);
    }

    /**
     * 判断点是否在矩形的边上
     * @param px 待测试点x坐标
     * @param py 待测试点y坐标
     * @param rectx 矩形左上角x坐标
     * @param recty 矩形左上角y坐标
     * @param rectw 矩形宽
     * @param recth 矩形高
     * @param delta 判断时上下浮动范围，相当于矩形线宽
     */
    pointInRectLineDec(px: number, py: number, rectx: number, recty: number, rectw: number, recth: number, delta: number): DirectionType {
        var isInLine = false;
        var point = new Point(px, py);
        var rect1Point1 = new Point(rectx, recty);
        var rect1Point2 = new Point(rectx + delta, recty);
        var rect1Point3 = new Point(rectx + delta, recty + recth);
        var rect1Point4 = new Point(rectx, recty + recth);

        if (this.pointInRecDec(rect1Point1, rect1Point2, rect1Point3, rect1Point4, point)) {
            return DirectionType.left;
        }

        var rect2Point1 = new Point(rectx + rectw - delta, recty);
        var rect2Point2 = new Point(rectx + rectw, recty);
        var rect2Point3 = new Point(rectx + rectw, recty + recth);
        var rect2Point4 = new Point(rectx + rectw - delta, recty + recth);
        if (this.pointInRecDec(rect2Point1, rect2Point2, rect2Point3, rect2Point4, point)) {
            return DirectionType.right;
        }

        var rect3Point1 = new Point(rectx, recty + recth - delta);
        var rect3Point2 = new Point(rectx + rectw, recty + recth - delta);
        var rect3Point3 = new Point(rectx + rectw, recty + recth);
        var rect3Point4 = new Point(rectx, recty + recth);
        if (this.pointInRecDec(rect3Point1, rect3Point2, rect3Point3, rect3Point4, point)) {
            return DirectionType.down;
        }
        var rect4Point1 = new Point(rectx, recty);
        var rect4Point2 = new Point(rectx + rectw, recty);
        var rect4Point3 = new Point(rectx + rectw, recty + delta);
        var rect4Point4 = new Point(rectx, recty + delta);
        if (this.pointInRecDec(rect4Point1, rect4Point2, rect4Point3, rect4Point4, point)) {
            return DirectionType.up;
        }

        return null;
    }

    /**
     * 测试点是否在矩形中
     * @param mp1 矩形顶点1
     * @param mp2 矩形顶点2
     * @param mp3 矩形顶点3
     * @param mp4 矩形顶点4
     * @param mp 待测试点
     */
    pointInRecDec(mp1: Point, mp2: Point, mp3: Point, mp4: Point, mp: Point): boolean {
        var isInRec = false;

        if (this.Multiply(mp, mp1, mp2) * this.Multiply(mp, mp4, mp3) <= 0

            && this.Multiply(mp, mp4, mp1) * this.Multiply(mp, mp3, mp2) <= 0)
            isInRec = true;

        return isInRec;
    }
    // 计算叉乘 |P0P1| × |P0P2|
    private Multiply(p1: Point, p2: Point, p0: Point): number {
        return ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y));
    }


}