export class RenderStyle {
    isFill: boolean = true;

    isStroke: boolean = true;

    fillColor: string = "rgba(255, 255, 255, 0.1)";

    strokeColor: string = "rgba(102,102,102,1)";

    lineWidth: number = 10;

    isClosePath: boolean = true;

    lineDash: Array<number> = [];// 虚线需要设置，如[10, 15];

    lineJoin: string = 'miter';// 转折的时候尖角

    lineCap: string = "butt";

    constructor(isFill: boolean = true,
        isStroke: boolean = true,
        fillColor: string = "rgba(255, 255, 255, 0.1)",
        strokeColor: string = "rgba(102,102,102,1)",
        lineWidth: number = 2,
        isClosePath: boolean = true,
        lineDash: Array<number> = [], // 虚线需要设置，如[10, 15];
        lineJoin: string = 'round', // 产品要求改为圆角
        lineCap: string = "butt",
    ) {
        this.isFill = isFill;
        this.isStroke = isStroke;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.lineDash = lineDash || [];
        this.lineJoin = lineJoin || 'miter';
        this.lineCap = lineCap || "butt";
        this.isClosePath = isClosePath;
    }
}
export class RotateConfig {
    rotateDegree: number = 0;

    rotateCenterX: number = 0;

    rotateCenterY: number = 0;

    isDefineRotateCenter: boolean = false;
}
export class RegionConfig {
    x: number = 0;

    y: number = 0;

    width: number = 0;

    height: number = 0;

    initedScale: number = 1;// 添加到画布时的画布scale

    constructor(x: number = 0,
        y: number = 0,
        width: number = 0,
        height: number = 0, initedScale: number = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.initedScale = initedScale;
    }
}
// 练习格格式配置
export class LianXiGeConfig {
    gridWidth: number;// 小方格宽高

    gridHeight: number;

    lineWidth: number;// 线宽

    lineColor: string;// 线颜色

    dashLineWidth: number;// 虚线线宽

    dashLineColor: string;// 虚线颜色

    lineSpace: number;// 行间距

    innerLineHeight: number;// 三线格内部行高

    lineWidth2: number;// 四线三格其中的一个线粗

    constructor(gridWidth: number, gridHeight: number, lineWidth: number, lineColor: string,
        dashLineWidth:number, dashLineColor: string = "", lineSpace: number = null, innerLineHeight: number = null, lineWidth2: number = null) {
        this.gridHeight = gridHeight;
        this.gridWidth = gridWidth;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.dashLineWidth = dashLineWidth;
        this.dashLineColor = dashLineColor;
        this.lineSpace = lineSpace;
        this.innerLineHeight = innerLineHeight;
        this.lineWidth2 = lineWidth2;
    }
}
