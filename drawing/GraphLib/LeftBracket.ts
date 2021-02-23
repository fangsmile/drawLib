import { Shape } from "./Shape";
import { RenderStyle, RotateConfig, RegionConfig } from "./OptionConfig";
import { CanvasContext } from "../CanvasContext";

// 使用Path类就可以了，Line可以去除
export class LeftBracket extends Shape {
    className: string = "LeftBracket";

    constructor(renderStyle: RenderStyle, rotateConfig: RotateConfig = null, regionConfig: RegionConfig = null, colorKey:string = null) {
        super(renderStyle, rotateConfig, regionConfig, colorKey);
    }

    drawPath(ctx: CanvasContext) {
        const r = this.regionConfig.height / 10;

        ctx.arc(this.regionConfig.x + r, this.regionConfig.y + r, r, 1.5 * Math.PI, Math.PI, true);
        ctx.arc(this.regionConfig.x - r, this.regionConfig.y + this.regionConfig.height / 2 - r, r, 0, 0.5 * Math.PI, false);

        ctx.arc(this.regionConfig.x - r, this.regionConfig.y + this.regionConfig.height / 2 + r, r, 1.5 * Math.PI, 2 * Math.PI, false);
        ctx.arc(this.regionConfig.x + r, this.regionConfig.y + this.regionConfig.height - r, r, Math.PI, 0.5 * Math.PI, true);
    }

    getPointRange() {
        const r = this.regionConfig.height / 10;
        return {
            minX: this.regionConfig.x - r,
            maxX: this.regionConfig.x + r,
            minY: this.regionConfig.y,
            maxY: this.regionConfig.y + this.regionConfig.height
        }
    }
}
