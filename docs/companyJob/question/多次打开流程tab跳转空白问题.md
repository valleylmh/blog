# 多次打开流程tab跳转空白问题

投前项目在查看流程方法viewProcess，有个刷新传参，在跳转tab的方法里面传了参数：extPropInfo: { refresh:true}

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/YdgOkpyVkvzXl4BX/img/f684d67b-3397-4bce-a10f-8342dbd4d549.png)![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/YdgOkpyVkvzXl4BX/img/29fc51f3-fa26-4993-9cde-e168829977c9.png)

加了随机数后的tabId会转化到url上面，最终转换如下图：

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/YdgOkpyVkvzXl4BX/img/1b63d6f3-c39f-4155-aeaf-fe59c38c5e5d.png)

在工程里面default.vue页面，会进行判断更新当前路由视图。

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/YdgOkpyVkvzXl4BX/img/18114000-97ce-40e1-ae1f-254f992409df.png)

解决方案一：

对动态添加的dynamicRoutes进行实时更新，关闭一个tab页签则更新，遍历一下删除；

解决方案二：

对跳转的url或路径path进行处理，加上query传参；