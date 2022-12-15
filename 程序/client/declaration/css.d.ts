interface VCSSStyleDeclaration {
    /** 水平居中 */
    verticalAlign: 'top' | 'center' | 'bottom' | null;

    /** 垂直居中 */
    horizontalAlign: 'left' | 'center' | 'right' | null;

    /**
     * 指定如何处理溢出面板可用空间的内容。 可能的值：
     * "squish" - 如果需要，孩子会被压扁以适应面板的边界（默认）
     * "clip"   - 孩子们保持他们想要的大小，但他们的内容被剪掉了
     * "scroll" - 孩子们保持他们想要的大小，并且一个滚动条被添加到这个面板
     *
     * 例子:
     * overflow: squish squish; // 在水平和垂直方向挤压内容
     * overflow: squish scroll; // 在 Y 方向滚动内容
     */
    overflow: 'squish' | 'clip' | 'scroll' | string | null;
}
