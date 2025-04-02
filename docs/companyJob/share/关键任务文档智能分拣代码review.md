# 关键任务文档智能分拣代码review

先引出两个问题

1、如何实现操作的图标即下载和删除，放在最前面？

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/Q35O85XZmpEZgl9V/img/8b8d58f9-4086-4520-b6f1-4054437d5fe7.png)

2、如何实现下图中红框区域始终保持可拖拽可点击上传？

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/Q35O85XZmpEZgl9V/img/39b106ce-7cb8-45f9-aa1f-797a5cf65bd6.png)

3、如何解决多次弹窗出现阴影重叠问题？

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/Q35O85XZmpEZgl9V/img/caaaf490-71e6-41b8-8287-30c1384e982f.png)

4、如何实现点击上一步，把维护的文件数据不丢失？

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/Q35O85XZmpEZgl9V/img/5e025a23-9232-4344-97e2-170cf4a7dbf1.png)

带着上面的问题开始代码讲解：

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/Q35O85XZmpEZgl9V/img/53050deb-31b8-4cc0-b731-3ca2338d99d6.png)