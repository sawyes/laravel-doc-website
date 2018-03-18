# nginx

- [安装](#install)
    - [编译安装](#configure)
    - [开机启动](#start-on)
    - [yum](#yum)
    - [启动](#start)
- [头部定义](#header)
    - [worker_processes](#worker_processes)
    - [worker_rlimit_nofile](#worker_rlimit_nofile)
- [server](#server)    
- [http](#http)
    - [keepalive_timeout](#keepalive_timeout)
    - [log_format](#log_format)
    - [upstream](#upstream)
    - [proxy](#proxy)
    - [gzip压缩配置](#gzip)
    - [sendfile调优](#sendfile)
- [pcre匹配模式](#pcre)
- [location](#location)
    - [缓存](#cache)
    - [http_user_agent](#http_user_agent)
    - [client_max_body_size](#client_max_body_size)
    - [error_log](#error_log)
- [403](#403)


[官方配置指南](https://nginx.org/en/docs/)
[官方配置样例](https://www.nginx.com/resources/wiki/start/topics/examples/fullexample2/)
[echo模块下载地址](https://github.com/openresty/echo-nginx-module/tags)


<a name='install'></a>
## 安装

NGINX开源主线和稳定版本都可以通过两种方式安装：

* 从一个预先建立的包。这是一个安装NGINX开源软件的快捷方式。该软件包几乎涵盖了所有的NGINX官方模块，可用于大多数流行的操作系统。有关详细信息，请参阅[安装预建包](https://www.nginx.com/resources/admin-guide/installing-nginx-open-source/#prebuilt)。

* 从源头上编译。这种方式更加灵活：您可以添加特定的模块，包括第三方模块或应用最新的安全补丁。有关详细信息，请参阅[编译和从源安装](https://www.nginx.com/resources/admin-guide/installing-nginx-open-source/#sources)。

安装预制安装支持以下系统

* RedHat/Centos
* Ubuntu
* Debian
* SUSE

<a name='configure'></a>
### 编译安装

安装NGINX依赖关系, 详细看官网介绍
    
    yum -y install epel-release
    yum -y install wget gcc gcc-c++ autoconf automake perl perl-devel perl-ExtUtils-Embed zlib zlib-devel openssl openssl-devel  gd-devel libxslt-devel

选择安装第三方echo模块, 不过需要注意的是nginx版本需要和echo模块匹配, 否则可能**编译报错**

    wget https://github.com/openresty/echo-nginx-module/archive/v0.61.tar.gz
    tar zxvf v0.61.tar.gz

下载来源如: ` ningx 1.12.2`, 一般而言, 你需要下载一个[稳定版](http://nginx.org/en/download.html)

    wget http://nginx.org/download/nginx-1.12.2.tar.gz
    tar zxf nginx-1.12.2.tar.gz
    cd nginx-1.12.2
    
    第三方扩展模块可以解压在任意路径, 但是编译前需要指定正确的path
    ├── echo-nginx-module-0.61
    ├── nginx-1.12.2
    ├── nginx-1.12.2.tar.gz
    └── v0.61.tar.gz


配置生成选项前, 你应该懂得如何查看可以配置的选项, 这个也是编译安装的优势, 进入nginx解压目录

    ./configure --help

模块选择, 注意最后一行`echo`模块是选择安装的, 不需要可以删除

添加nginx用户, 并且设置不允许运行, 编译配置时指定为nginx用户运行

    useradd nginx -s /sbin/nologin

此处设置了运行用户为nginx, 配置文件等路径

    --prefix=/usr/local/nginx 
    --sbin-path=/usr/sbin/nginx 
    --modules-path=/usr/lib64/nginx/modules 
    --conf-path=/etc/nginx/nginx.conf 
    --error-log-path=/var/log/nginx/error.log 
    --http-log-path=/var/log/nginx/access.log 
    --http-client-body-temp-path=/var/lib/nginx/tmp/client_body 
    --http-proxy-temp-path=/var/lib/nginx/tmp/proxy 
    --http-fastcgi-temp-path=/var/lib/nginx/tmp/fastcgi 
    --http-uwsgi-temp-path=/var/lib/nginx/tmp/uwsgi 
    --http-scgi-temp-path=/var/lib/nginx/tmp/scgi 
    --pid-path=/run/nginx.pid 
    --lock-path=/run/lock/subsys/nginx 
    --user=nginx 
    --group=nginx 
    --with-file-aio 
    --with-ipv6 
    --with-http_ssl_module
    --with-http_v2_module 
    --with-http_realip_module 
    --with-http_addition_module 
    --with-http_xslt_module=dynamic 
    --with-http_image_filter_module=dynamic 
    --with-http_sub_module 
    --with-http_dav_module 
    --with-http_flv_module 
    --with-http_mp4_module 
    --with-http_gunzip_module 
    --with-http_gzip_static_module 
    --with-http_random_index_module 
    --with-http_secure_link_module 
    --with-http_degradation_module 
    --with-http_slice_module 
    --with-http_stub_status_module 
    --with-http_perl_module=dynamic 
    --with-mail=dynamic 
    --with-mail_ssl_module 
    --with-pcre 
    --with-pcre-jit 
    --with-stream=dynamic 
    --with-stream_ssl_module 
    --with-debug 
    --add-module=/root/echo-nginx-module-0.61 
    
    ## 精简
    ./configure --prefix=/usr/local/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib64/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --http-client-body-temp-path=/var/lib/nginx/tmp/client_body --http-proxy-temp-path=/var/lib/nginx/tmp/proxy --http-fastcgi-temp-path=/var/lib/nginx/tmp/fastcgi --http-uwsgi-temp-path=/var/lib/nginx/tmp/uwsgi --http-scgi-temp-path=/var/lib/nginx/tmp/scgi --pid-path=/run/nginx.pid --lock-path=/run/lock/subsys/nginx --user=nginx --group=nginx --with-file-aio --with-ipv6 --with-http_ssl_module --with-http_v2_module --with-http_realip_module --with-http_addition_module --with-http_xslt_module=dynamic --with-http_image_filter_module=dynamic --with-http_sub_module --with-http_dav_module --with-http_flv_module --with-http_mp4_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_random_index_module --with-http_secure_link_module --with-http_degradation_module --with-http_slice_module --with-http_stub_status_module --with-http_perl_module=dynamic --with-mail=dynamic --with-mail_ssl_module --with-pcre --with-pcre-jit --with-stream=dynamic --with-stream_ssl_module --with-debug --add-module=/root/echo-nginx-module-0.61 

    make 
    
    make install
    
<a name='start-on'></a>
### 开机启动

[官网示例](https://www.nginx.com/resources/wiki/start/topics/examples/redhatnginxinit/)
    

    
/etc/init.d/nginx文件如下(复制自nginx官方)

```
#!/bin/sh
#
# nginx - this script starts and stops the nginx daemon
#
# chkconfig:   - 85 15
# description:  NGINX is an HTTP(S) server, HTTP(S) reverse \
#               proxy and IMAP/POP3 proxy server
# processname: nginx
# config:      /etc/nginx/nginx.conf
# config:      /etc/sysconfig/nginx
# pidfile:     /var/run/nginx.pid

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

nginx="/usr/sbin/nginx"
prog=$(basename $nginx)

NGINX_CONF_FILE="/etc/nginx/nginx.conf"

[ -f /etc/sysconfig/nginx ] && . /etc/sysconfig/nginx

lockfile=/var/lock/subsys/nginx

make_dirs() {
   # make required directories
   user=`$nginx -V 2>&1 | grep "configure arguments:.*--user=" | sed 's/[^*]*--user=\([^ ]*\).*/\1/g' -`
   if [ -n "$user" ]; then
      if [ -z "`grep $user /etc/passwd`" ]; then
         useradd -M -s /bin/nologin $user
      fi
      options=`$nginx -V 2>&1 | grep 'configure arguments:'`
      for opt in $options; do
          if [ `echo $opt | grep '.*-temp-path'` ]; then
              value=`echo $opt | cut -d "=" -f 2`
              if [ ! -d "$value" ]; then
                  # echo "creating" $value
                  mkdir -p $value && chown -R $user $value
              fi
          fi
       done
    fi
}

start() {
    [ -x $nginx ] || exit 5
    [ -f $NGINX_CONF_FILE ] || exit 6
    make_dirs
    echo -n $"Starting $prog: "
    daemon $nginx -c $NGINX_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog -QUIT
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    configtest || return $?
    stop
    sleep 1
    start
}

reload() {
    configtest || return $?
    echo -n $"Reloading $prog: "
    killproc $nginx -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

configtest() {
  $nginx -t -c $NGINX_CONF_FILE
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart|configtest)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload|configtest}"
        exit 2
esac
```


确保两个事情, nginx执行文件和配置文件路径, `chmod a+x /etc/init.d/nginx`

    nginx="/usr/sbin/nginx"
    NGINX_CONF_FILE="/etc/nginx/nginx.conf"

chkconfig管理启动脚本
    
    chkconfig --add /etc/init.d/nginx
    chkconfig nginx on
    chkconfig --list

重启电脑curl localhost测试是否开机启动


<a name='yum'></a>
### yum

配置centos的yum仓库安装nginx, [官方教程](https://www.nginx.com/resources/admin-guide/installing-nginx-open-source/#prebuilt)

#### 从第三方软件库安装

安装Red Hat / CentOS软件包, 先查看官网关于该报的描述, 是否支持系统版本

安装EPEL存储库：

    sudo yum install epel-release

更新存储库并安装NGINX Open Source：

    sudo yum update
    
确认版本

    sudo yum -C info nginx
    
安装

    sudo yum -y install nginx
    
#### 从NGINX存储库安装

    sudo vi /etc/yum.repos.d/nginx.repo

模板

    [nginx]
    name=nginx repo
    baseurl=http://nginx.org/packages/mainline/OS/OSRELEASE/$basearch/
    gpgcheck=0
    enabled=1
    
centos 7 安装示例

    [nginx]
    name=nginx repo
    baseurl=http://nginx.org/packages/mainline/centos/7/$basearch/
    gpgcheck=0
    enabled=1


    sudo yum update

测试nginx是否启动成功

    curl -I 127.0.0.1

<a name='start'></a>
### 启动

语法检测, 确认配置没有问题, 第一次安装的时候是可以直接启动的

    nginx -t

查看默认启动配置文件加载位置, 关注`default`

    ngingx -h 

测试通过, 也清楚配置文件的加载位置, 重启nginx进程

    nginx -s reload
    
#### 启动报错
    
通常情况下启动nginx, 因为没有指定配置文件
    
    nginx -s reload
    nginx: [error] invalid PID number "" in "/var/run/nginx.pid"

解决办法, 指定nginx程序加载配置文件并启动

    nginx -c /etc/nginx/nginx.conf
    nginx -s reload

<a name='header'></a>
## 头部定义

nginx.conf文件中，Nginx中有少数的几个高级配置在模块部分之上。

<a name='worker_processes'></a>
### worker_processes 

worker_processes 定义了nginx对外提供web服务时的worker进程数。最优值取决于许多因素，包括（但不限于）CPU核的数量、存储数据的硬盘数量及负载模式。不能确定的时候，将其设置为可用的CPU内核数将是一个好的开始（设置为“auto”将尝试自动检测它）。

<a name='worker_rlimit_nofile'></a>
### worker_rlimit_nofile 

更改worker进程的最大打开文件数限制。如果没设置的话，这个值为操作系统的限制。设置后你的操作系统和Nginx可以处理比“ulimit -a”更多的文件，所以把这个值设高，这样nginx就不会有“too many open files”问题了。

> ulimit -a FD最大为1024

```
user nginx; 
pid /var/run/nginx.pid; 
worker_processes auto; 
worker_rlimit_nofile 100000; 
```

<a name='server'></a>
## server 
```
server {
        listen 443;

        server_name localhost;
        index index.html index.htm index.php;
        root /home/wwwroot/website/public;

        ssl on;
        ssl_certificate /home/wwwroot/ssl/test_website.com.crt;
        ssl_certificate_key /home/wwwroot/ssl/test_website.com.key;


        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        location = /favicon.ico { access_log off; log_not_found off; }
        location = /robots.txt  { access_log off; log_not_found off; }

        access_log on;
        error_log  /home/wwwlogs/localhost.log error;

        include enable-php.conf;

        location ~ /\.ht {
            deny all;
        }

        access_log  /home/wwwlogs/localhost.log;
}
```
 
<a name='http'></a>
## http    

<a name='keepalive_timeout'></a>
### keepalive_timeout

连接超时时间，默认地连接不超时

    http {
        #keepalive_timeout  0; 
        keepalive_timeout 65;  
    }

<a name='log_format'></a>
### log_format

```
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '  
                  '$status $body_bytes_sent "$http_referer" '  
                  '"$http_user_agent" "$http_x_forwarded_for"';  
```


<a name='upstream'></a>
### upstream

负载均衡配置

模拟三台响应服务器端口8001,8002,8003, 对外服务器为localhost

    http {
        server {
            listen 80;
            server_name localhost;
            location / {
                # echo $host$request_uri; 输出没有任何效果, 连接已经转发
                proxy_pass http://myproject;
                proxy_set_header  X-Real-IP  $remote_addr; # 设置真实请求地址头部
            }
        }
    
        upstream myproject {
            #ip_hash;   # 设置负载均衡使用ip_hash算法, 默认为轮询
            server localhost:8001 weight=2; 
            server localhost:8002;
            server localhost:8003;
        }
    
        server {
            listen 8001;
            location / {
                echo "8001 port";
            }
        }
    
        server {
            listen 8002;
            location / {
                echo "8002 port";
            }
        }
    
        server {
            listen 8003;
            location / {
                echo "8003 port";
            }
        }
    }


#### down

表示单前的server暂时不参与负载

#### Weight

默认为1.weight越大，负载的权重就越大。

#### max_fails

允许请求失败的次数默认为1.当超过最大次数时，返回proxy_next_upstream 模块定义的错误

#### fail_timeout

max_fails 次失败后，暂停的时间。

#### Backup

其它所有的非backup机器down或者忙的时候，请求backup机器。所以这台机器压力会最轻。

<a name='proxy'></a>
### proxy

缓存cache参数配置, 注意此处的缓存为文件缓存，就性能而言还是有一定瓶颈，可以考虑varnish的内存缓存架构代替

```
http {

    ...

    proxy_connect_timeout 5;  
    proxy_read_timeout 60;  
    proxy_send_timeout 5;  
    proxy_buffer_size 16k;  
    proxy_buffers 4 64k;  
    proxy_busy_buffers_size 128k;  
    proxy_temp_file_write_size 128k;  
    #缓存到nginx的本地目录  
    proxy_temp_path  /Users/heyongjian/Desktop/heyongjian/FSvcWeb/nginx/temp/;  
    proxy_cache_path /Users/heyongjian/Desktop/heyongjian/FSvcWeb/nginx/temp/cache_temp levels=1:2 keys_zone=cache_one:200m inactive=1d max_size=30g;  
    
    ...
}
```

> 分别正向代理和反向代理，如果用户再局域网，向外发出请求通过代理服务器，此时一般为正向代理，对于服务器而言，外部请求可以配置反向代理，他们的应用场景是不一样的


正向代理服务器

    server {  
        listen       80;   #监听的端口  
        server_name  192.168.10.100;  #server的内网地址，对内的代理地址
      
      
        resolver 8.8.8.8;   #DNS
        
        location / {  
               proxy_pass http://$http_host$request_uri;   #$http_host和$request_uri是nginx系统变量，不需要替换，保持原样  
        } 
    }

反向代理

    server {  
        listen       80;  
        server_name  10.0.0.136; #根据环境介绍，nginx server ip  
      
        location / {  
            proxy_pass http://10.0.0.137; #被代理的服务器ip  
            # proxy_pass http://myproject; # 结合upstream配置的名称，实现负载均衡
            
            ### force timeouts if one of backend is died ##   
            proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;    
            
            ### Set headers #### 
            proxy_set_header X-Real-IP  $remote_addr;
            proxy_set_header Host $host;    
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;   
            
            ### Most PHP, Python, Rails, Java App can use this header, 强制跳转https ###    
            # proxy_set_header X-Forwarded-Proto https;    
            
            # 一般配置关闭
            proxy_redirect off
        }  
    }


<a name='gzip'></a>
### gzip压缩配置

```
http {
    gzip  on;           #打开gzip压缩功能  
    gzip_min_length 1k; #压缩阈值  
    gzip_buffers 4 16k; #buffer 不用修改  
    gzip_comp_level 2;  #压缩级别:1-10，数字越大压缩的越好，时间也越长  
    gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;  #        压缩文件类型  
    gzip_vary off;      #跟Squid等缓存服务有关，on的话会在Header里增加 "Vary: Accept-Encoding"  
    gzip_disable "MSIE [1-6]\.";  #IE1-6版本不支持gzip压缩  
}

```

<a name='sendfile'></a>
### sendfile调优 

* sendfile

现在流行的web 服务器里面都提供 sendfile 选项用来提高服务器性能, 一般的网络传输过程 ,4个buffer上下文切换

硬盘 >> kernel buffer >> user buffer>> kernel socket buffer >>协议栈 

使用sendfile后 ,2个buffer上下文切换

硬盘 >> kernel buffer (快速拷贝到kernelsocket buffer) >>协议栈 

sendfile省去用户空间buffer复制的过程, 可以显著提高传输性能。DMA(Direct Memory Access，直接内存存取) ,上述中硬盘文件系统调用read()或write()保存到DMA中,然后完成上下文切换

* tcp_nopush

tcp_nopush只有在启用了`sendfile`时才起作用，为什么?

在启用tcp_nopush后，程序接收到了数据包后不会马上发出，而是等待数据包最大时一次性发出，可以缓解网络拥堵。(Nagle化) 

假设终端应用程序每产生一次操作就会返回一个字节响应数据，而典型情况一个包会拥有一个字节的数据以及40个字节长的包头，于是产生41个字节的包返回给客户端, 4000%的过载，高并发环境很轻易地就能令`网络发生拥塞`。
为了避免这种情况，TCP堆栈实现了等待数据 0.2秒钟，因此操作后它不会发送一个数据包，而是将这段时间内的数据打成一个大的包。这一机制是由Nagle算法保证。

> 在网络拥塞控制领域，我们知道有一个非常有名的算法叫做Nagle算法（Nagle algorithm），这是使用它的发明人John Nagle的名字来命名的，John Nagle在1984年首次用这个算法来尝试解决福特汽车公司的网络拥塞问题（RFC 896），该问题的具体描述是：如果我们的应用程序一次产生1个字节的数据，而这个1个字节数据又以网络数据包的形式发送到远端服务器，那么就很容易导致网络由于太多的数据包而过载。比如，当用户使用Telnet连接到远程服务器时，每一次击键操作就会产生1个字节数据，进而发送出去一个数据包，所以，在典型情况下，传送一个只拥有1个字节有效数据的数据包，却要发费40个字节长包头（即ip头20字节+tcp头20字节）的额外开销，这种有效载荷（payload）利用率极其低下的情况被统称之为愚蠢窗口症候群（Silly Window Syndrome）。可以看到，这种情况对于轻负载的网络来说，可能还可以接受，但是对于重负载的网络而言，就极有可能承载不了而轻易的发生拥塞瘫痪。Nagle算法规定：如果包的大小满足MSS，那么可以立即发送，否则数据会被放到缓冲区，等到已经发送的包被确认了之后才能继续发送。可以降低网络里小包的数量，从而提升网络性能。

* tcp_nodelay 

默认值:  tcp_nodelay on;开启或关闭nginx使用TCP_NODELAY选项的功能。 这个选项仅在将连接转变为长连接的时候才被启用。

tcp_nodelay为什么只在keep-alive才启作用,短连接中并不存在小包阻塞的问题，而在长连接中需要做tcp_nodelay开启。如果当前HTTP是持久连接,即进行连续的Request/Response、Request/Response、…，处理，那么由于最后这个小包受到Nagle算法影响无法及时的发送出去（具体是由于客户端在未结束上一个请求前不会发出新的request数据，导致无法携带ACK而延迟确认，进而导致服务器没收到客户端对上一个小包的的确认导致最后一个小包无法发送出来）,导致第n次请求/响应未能结束，从而客户端第n+1次的Request请求数据无法发出。

```
# 设置nginx是否使用sendfile函数输出文件
sendfile            on;
# 告诉nginx在一个数据包里发送所有头文件，而不一个接一个的发送。(使用Nagle算法)
tcp_nopush          on;
# 立刻发送数据包(禁用Nagle算法),如果请求立即发出那么响应时间也会快一些
tcp_nodelay         on;
```
<a name='pcre'></a>
## pcre匹配模式
= 精确匹配会第一个被处理。如果发现精确匹配，**nginx停止搜索其他匹配**。

普通字符匹配，正则表达式规则和长的块规则将被优先和查询匹配，也就是说如果该项匹配还需去看有没有正则表达式匹配和更长的匹配。

^~ 则只匹配该规则，**nginx停止搜索其他匹配**，否则nginx会继续处理其他location指令。

"~"和"~*"的指令，如果找到相应的匹配，则nginx停止搜索其他匹配；当没有正则表达式或者没有正则表达式被匹配的情况下，那么匹配程度最高的逐字匹配指令会被使用。

|字符|意义|
|-|-|
|~|波浪线表示执行一个正则匹配，区分大小写|
|~* |表示执行一个正则匹配，不区分大小写|
|^~|^~表示普通字符匹配，如果该选项匹配，只匹配该选项，不匹配别的选项，一般用来匹配目录|
|=|进行普通字符精确匹配|
|@|"@" 定义一个命名的 location，使用在内部定向时|


<a name='location'></a>
## location


<a name='cache'></a>
### 缓存

nginx的http_proxy模块，可以实现类似于Squid的缓存功能。Nginx服务器启动后，会对本地磁盘上的缓存文件进行扫描，在内存中建立缓存索引，并有专门的进程对缓存文件进行过期判断、更新等进行管理。

只有在proxy_pass的时候，才会生成缓存，下一次请求执行到proxy_pass的时候会判断是否有缓存，如果有则直接读缓存，返回给客户端，不会执行proxy_pass；如果没有，则执行proxy_pass，并按照规则生成缓存文件；可以到nginx的cache文件夹下看是否生成了缓存文件。

缓存30天

    location ~* .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
       root         /spool/www;
       access_log   off;
       expires 30d;
    }

特点, 设置了`response headers`报文的`expires`字段, 并且通过调试工具查看, 可以看见资源的释放时间, 如果没有看见需要ctrl + f5进行强行刷新资源


反向代理缓存文件配置

```
#缓存相应的文件(静态文件)  
location ~ \.(gif|jpg|png|htm|html|css|js|flv|ico|swf)(.*) {  
     proxy_pass http://cluster;         #如果没有缓存则通过proxy_pass转向请求 
     
     ### proxy_next_upstream由upstrem定义返回 ， 
     proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;    
    
     ### By default we don't want to redirect it ####    
     proxy_redirect off;  
     
     proxy_set_header Host $host; 
     proxy_set_header X-Real-IP $remote_addr; 
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;    
      
     proxy_cache cache_one;  
     proxy_cache_valid 200 302 1h;                              #对不同的HTTP状态码设置不同的缓存时间,h小时,d天数  
     proxy_cache_valid 301 1d;  
     proxy_cache_valid any 1m;  
     
     #如果系统很忙的时候可以申请更大的proxy_buffers 官方推荐*2
     #proxy_busy_buffers_size 256k;
     #proxy缓存临时文件的大小
     #proxy_temp_file_write_size 128k;
     #用于指定本地目录来缓冲较大的代理请求
     proxy_temp_path /usr/local/nginx/temp;
     #设置web缓存区名为cache_one,内存缓存空间大小为12000M，自动清除超过15天没有被访问过的缓存数据，硬盘缓存空间大小200g
     proxy_cache_path /usr/local/nginx/cache levels=1:2 keys_zone=cache_one:200m inactive=1d max_size=30g;
     
     expires 30d;  
}  
```

清理缓存

```
#purge插件缓存清理  
location ~ /purge(/.*) {  
       allow              127.0.0.1;        #能够清除缓存的服务器IP地址  
       #allow             10.16.39.12;  
       deny               all;  
       proxy_cache_purge  cache_one $1$is_args$args;  
}  
```

使用ngx_cache_purge [github下载](https://github.com/FRiCKLE/ngx_cache_purge)模块进行缓存清理，例如：www.wolfdream.cn/purge/xxx.jpg 就可以清除xxx图片缓存了，另外超时的缓存Nginx会自动删除。

<a name='http_user_agent'></a>
### http_user_agent 

匹配谷歌浏览器示例

    location / {
        if ($http_user_agent ~ 'Chrome') {
            echo "yes, i catch your request header!!";
        }
    }
<a name='client_max_body_size'></a>
### client_max_body_size    

上传文件大小限制, 上传超过1M大的客户端文件无法正常上传

    location / {  
        root   html;  
        index  index.html index.htm;  
        client_max_body_size    1000m;  
    }  

<a name='error_log'></a>
## error_log

排查错误非常有用, 如php错误会显示在其中

```
server {
    ...
    access_log  /home/wwwlogs/access.log;
    error_log  /home/wwwlogs/error.log error;
}
```
<a name='403'></a>
## 403

一次处理经验为运行目录无权限,先`ps aux | grep nginx`确认worker子进程的执行用户, 再执行相关赋权操作

<a name='fastcgi'></a>
## fastcgi

### nginx + fastcgi 防止跨站跨目录配置

[php官网配置说明](#http://www.php.net/manual/en/install.fpm.configuration.php)

此配置可以限制php只能运行在指定目录, include也不可超出其限制, 一般`$document_root`即可, 需要error_log才能看见其php报错

```
vim path/to/nginx/conf/fastcgi.conf

...
fastcgi_param PHP_ADMIN_VALUE "open_basedir=$document_root/../:/tmp/:/proc/$document_root/../";

```







