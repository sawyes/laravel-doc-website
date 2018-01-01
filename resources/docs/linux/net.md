# 网络管理

- [命名规则](#name-rule)
- [ifconfig](#ifconfig)
- [route](#route)
    - [添加](#route-add)
    - [删除](#route-del)
- [网络配置文件](#network)
    - [三种方式管理网络](#manager-network)
    - [配置网络](#net-ini)
    - [ifcfg配置解释](#ifcfg)
    - [配置路由](#route-ini)
    - [配置DNS](#dns-ini)
    - [hosts](#hosts)
    - [hostname](#hostname)
    - [nmtui](#nmtui)
- [别名网卡](#alias-net)
- [IP命令](#ip)


<a name="name-rule"></a>
## 命名规则

Linux: 网络属于内核的功能

RHEL5: /etc/modprobe.conf

RHEL6: /etc/udev/rules.d/70-persistent-net.rules

<a name='ifconfig'></a>
## ifconfig

ifconfig命令用于获取网卡配置与网络状态等信息，

    ifconfig 网卡 IP/NETMASK [UP/DOWN]

使用ifconfig命令来查看本机当前的网卡配置与网络状态等信息时，其实主要查看的就是网卡名称、inet参数后面的IP地址、ether参数后面的网卡物理地址（又称为MAC地址），以及RX、TX的接收数据包与发送数据包的个数及累计流量：

```
[root@linuxprobe ~]# ifconfig
eno16777728: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.10.10  netmask 255.255.255.0  broadcast 192.168.10.255
        inet6 fe80::20c:29ff:fec4:a409  prefixlen 64  scopeid 0x20<link>
        ether 00:0c:29:c4:a4:09  txqueuelen 1000  (Ethernet)
        RX packets 36  bytes 3176 (3.1 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 38  bytes 4757 (4.6 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
...
```

#### 为指定网卡配置地址

ifconfig 配置立刻应用于内核, 但是重启网络或主机后无效

    ifconfig eth0 192.168.116.131/24

网络服务

    /etc/init.d/network [start |stop | restart| status]
    
<a name="#route"></a>
## route

> 该命令操作重启网络服务或者主机后失效

route | route -n 查看当前路由

`-n`以数字的方式显示主机或端口等相关信息, 不经过域名解析, 速度非常快

```
vagrant@homestead:~$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         10.0.2.2        0.0.0.0         UG    0      0        0 enp0s3
10.0.2.0        *               255.255.255.0   U     0      0        0 enp0s3
192.168.10.0    *               255.255.255.0   U     0      0        0 enp0s8
```

常用命令选项

    -A family 默认-A inet 表示ipv4, [-4|-6] 
    add 添加一条路由
        -host 主机路由
        -net 网络路由 0.0.0.0默认路由
    del 删除一条路由
    

<a name="route-add"></a>
### 添加

#### 默认路由

    route add default gw 192.168.116.1
    或者
    route add 0.0.0.0 gw 192.168.116.1

添加一条到达172.16.1.0路由, 默认网关192.168.116.1

    route add -net 172.16.1.0/24 gw 192.168.116.1
    
添加一条到达172.16.1.0路由, 指定网卡出口ens33

    route add -net 172.16.1.0/24 dev ens37

<a name="route-del"></a>
### 删除

一般无需指定默认网关

    route del -net 172.16.1.0/24
    删除默认路由
    route del -net 0.0.0.0
    route del default
    

<a name="network"></a>
## 网络配置文件

在RHEL 5、RHEL 6系统及其他大多数早期的Linux系统中，网卡的名称一直都是eth0、eth1、eth2、……，但在RHEL 7中则变成了类似于eno16777736这样的名字。不过除了网卡的名称发生变化之外，其他几乎一切照旧

> 安装RHEL 7系统时默认没有激活网卡，只需使用Vim编辑器将[网卡配置文件](#net-ini)中的ONBOOT参数修改成yes，这样在系统重启后网卡就被激活了。

网络配置文件, rhel: `/etc/sysconfig/network`, ubuntu: `/etc/network/interfaces`

网络接口配置文件, `/etc/sysconfig/network-scripts/` +  [interface_name(eth0)](#name-rule)

<a name='manager-network'></a>
### 三种方式管理网络

    /etc/init.d/network [start |stop | restart| status]

    service network restart

    systemctl start network

> 养成配置文件前必须要备份的习惯

<a name='net-ini'></a>
### 备份网卡配置文件

    cp /etc/sysconfig/network-scripts/ifcfg-ens37 /etc/sysconfig/network-scripts/ifcfg-ens37.bak  
    vim /etc/sysconfig/network-scripts/ifcfg-ens37

配置网络
    
    # 静态IP
    BOOTPROTO="static"
    # 必须与配置接口文件名称相同
    DEVICE="ens37"
    IPADDR=172.16.117.10
    NETMASK=255.255.255.0
    GATEWAY=172.16.117.1
    # 物理地址, 请先用ip link 或这ifconfig ens33确认MAC地址
    HWADDR=00:0c:29:3e:a3:a0
    # 开机自动启动此设备
    ONBOOT="YES"
    DNS1=8.8.8.8
    DNS2=114.114.114.114

重启网络服务, 检查配置

    # 重启网络服务, 内核重新读取网络配置文件
    service network restart
    ifconfig ens37
    route -n
    ping 172.16.117.10

<a name='ifcfg'></a>
### ifcfg配置解释

    /etc/sysconfig/network-scripts/ifcfg-INTERFACE_NAME
    DEVICE=: 关联的设备名称，要与文件名的后半部“INTERFACE_NAME”保持一致; 
    BOOTPROTO={static|none|dhcp|bootp}: 引导协议；要使用静态地址，使用static或none；dhcp表示使用DHCP服务器获取地址；
    IPADDR=: IP地址
    NETMASK=：子网掩码
    GATEWAY=：设定默认网关；
    ONBOOT=：开机时是否自动激活此网络接口；
    HWADDR=： 硬件地址，要与硬件中的地址保持一致；可省；
    USERCTL={yes|no}: 是否允许普通用户控制此接口；
    PEERDNS={yes|no}: 是否在BOOTPROTO为dhcp时接受由DHCP服务器指定的DNS地址；
    
> DHCP方式获取DNS地址会修改/etc/resolv.conf配置, 如果不接受PEERDNS="no"即可

<a name='route-ini'></a>
### 配置路由

/etc/sysconfig/network-scripts/route-ethX

    vim route-ens33
    10.1.1.0/24 via 192.168.116.1

重启网络服务`systemctl restart network`, `route -n`查看路由

<a name='dns-ini'></a>
### 配置DNS

`/etc/resolv.conf`最多只能配置3个DNS, 请注意,只有第一个服务不可用才会使用第二个DNS, 所以应该选择延迟最小的DNS服务器

    echo "nameserver 8.8.8.8" >> /etc/resolv.conf 
    
<a name='hosts'></a>
### hosts

`/etc/hosts`本机解析, 优先级比`/etc/resolv.conf`高
    
    cat /etc/hosts | grep dt
    192.168.10.10 dt.app dt
    
    ping dt
    
    
<a name='nmtui'></a>
### nmtui

在RHEL 7系统中有至少5种网络的配置方法, `nmtui`图形配置网络, RHEL6以前`setup`, 使用的是network manager


<a name='hostname'></a>
### hostname

在Linux系统中，主机名大多保存在`/etc/hostname文`件中，接下来将/etc/hostname文件的内容修改为“mytest.com”，四个步骤如下。

    配置mytest.com主机域名, 重启有效
    cat /etc/hostname
    mytest.com
    
    加载文件中的主机设置
    hostname -F /etc/hostname 
    或者 hostname mytest.com
    
    查看配置
    hostname
    mytest.com
    cat /etc/resolv.conf
    [root@localhost ~]# cat /etc/resolv.conf 
    search mytest.com

延伸: 变量HOSTNAME需要重启后才生效, hosts主机需要添加主机,ping才能识别127.0.0.1(否则为网卡IP)

    配置本地解析
    [root@localhost ~]# grep "mytest" /etc/hosts
    127.0.0.1   localhost mytest.com localhost4 localhost4.localdomain4
    ::1         localhost mytest.com localhost6 localhost6.localdomain6

    更新非实时变量
    HOSTNAME=`hostname`

* hostname 实时
* echo $HOSTNAME 非实时





    ip

<a name='alias-net'></a>
## 别名网卡

临时配置

    ifconfig ens33:0 192.168.119.10/24 

配置文件

    vim /etc/sysconfig/network-scripts/ifcfg-ens33:0
    DEVICE=ens33:0
    ONBOOT=yes
    BOOTPROTO=static
    IPADDR=192.168.119.10
    NETMASK=255.255.255.0
    GATEWAY=192.168.119.1
    HWADDR=00:00:00:00:00:00
    ...
  
<a name='ip'></a>   
## IP命令

|ifconfig|ip|
|---|---|
|arp -an|ip neigh|
|ifconfig|ip link|
|ifconfig -a|ip addr show|
|ifconfig -s|ip -s link|
|ifconfig eth0 up|ip link set eth0 up|
|ipmaddr|ip maddr|
|netstat|ss -n|
|netstat -rn 或 route -n|ip route|
|route add -net|ip route add |

### ip-link
    
    // 显示链路信息
    ip link show
    // 显示链路信息以及数据包统计信息
    ip -s link
    
    ip link set DEVICE { up | down | arp { on | off }
    
    ip link show eth0
    
### ip-addr

man ip-address

接口路由查询,设置,删除

    ip addr
    ip addr show ens33
    绑定网卡地址, 可以多个
    ip addr add 10.1.1.1/8 dev ens33
    ip addr del 10.1.1.1/8 dev ens33
    ip addr show dynamic
    ip addr show to 10/8
    
    ip addr flush ens33 to 10/8
    
别名路由
    
    ip addr add 10.1.1.1/8 dev ens33 label eth1:1
    
### ip-route
    
man ip-roue

    ip route show
    ip route add 192.168.10.10 via 192.168.116.1
    ip route add 192.168.10.0 via 192.168.116.1
    ip route add 192.168.11.0 dev ens33
    ip route add 192.168.12.0 via 192.168.116.1 dev ens33
    
    ip route del 192.168.116.0
    ip route del 192.168.116/24
    ip route flush 192.168/16


默认路由

    ip route add default via 192.168.1.1








