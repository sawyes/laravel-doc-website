# varnish

- [安装](#install)
- [varnish配置](#varnish-config)
    - [varnish params](#varnish-params)
    - [default acl](#varnish-acl)
    - [存储对象](#storage)
    - [存储对象](#storage)
    - [varnishd](#varnishd)
- [简单场景应用](#simple)


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

<a name="varnish-config"></a>
### varnish配置文件

默认路径`/etc/varnish`

`rpm -ql varnish`查看/usr/lib/systemd/system/varnish.service 服务启动定义,

* /usr/lib/systemd/system/varnish.service
* /usr/lib/systemd/system/varnishlog.service
* /usr/lib/systemd/system/varnishncsa.service


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

<a name="varnish-params"></a>
### varnish params

> 由此服务文件理解varnish的启动过程是非常重要的

具体配置可以参考`/etc/varnish/varnish.params`,下面为默认值
```
egrep -v "#|^$" varnish.params

RELOAD_VCL=1
VARNISH_VCL_CONF=/etc/varnish/default.vcl
VARNISH_LISTEN_PORT=6081
VARNISH_ADMIN_LISTEN_ADDRESS=127.0.0.1
VARNISH_ADMIN_LISTEN_PORT=6082
VARNISH_SECRET_FILE=/etc/varnish/secret
VARNISH_STORAGE="malloc,256M"
VARNISH_USER=varnish
VARNISH_GROUP=varnish

```

通常6081为默认监听端口,需要改为80, 管理端口6082, malloc内存分配为256M, 根据服务器情况可以适当调整

<a name="varnish-acl"></a>
### default acl

由上述配置引出default acl, 第一段为版本声明,其后为sub段

* backend, 定义后端主机

```
vcl 4.0;
backend default {
    .host = "127.0.0.1";
    .port = "8080";
}
sub vcl_recv {
}
sub vcl_backend_response {
}
sub vcl_deliver {
}

```


<a name="storage"></a>
### 存储对象

varnish 存储对象共有3种方式

* file:所有缓存对象都存储到单个文件中,不支持持久机制
* malloc: 内存缓存,高性能,随着运行时间增多内存碎片变大,小内存管理性能更优
* persistent: 基于文件实现持久存储, 性能低, 也尽量不使用

persistent模式下varnish服务器对于CPU性能要求不高, 磁盘IO性能要求更高, 因而建议使用固态硬盘

> 现在varnish默认会使用内存malloc方式256M, 查看/etc/varnish/varnish.param

<a name='varnishd'></a>
### varnishd

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

### 配置varnish的三种应用

* varnish应用程序的命令行参数

监听的socket配置, 使用使用的存储类型等,额外配置参数
```
-p param=value
-r param,paramm 只读参数
```

* -p选项指明的参数

运行时参数: 可在程序进程或线程**运行中**, 通过CLI进行配置

* vcl: 配置缓存系统的缓存机制,先便宜,后应用,依赖于C编译器(GCC编译器)

<a name='simple'></a>
## 简单场景应用

varnish 192.168.255.116.11
httpd 192.168.255.116.12

varnish
```
# 安装varnish
yum -y install varnish

# 指定后端服务主机
vim /etc/varnish/default.vcl
backend default {
    .host = "192.168.116.12";
    .port = "80";
}

# 修改varnish监听端口
vim /etc/varnish/default.vcl
VARNISH_LISTEN_PORT=80

systemctl start varnish.service

ss -tnl |egrep  "6081|6082"
```

httpd
```
yum -y install httpd

## to make test page
for i in {1..10};do echo "Page $i on server 116.12" > /var/www/html/$i.html;done;

systemctl start httpd.service
systemctl enable httpd.service
systemctl is-enabled httpd.service
```



















