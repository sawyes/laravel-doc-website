# varnish

- [安装](#install)
- [varnish params](#varnish-params)
- [存储对象](#storage)

<a name='install'></a>
## 安装

[varnish官方网站](https://www.varnish-software.com/)

```
yum -y install epel-release
yum info varnish
yum -y install varnish
```

从安装的库中看见了`jemalloc`库, varnish正是利用该库完成高效的内存申请,分配和回收操作

常见的内存分配回收方式有`malloc`,`free`

<a name="varnish-params"></a>
## varnish params

`rpm -ql varnish`查看/usr/lib/systemd/system/varnish.service 服务启动定义,

```
...
EnvironmentFile=/etc/varnish/varnish.params

...
ExecStart=/usr/sbin/varnishd \
	-P /var/run/varnish.pid \
	-f $VARNISH_VCL_CONF \
	-a ${VARNISH_LISTEN_ADDRESS}:${VARNISH_LISTEN_PORT} \
	-T ${VARNISH_ADMIN_LISTEN_ADDRESS}:${VARNISH_ADMIN_LISTEN_PORT} \
	-S $VARNISH_SECRET_FILE \
	-u $VARNISH_USER -g $VARNISH_GROUP \
	-s $VARNISH_STORAGE \
	$DAEMON_OPTS
```

可以看到,程序启动大量使用了params的定义,后续可以通过修改该文件达到调优的效果

<a name="storage"></a>
## 存储对象

varnish 存储对象共有3种方式

* file:所有缓存对象都存储到单个文件中,不支持持久机制
* malloc: 内存缓存,高性能,随着运行时间增多内存碎片变大,小内存管理性能更优
* persistent: 基于文件实现持久存储, 性能低, 也尽量不使用


persistent模式下varnish服务器对于CPU性能要求不高, 磁盘IO性能要求更高, 因而建议使用固态硬盘

<a name='varnishd'></a>
## varnishd

帮助
```
man varnishd

-s 指定存储方式(存储对象)
```

查看varnish的服务监听端口以及管理端口`/etc/varnish/varnish.params` 

```
VARNISH_LISTEN_PORT=6081
...
VARNISH_ADMIN_LISTEN_PORT=6082
...
VARNISH_STORAGE="malloc,256M"
```

