# flex布局下分栏区域支持拖拽拉伸

支持左侧文档类型树区域拉伸，需求背景是类型名称较长，客户不想拖拉底部的滚动条查看，想着可以拖拽拉伸文档类型树区域查看。

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/3M0OzebK6A8NLqze/img/1868367c-b777-46a8-b4a3-06aa17484bb6)

方案一：

使用JS监听鼠标事件 mouseup, mousemove, mousedown 3个事件记录鼠标的坐标距离。继而将x轴横坐标距离当做要加宽的数值，赋给左侧文档类型树DIV区域的宽度。

```javascript
const handleMouseMove = (e) => {
  // 处理鼠标移动事件的逻辑
};

document.addEventListener("mousemove", handleMouseMove);

// 当需要销毁监听时
document.removeEventListener("mousemove", handleMouseMove);
```

方案二（推荐）：

使用css属性实现

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/3M0OzebK6A8NLqze/img/92f76b1f-7031-499b-8c4b-9c2726b110b0.png)![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/3M0OzebK6A8NLqze/img/2e684e7d-92d3-449a-bfd7-c03127a03f77.png)

参考链接： [css实现可拉伸调整尺寸分栏；通过js也可以实现](https://segmentfault.com/a/1190000042006775)