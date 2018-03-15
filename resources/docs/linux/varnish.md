# varnish

- [安装](#install)
- [varnish配置](#varnish-config)
    - [varnish params](#varnish-params)
    - [default acl](#varnish-acl)
    - [存储对象](#storage)
    - [存储对象](#storage)
    - [varnishd](#varnishd)
- [简单场景应用](#simple)
- [varnishstat](#varnishstat)
- [varnishadm](#varnishadm)
- [varnishlog & varnishncsa](#varnishlog)
- [varnishtop](#varnishtop)


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

`rpm -ql varnish`查看/usr/lib/systemd/system/varnish.service 服务启动定义, 共有3个varnish服务

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

浏览器测试页面, 可以清晰看见返回头信息包含varnish


<a name='varnishstat'></a>
## varnishstat

比如上述环境中, 查看命中率是检验缓存的最好方式

`varnishstat`

<a name='varnishadm'></a>
## varnishadm

varnishadm 是varnish管理工具, 默认配置`/etc/varnish/varnish.param`定义了管理端口的IP:port

```
# 连接
varnishadm -S /etc/varnish/secret -T 127.0.0.1:6082

输出如下,交互界面
200        
-----------------------------
Varnish Cache CLI 1.0
-----------------------------
Linux,3.10.0-514.el7.x86_64,x86_64,-smalloc,-smalloc,-hcritbit
varnish-4.0.5 revision 07eff4c29

Type 'help' for command list.
Type 'quit' to close CLI session.
```

其中help为命令列表

* ping

健康状态检测
```
ping
200        
PONG 1521124900 1.0

```
* state
子进程运行状态
```
state
200        
Child in state running
```

* vcl

vcl.load <configname> <filename>

vcl.inline <configname> <quoted_VCLstring>

vcl.use <configname>

vcl.discard <configname>

vcl.list

```
vcl.list
200        
active          0 boot
```

boot 是 configname, filename需要编译为config

编译VCL`/etc/varnish/default.vcl`

```
# 连接
varnishadm -S /etc/varnish/secret -T 127.0.0.1:6082

vcl.load test default.vcl
vcl.list
200        
active          0 boot
available       0 test
```

active 正在使用

available  可用

使用vcl, 通过vcl.use  动态加载编译文件
```
vcl.use test
200        
VCL 'test' now active
vcl.list
200        
available       0 boot
active          0 test

```

vcl.show 可以查看编译后配置文件内容

```
vcl.show test
```


* param

`param.show` (`param.show -l`)显示varninsh的运行param, 如线程池个数,超时等配置

设置param, 如: 变更线程池为4个

```
param.set thread_pools 4
param.show thread_pools
```

* panic

panic(恐慌),一旦出现说明程序可能要挂了(内存耗尽等)

查看panic信息
```
panic.show 
```


* backend

查看后端应用列表以及健康状态, `no probe`表示未启用检测

```
backend.list
200        
Backend name                   Refs   Admin      Probe
default(192.168.116.12,,80)    2      probe      Healthy (no probe)

```

* ban

清理缓存中的缓存对象

查看ban列表
```
ban.list
200        
Present bans:
1521122130.045767     0    req.http.host == 192.168.116.12
```

清理主机所有缓存
```
ban req.http.host ~ 192*
200
ban req.http.host ~ 192.168.116.12
200
```

此时再通过varnishstat观察命中情况,发现缓存清理已经生效(命中丢失)

<a name='varnishlog'></a>
## varnishlog & varnishncsa

运行`varnishlog`, 然后刷新请求页面,即可返回日志信息

```
*   << Request  >> 32802     
-   Begin          req 32801 rxreq
-   Timestamp      Start: 1521132646.993728 0.000000 0.000000
-   Timestamp      Req: 1521132646.993728 0.000000 0.000000
-   ReqStart       192.168.116.1 62404
-   ReqMethod      GET
-   ReqURL         /3.html
-   ReqProtocol    HTTP/1.1
-   ReqHeader      Host: 192.168.116.11
-   ReqHeader      Connection: keep-alive
-   ReqHeader      Cache-Control: max-age=0
-   ReqHeader      Upgrade-Insecure-Requests: 1
-   ReqHeader      User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36
-   ReqHeader      Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
-   ReqHeader      Accept-Encoding: gzip, deflate
-   ReqHeader      Accept-Language: zh-CN,zh;q=0.9
-   ReqHeader      If-None-Match: "18-5674eb9d49b9d"
-   ReqHeader      If-Modified-Since: Tue, 13 Mar 2018 17:38:26 GMT
-   ReqHeader      X-Forwarded-For: 192.168.116.1
-   VCL_call       RECV
-   VCL_return     hash
-   ReqUnset       Accept-Encoding: gzip, deflate
-   ReqHeader      Accept-Encoding: gzip
-   VCL_call       HASH
-   VCL_return     lookup
-   Hit            200
-   VCL_call       HIT
-   VCL_return     deliver
-   RespProtocol   HTTP/1.1
-   RespStatus     200
-   RespReason     OK
-   RespHeader     Date: Thu, 15 Mar 2018 16:49:40 GMT
-   RespHeader     Server: Apache/2.4.6 (CentOS)
-   RespHeader     Last-Modified: Tue, 13 Mar 2018 17:38:26 GMT
-   RespHeader     ETag: "18-5674eb9d49b9d"
-   RespHeader     Content-Length: 24
-   RespHeader     Content-Type: text/html; charset=UTF-8
-   RespHeader     X-Varnish: 32802 200
-   RespHeader     Age: 67
-   RespHeader     Via: 1.1 varnish-v4
-   VCL_call       DELIVER
-   VCL_return     deliver
-   Timestamp      Process: 1521132646.993773 0.000045 0.000045
-   RespProtocol   HTTP/1.1
-   RespStatus     304
-   RespReason     Not Modified
-   RespReason     Not Modified
-   RespUnset      Content-Length: 24
-   Debug          "RES_MODE 0"
-   RespHeader     Connection: keep-alive
-   Timestamp      Resp: 1521132646.993827 0.000099 0.000055
-   Debug          "XXX REF 2"
-   ReqAcct        499 0 499 285 0 285
-   End            

*   << Session  >> 32801     
-   Begin          sess 0 HTTP/1
-   SessOpen       192.168.116.1 62404 :80 192.168.116.11 80 1521132646.993499 16
-   Link           req 32802 rxreq
-   SessClose      RX_TIMEOUT 5.045
-   End            


```

varnishncsa 另一种日志记录方式
```
192.168.116.1 - - [16/Mar/2018:01:06:01 +0800] "GET http://192.168.116.11/3.html HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"

```


<a name='varnishtop'></a>
## varnishtop

varnishtop - Varnish log entry ranking

并发场景中,观看平均请求各个指标排名,可以了解varnish性能等


















