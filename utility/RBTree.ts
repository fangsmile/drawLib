

/**
 * @description 树的节点
 * @author 玄魂
 * 2018-06-12
 */
class TreeNode {

    key: number;
    value: any;
    left: TreeNode;
    right: TreeNode;
    color: nodeColor;
    parent: TreeNode;
    orderedIndex: number;

    constructor(key: any, value: any) {
        this.key = this.toNumber(key);
        this.value = value;
        this.left = null;
        this.right = null;
        this.color = null;
        this.parent = null;
    }
    toNumber(key: any) {

        const offset = 96;
        //if key is not a number
        if (isNaN(key) && typeof key === "string") {
            const keyToLower = key.toLowerCase();
            if (keyToLower.length > 1) {
                let number = '';
                //converting each letter to a number
                for (let ch of keyToLower) {
                    number += ch.charCodeAt(0) - offset + '';
                }
                return parseInt(number);
            }
            return keyToLower.charCodeAt(0) - offset;
        }
        return key;
    }
    /**
    * return Boolean
    */
    isRed() {
        return this.color === nodeColor.RED
    }

    getValue() {
        return {
            key: this.key,
            value: this.value,
        }
    }
}


export enum nodeColor {
    RED = 0,
    BLACK = 1
}

/**
*1）每个结点要么是红的，要么是黑的。  
*2）根结点是黑的。  
*3）每个叶结点（叶结点即指树尾端NIL指针或NULL结点）是黑的。  
*4）如果一个结点是红的，那么它的俩个儿子都是黑的。  
*5）对于任一结点而言，其到叶结点树尾端NIL指针的每一条路径都包含相同数目的黑结点
 */
class RbTree {
    root: TreeNode;

    constructor() {
        this.root = null;
    }

    private createNode(key: any, value: any) {
        let node = new TreeNode(key, value);

        //left leaf has color black. left, right to be nul
        let leftLeaf = new TreeNode(null, null);
        leftLeaf.color = nodeColor.BLACK;
        leftLeaf.left = null;
        leftLeaf.right = null;
        leftLeaf.parent = node;

        //right leaf has color black. left, right to be nul
        let rightLeaf = new TreeNode(null, null);
        rightLeaf.color = nodeColor.BLACK;
        rightLeaf.left = null;
        rightLeaf.right = null;
        rightLeaf.parent = node;

        //map leaves
        node.left = leftLeaf;
        node.right = rightLeaf;
        return node;
    }

    /**
     * find value by node key
     */
    find(input: any) {
        const key = this.toNumber(input);
        let node = this.root;
        while (node != null) {
            if (key < node.key) {
                node = node.left;
            } else if (key > node.key) {
                node = node.right;
            } else {
                return node.value;
            }
        }
        return null;
    }

    leftMostChild(node: TreeNode) {
        if (this.isNilNode(node)) {
            return null;
        }
        while (!this.isNilNode(node.left)) {
            node = node.left;
        }
        return node;
    }

    private findNode(key: any) {
        let node = this.root;
        while (node != null) {
            if (key < node.key) {
                node = node.left;
            } else if (key > node.key) {
                node = node.right;
            } else if (key === node.key) {
                return node;
            } else {
                return null;
            }
        }
        return null;
    }

    /**
     * 输入一个值，返回小于这个值的 最大值的节点
     * @param input 
     */
    findMaxSmaller(input: any): any {
        return this._findMaxSmaller(input, this.root);

    }
    private _findMaxSmaller(input: any, root: TreeNode): any {
        const key = this.toNumber(input);
        let node = root ? root : this.root;
        if (node) {
            //根节点不符合需求直接返回
            if (!node.left && !node.right && node.key >= key) {
                return node.value
            }
            //递归终止条件，没有右子树，或者右子树>搜索值
            if ((node.key <= key && !node.right) ||
                (node.key <= key && node.right.key > key))
                return node.value;
            //向左遍历
            if (node.key >= input) {
                return this._findMaxSmaller(input, node.left);
            }
            else {//向右遍历
                return this._findMaxSmaller(input, node.right);
            }
        }
        return null;

    }
    /**
        * 输入一个值，返回大于这个值的 最小值的节点
        * @param input 
        */
    findleastBigger(input: any): any {
        return this._findleastBigger(input, this.root);

    }

    private _findleastBigger(input: any, root: TreeNode): any {
        const key = this.toNumber(input);
        let node = root ? root : this.root;
        if (node) {
            //根节点不符合需求直接返回
            if (!node.left && !node.right && node.key <= key) {
                return node.value;
            }
            //递归终止条件，没有左子树，或者左子树<搜索值
            if ((node.key >= key && !node.left) ||
                (node.key >= key && node.left.key < key))
                return node.value;
            //向左遍历
            if (node.key >= input) {
                return this._findleastBigger(input, node.left);
            }
            else {//向右遍历
                return this._findleastBigger(input, node.right);
            }
        }
        return null;

    }



    update(key: any, value: any) {
        const node = this.findNode(key);
        node && (node.value = value);
    }

    /**
      * Complexity: O(1).
      *       y                   x
      *      / \                 / \
      *     x  Gamma   ====>   alpha y
      *   /  \                      / \
      * alpha beta               beta Gamma
      * method
      * param Node node Node.
      * return Node
      */
    private rotateRight(node: TreeNode) {
        const y = node.left;

        if (this.isNilNode(y.right)) {
            node.left = this.createLeafNode(node);
        } else {
            node.left = y.right;
        }

        if (!this.isNilNode(y.right)) {
            y.right.parent = node;
        }
        y.parent = node.parent;
        if (this.isNilNode(node.parent)) {
            this.root = y;
        } else {
            if (node === node.parent.right) {
                node.parent.right = y;
            } else {
                node.parent.left = y;
            }
        }
        y.right = node;
        node.parent = y;
    }

    /**
      * Complexity: O(1).
      *       y                   x
      *      / \                 / \
      *     x  Gamma   <====   alpha y
      *   /  \                      / \
      * alpha beta               beta Gamma
      * method
      * param Node node Node.
      * return Node
      */
    private rotateLeft(node: TreeNode) {
        const y = node.right;

        // console.log(y.left)
        if (this.isNilNode(y.left)) {
            node.right = this.createLeafNode(node);
        } else {
            node.right = y.left;
        }

        if (!this.isNilNode(y.left)) {
            y.left.parent = node;
        }
        y.parent = node.parent;
        if (this.isNilNode(node.parent)) {
            this.root = y;
        } else {
            if (node === node.parent.left) {
                node.parent.left = y;
            } else {
                node.parent.right = y;
            }
        }
        y.left = node;
        node.parent = y;
    }
    private createLeafNode(parent: any) {
        let node = new TreeNode(null, null);
        node.color = nodeColor.BLACK;
        node.parent = parent;
        return node;
    }
    /**
      * param Node node Node.
      * Make the color of newly inserted nodes as RED and then perform standard BST insertion
      * If x is root, change color of node as BLACK (Black height +1).
      */
    insert(key: any, value: any) {
        let y = null;
        let x = this.root;
        const z = this.createNode(key, value);
        if (this.root == null) {
            this.root = z;
            z.color = nodeColor.BLACK;
            z.parent = null;
        } else {
            while (!this.isNilNode(x)) {
                y = x;
                if (z.key < x.key) {
                    x = x.left;
                } else {
                    x = x.right;
                }
            }
            z.parent = y;
            // current node parent is root
            if (z.key < y.key) {
                y.left = z;
            } else {
                y.right = z;
            }
            // y.right is now z
            z.left = this.createLeafNode(z);
            z.right = this.createLeafNode(z);
            z.color = nodeColor.RED;
            this.fixTree(z);
        }
    }
    private toNumber(key: any) {

        const offset = 96;
        //if key is not a number
        if (isNaN(key) && typeof key === "string") {
            const keyToLower = key.toLowerCase();
            if (keyToLower.length > 1) {
                let number = '';
                //converting each letter to a number
                for (let ch of keyToLower) {
                    number += ch.charCodeAt(0) - offset + '';
                }
                return parseInt(number);
            }
            return keyToLower.charCodeAt(0) - offset;
        }
        return key;
    }

    isNilNode(node: TreeNode) {
        return node == null || (node.key == null && node.value == null
            && node.color === nodeColor.BLACK
            && node.left == null && node.right == null);
    }
    /**
    * A method to fix RB TREE
    * when uncle is RED
    * Change color of parent and uncle as BLACK.
    * Color of grand parent as RED.
    * Change node = node’s grandparent, repeat steps 2 and 3 for new x.
    * ---------------------------------------------------------------
    * when uncle is BLACK
    * left_left_case
    * left_right_case
    * right_right_case
    * right_left_case
    */

    private fixTree(node: any) {
        while (node.parent != null && node.parent.color === nodeColor.RED) {
            let uncle = null;
            if (node.parent === node.parent.parent.left) {
                uncle = node.parent.parent.right;

                if (uncle != null && uncle.color === nodeColor.RED) {
                    node.parent.color = nodeColor.BLACK;
                    uncle.color = nodeColor.BLACK;
                    node.parent.parent.color = nodeColor.RED;
                    node = node.parent.parent;
                    continue;
                }
                if (node === node.parent.right) {
                    // Double rotation needed
                    node = node.parent;
                    this.rotateLeft(node);
                }
                node.parent.color = nodeColor.BLACK;
                node.parent.parent.color = nodeColor.RED;
                // if the "else if" code hasn't executed, this
                // is a case where we only need a single rotation
                this.rotateRight(node.parent.parent);
            } else {
                uncle = node.parent.parent.left;
                if (uncle != null && uncle.color === nodeColor.RED) {
                    node.parent.color = nodeColor.BLACK;
                    uncle.color = nodeColor.BLACK;
                    node.parent.parent.color = nodeColor.RED;
                    node = node.parent.parent;
                    continue;
                }
                if (node === node.parent.left) {
                    // Double rotation needed
                    node = node.parent;
                    this.rotateRight(node);
                }
                node.parent.color = nodeColor.BLACK;
                node.parent.parent.color = nodeColor.RED;
                // if the "else if" code hasn't executed, this
                // is a case where we only need a single rotation
                this.rotateLeft(node.parent.parent);
            }
        }
        this.root.color = nodeColor.BLACK;
    }

    /**
    * return the height of a tree
    */
    findHeight(node: TreeNode) {
        if (node == null) {
            return -1;
        }
        const leftLen: number = this.findHeight(node.left);
        const rightLen: number = this.findHeight(node.right);

        if (leftLen > rightLen) {
            return leftLen + 1;
        }
        return rightLen + 1;
    }

    /**
    * print out current tree
    */
    print() {
        const height = this.findHeight(this.root) + 1;
        this.printHelper(this.root, '__', height);
    }

    printHelper(node: TreeNode, indent: any, height: number) {
        // tree height
        let treeHeight = height;

        if (node == null) {
            return;
        }
        if (node === this.root) {
            console.log(`${node.key} color: ${node.color}`);
        }
        if (node.left != null) {
            const parentInfo = `( parent node ${node.left.parent.key})`;
            console.log(`${indent}${node.left.key} color: ${node.left.color} ${parentInfo}`);
        }
        if (node.right != null) {
            const parentInfo = `( parent node ${node.right.parent.key})`;
            console.log(`${indent}${node.right.key} color: ${node.right.color} ${parentInfo}`);
        }
        treeHeight -= 1;
        this.printHelper(node.left, indent + indent, treeHeight);
        this.printHelper(node.right, indent + indent, treeHeight);
    }

    /**
    * remove all nodes inside the tree
    */
    emptyTree() {
        this.root = null;
    }

    /**
    * return the min node of a given tree
    */
    min(node: TreeNode): TreeNode {
        if (node == null || node === undefined) {
            return <TreeNode>{};
        }
        while (!this.isNilNode(node.left)) {
            node = node.left;
        }
        return node;
    }

    minNode() {
        let node = this.root;
        while (!this.isNilNode(node.left)) {
            node = node.left;
        }
        return node.getValue();
    }

    maxNode() {
        let node = this.root;
        while (!this.isNilNode(node.right)) {
            node = node.right;
        }
        return node.getValue();
    }

    transplant(u: TreeNode, v: TreeNode) {
        if (u.parent == null) {
            this.root = v;
        } else if (u === u.parent.left) {
            u.parent.left = v;
        } else {
            u.parent.right = v;
        }
        v.parent = u.parent;
    }

    /**
      * method
      * param Node node Node.
      * return Node
      */
    remove(key: any) {
        const z = this.findNode(key);
        if (z == null) {
            return;
        }
        let x;
        let y = z;
        let y_original_color = y.color;
        if (this.isNilNode(z.left)) {
            x = z.right;
            this.transplant(z, z.right);
        } else if (this.isNilNode(z.right)) {
            x = z.left;
            this.transplant(z, z.left);
        } else {
            y = this.min(z.right);
            y_original_color = y.color;
            x = y.right;
            if (y.parent === z) {
                x.parent = y;
            } else {
                this.transplant(y, y.right);
                y.right = z.right;
                y.right.parent = y;
            }
            this.transplant(z, y);
            y.left = z.left;
            y.left.parent = y;
            y.color = z.color;
        }
        if (y_original_color === nodeColor.BLACK) {
            this.removeFix(x);
        }
    }

    /**
     * a method to fix remove key
     */
    private removeFix(node: TreeNode) {
        while (node !== this.root && node.color === nodeColor.BLACK) {
            if (node === node.parent.left) {
                let w = node.parent.right;
                if (w.color === nodeColor.RED) {
                    w.color = nodeColor.BLACK;
                    node.parent.color = nodeColor.RED;
                    this.rotateLeft(node.parent);
                    w = node.parent.right;
                }
                if (w.left.color === nodeColor.BLACK && w.right.color === nodeColor.BLACK) {
                    w.color = nodeColor.RED;
                    node = node.parent;
                    continue;
                } else if (w.right.color === nodeColor.BLACK) {
                    w.left.color = nodeColor.BLACK;
                    w.color = nodeColor.RED;
                    w = node.parent.right;
                }
                if (w.right.color === nodeColor.RED) {
                    w.color = node.parent.color;
                    node.parent.color = nodeColor.BLACK;
                    w.right.color = nodeColor.BLACK;
                    this.rotateLeft(node.parent);
                    node = this.root;
                }
            } else {
                let w = node.parent.left;
                if (w.color === nodeColor.RED) {
                    w.color = nodeColor.BLACK;
                    node.parent.color = nodeColor.RED;
                    this.rotateRight(node.parent);
                    w = node.parent.left;
                }
                if (w.right.color === nodeColor.BLACK && w.left.color === nodeColor.BLACK) {
                    w.color = nodeColor.RED;
                    node = node.parent;
                } else if (w.left.color === nodeColor.BLACK) {
                    w.right.color = nodeColor.BLACK;
                    w.color = nodeColor.RED;
                    this.rotateLeft(w);
                    w = node.parent.left;
                }
                if (w.left.color === nodeColor.RED) {
                    w.color = node.parent.color;
                    node.parent.color = nodeColor.BLACK;
                    w.left.color = nodeColor.BLACK;
                    this.rotateRight(node.parent);
                    node = this.root;
                }
            }
        }
        node.color = nodeColor.BLACK;
    }

    inOrderSucc(node: TreeNode) {
        if (this.isNilNode(node)) {
            return null;
        }
        // when a right child exist
        if (!this.isNilNode(node.right)) {
            return this.leftMostChild(node.right).getValue();

            // Where no right child exists
        } else { // eslint-disable-line
            let curr = node;
            let p = node.parent;
            // if this node is not its parent's left child
            while (p != null && p.left !== curr) {
                curr = p;
                p = p.parent;
            }
            // when there is no successor
            if (p == null) {
                return null;
            }
            return p.getValue();
        }
    }

    toSortedArray() {
        const sortedArray: Array<any> = [];
        this.inOrder(this.root, sortedArray);
        return sortedArray;
    }

    toArrayPreOrder() {
        const preOrderArray: Array<any> = [];
        this.preOrder(this.root, preOrderArray);
        return preOrderArray;
    }

    toArrayPostOrder() {
        const postOrderArray: Array<any> = [];
        this.postOrder(this.root, postOrderArray);
        return postOrderArray;
    }
    /**
     * 中序遍历
     * @param node 
     * @param array 
     */
    private inOrder(node: TreeNode, array: Array<any>) {
        if (this.isNilNode(node)) {
            return;
        }
        this.inOrder(node.left, array);
        array.push(node.getValue());
        this.inOrder(node.right, array);
    }
    /**
     * 前序遍历
     * @param node 
     * @param array 
     */
    private preOrder(node: TreeNode, array: Array<any>) {
        if (this.isNilNode(node)) {
            return;
        }
        array.push(node.getValue());
        this.preOrder(node.left, array);
        this.preOrder(node.right, array);
    }

    /**
     * 后序遍历
     * @param node 
     * @param array 
     */
    private postOrder(node: TreeNode, array: Array<any>) {
        if (this.isNilNode(node)) {
            return;
        }
        this.postOrder(node.left, array);
        this.postOrder(node.right, array);
        array.push(node.getValue());
    }

    createIterator() {
        return new iterator(this.root);
    }

}

class iterator {
    stack: Array<any>;
    curr: TreeNode;

    constructor(root: TreeNode) {
        this.stack = [];
        this.curr = root;
    }
    isNilNode(node: TreeNode) {
        return node == null || (node.key == null && node.value == null
            && node.color === nodeColor.BLACK
            && node.left == null && node.right == null);
    }
    hasNext() {
        return !this.isNilNode(this.curr) || this.stack.length > 0;
    }

    next() {
        while (!this.isNilNode(this.curr)) {
            this.stack.push(this.curr);
            this.curr = this.curr.left;
        }
        this.curr = this.stack.pop();
        const node = this.curr;
        this.curr = this.curr.right;
        return node.getValue();
    }
}
export default RbTree;