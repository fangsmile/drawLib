import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle, RotateConfig, RegionConfig } from "./OptionConfig";
import { CanvasContext } from "../CanvasContext";

// lff Polyline绘制正多边形

    export class RegularPolygon extends Shape {
        className: string = "RegularPolygon";

        nPoints:number;

        startAngle:number;

        constructor(renderStyle: RenderStyle, rotateConfig: RotateConfig = null, regionConfig: RegionConfig = null) {
            super(renderStyle, rotateConfig, regionConfig);
            this.setStartAngle();
        }

        setStartAngle() {

        }

        drawPath(context: CanvasContext) {
            const radius = this.regionConfig.width / 2;
            const centerPoint = new Point(this.regionConfig.x + this.regionConfig.width / 2, this.regionConfig.y + this.regionConfig.height / 2);
            for (let ixVertex = 0;ixVertex <= this.nPoints;++ixVertex) {
                const angle = ixVertex * 2 * Math.PI / this.nPoints - this.startAngle;
                const point = new Point(centerPoint.x + radius * Math.cos(angle), centerPoint.y + radius * Math.sin(angle));
                context.lineTo(point.x, point.y);
            }
        }
    }
