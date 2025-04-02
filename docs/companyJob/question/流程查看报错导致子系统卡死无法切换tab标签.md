# 流程查看报错导致子系统卡死无法切换tab标签

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/MAeqxYEk220KO8j9/img/2b220f56-4a8c-4200-826e-d61e74d6a06c.png)

关掉查看流程，迟迟打不开项目综合信息页面。

如打开投后项目 yu债权26，查看流程里面第一个。

从早上到晚上，几乎大多数时间在排查在定位问题。上午排查定位到了要素规则会影响页面卡死，结果用分析工具，内存和性能上并没有发生变化。转而从一个个要素设置 ext\_config里面的 hidden:true，来一个个排查要素到底哪出问题了。用了一上午时间定位到了是产品类型细分要素 project\_sub\_type\_1 出了问题，并不是要素本身渲染出问题，而是要素联动规则出了问题。

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/MAeqxYEk220KO8j9/img/251a1dd2-34a5-4a63-b00d-ab52b98d8a8b.png)

经过云外本地跑了工程，定位代码并调试，最终在 \_initCompInfo 方法和 \_generateCompInfo 方法里面修改了 factor.ext\_config = {} 这行代码。将defaultConfig和ext\_config做了深拷贝。

晚上继续追查，应该是联动规则的锅。去掉下面的规则，打开流程不报错可以正常关闭切换标签。

![image.png](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/MAeqxYEk220KO8j9/img/3d4094b8-4487-47a0-991f-d28f6ec686c4.png)

再接着看了该要素为数据字典下拉框，把realItemData打印出来一看，竟然有重复的value值，最终根本原因查出来了。在数据字典设置页面维护一下，删除了重复的选项就解决了。

最终不得不说排查了一天，解决问题却不要一分钟。必须要积累这样的经验，记录排查问题的场景思路。