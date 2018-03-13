# nginx

- [安装](#install)
    - [编译安装](#configure)
    - [开机启动](#start-on)
    - [yum](#yum)
    - [启动](#start)
- [http](#http)
    - [upstream](#upstream)
    - [健康状态检测](#healthy)
    - [proxy](#proxy)
    - [keepalive_timeout](#keepalive_timeout)
- [pcre匹配模式](#pcre)
- [location](#location)
    - [expires](#expires)
    - [http_user_agent](#http_user_agent)
    - [client_max_body_size](#client_max_body_size)
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
    
    
    
<a name='http'></a>
## http    

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

<a name='healthy'></a> 
### 健康检查

测试, 当存在一台服务器宕机, 则会使用下一个负载均衡地址

    upstream myproject {  
        server localhost:8001 weight=1 max_fails=2 fail_timeout=2;
        server localhost:8002 weight=1 max_fails=2 fail_timeout=2;
        server localhost:8003 weight=1 max_fails=2 fail_timeout=2;
    }  


<a name='proxy'></a>
### proxy

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
            proxy_set_header  X-Real-IP  $remote_addr;
        }  
    }
    
<a name='keepalive_timeout'></a>
### keepalive_timeout

连接超时时间

    http {
        keepalive_timeout 65;  
    }

    

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


<a name='expires'></a>
### expires

缓存100天

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
       expires 100d;
    }

特点, 设置了`response headers`报文的`expires`字段, 并且通过调试工具查看, 可以看见资源的释放时间, 如果没有看见需要ctrl + f5进行强行刷新资源


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

<a name='403'></a>
## 403

一次处理经验为运行目录无权限,先`ps aux | grep nginx`确认worker子进程的执行用户, 再执行相关赋权操作



