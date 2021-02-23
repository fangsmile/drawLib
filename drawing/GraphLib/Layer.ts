import { CanvasContext } from "../CanvasContext";
import { Container } from "./Container";
import { Point } from "./Point";
import { XlMath } from "./XlMath";
import { GraphLib } from "./GraphLib";

export class Layer extends Container {
    type: string = "Layer";
    // groups: Array<Group> = null;
    canvas: HTMLCanvasElement;
    hitCanvas: HTMLCanvasElement;
    canvasContext: CanvasContext;
    hitCanvasContext: CanvasContext;
    scale: number = 1;
    id: string = null;
    // children: Array<any> = new Array<any>();
    // parent: any = null;//添加到group或者层 child.parent = this;
    constructor(id: string = null) {
        super()
        this.canvas = document.createElement("canvas");
        this.hitCanvas = document.createElement("canvas");
        if (id) {
            this.id = id;
            this.canvas.dataset[id] = id;
            this.hitCanvas.dataset[id] = "hit_" + id;
        }
        this.canvasContext = new CanvasContext(this.canvas);
        this.hitCanvasContext = new CanvasContext(this.hitCanvas);
    }
    setAttribute(attr:string,attrVale:string){
        (<any>this.canvas.style)[attr]=attrVale;
    }
    //绘制该层上所有内容
    draw(canvasContext: any = null, hitCanvasContext: any = null, isThumb: boolean = false) {
        this.clearContext();
        this.children.forEach(obj => {
            obj.draw(this.canvasContext, this.hitCanvasContext, isThumb);
        })
    }
    scaleCanvas(scale: number, p: Point = null) {
        this.scale *= scale;
        if (p) {
            this.canvasContext.scalePoint(scale, scale, p.x, p.y);
            this.hitCanvasContext.scalePoint(scale, scale, p.x, p.y);
        } else {
            this.canvasContext.scale(scale, scale);
            this.hitCanvasContext.scale(scale, scale);
        }
    }
    translateCanvas(diffX: number, diffY: number) {
        this.canvasContext.translate(diffX, diffY);
        this.hitCanvasContext.translate(diffX, diffY);
    }
    clearContext() {
        this.canvasContext.clear()
        this.hitCanvasContext.clear()
    }

    /**
        * destroy layer
        * @method
        * @memberof Konva.Stage.prototype
        */
    removeSelf() {
        this.parent.container.removeChild(this.canvas);
        this.parent.container.removeChild(this.hitCanvas);
        super.removeSelf();

        return this;
    }
    // add(obj: any) {
    //     if (this == obj) {
    //         console.error("can not add yourself !")
    //         return false;
    //     }
    //     if (obj.type == "Group" || obj.type == "Shape") {
    //         this.children.push(obj);
    //         obj.index = this.children.length - 1;
    //         obj.setParent(this);
    //     } else {
    //         console.error("You may only add groups and shapes to a Layer.")
    //     }
    // }
    // setParent(parent: any) {
    //     this.parent = parent;
    // }
    validateAdd(child: any) {
        if (child.type !== "Group" && child.type !== "Shape" && child.type != 'text') {
            console.error("You may only add groups and shapes to a Layer.")
            return false;
        }
        return true;
    }
    /* var shape = layer.getSelected({x: 50, y: 50});
    *  or if you interested in shape parent:
    * var group = layer.getSelected({x: 50, y: 50}, 'Group');
    * var layer = layer.getSelected({x: 50, y: 50}, 'Layer');
    */
    getSelected(pos: Point, selector: string = "Shape") {
        var shape = this._getSelected(new Point(pos.x, pos.y));
        if (shape && shape.type == "text") {
            return shape;
        } else
            if (shape && selector) {
                return shape.findAncestor(selector, true);
            } else if (shape) {
                return shape;
            }
    }
    _getSelected(pos: Point) {
        var colorKey = XlMath.getColorKey({ x: pos.x, y: pos.y }, <any>this.hitCanvasContext);
        return GraphLib.shapes[colorKey];
    }
    setIndex(index: number) {
        super.setIndex(index);
        var stage = this.getParent();
        if (stage) {
            stage.container.removeChild(this.canvas);

            if (index < stage.getChildren().length - 1) {
                stage.container.insertBefore(
                    this.canvas,
                    stage.getChildren()[index + 1].canvas
                );
            } else {
                stage.container.appendChild(this.canvas);
            }
        }
        return this;
    }

    moveUp() {
        var moved = super.moveUp();
        if (!moved) {
            return this;
        }
        var stage = this.getParent();
        if (!stage) {
            return this;
        }
        stage.container.removeChild(this.canvas);

        if (this.index < stage.getChildren().length - 1) {
            stage.container.insertBefore(
                this.canvas,
                stage.getChildren()[this.index + 1].getCanvas()._canvas
            );
        } else {
            stage.container.appendChild(this.canvas);
        }
        return this;
    }
    moveDown() {
        if (super.moveDown()) {
            var stage = this.getParent();
            if (stage) {
                var children = stage.getChildren();
                stage.container.removeChild(this.canvas);
                stage.container.insertBefore(
                    this.canvas,
                    children[this.index + 1].getCanvas()._canvas
                );
            }
        }
        return this;
    }

    moveToBottom() {
        if (super.moveToBottom()) {
            var stage = this.getParent();
            if (stage) {
                var children = stage.getChildren();
                stage.container.removeChild(this.canvas);
                stage.container.insertBefore(
                    this.canvas,
                    children[1].getCanvas()._canvas
                );
            }
        }
        return this;
    }
    hide() {
        this.canvas.style.display = "none";
    }
    show() {
        this.canvas.style.display = "block";
    }
    /**
     * minX: rect.minX,
            maxX: rect.maxX,
            minY: rect.minY,
            maxY: rect.maxY
     */
    getChildrensMaxMinPoints(isNeedTransform: boolean = true, isFileterText: boolean = true, childrens: Array<any> = this.children) {
        // isNeedTransform是否转换回屏幕原生坐标;  isFileterText 是否过滤边长的文字（也占大小）
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let length = childrens.length;
        for (let i = 0; i < length; i++) {
            let item = childrens[i];
            if (isFileterText && item.className == "Text") continue;
            // if (item.className == "Line" && (item.viewType == LineType.TangentLine || item.viewType == LineType.VerticalLine)) { continue }//不应该调用上层类，childrens对象已在上层添加过滤
            if (item.getPointRange) {
                let rectBox = item.getPointRange();
                minX = Math.min(rectBox.minX, minX);
                minY = Math.min(rectBox.minY, minY);
                maxX = Math.max(rectBox.maxX, maxX);
                maxY = Math.max(rectBox.maxY, maxY);
            }
        }
        minX -= 15 / this.canvasContext.scaleVal;
        minY -= 15 / this.canvasContext.scaleVal;
        maxX += 15 / this.canvasContext.scaleVal;
        maxY += 15 / this.canvasContext.scaleVal;
        let point1: Point, point2: Point;
        if (isNeedTransform) {
            point1 = this.canvasContext.transformPoint2(minX, minY)
            point2 = this.canvasContext.transformPoint2(maxX, maxY);
        } else {
            point1 = new Point(minX, minY)
            point2 = new Point(maxX, maxY);
        }

        return [point1, point2];
    }
}