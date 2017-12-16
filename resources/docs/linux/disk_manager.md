# 磁盘管理

- [df](#df)
- [du](#du)
- [dd](#dd)
- [fstab](#fstab)
- [fdisk创建分区](#fdisk)
    - [查看](#fdisk-list)
    - [操作](#fdisk-option)
    - [partprobe](#partprobe)
- [swap分区](#swap)
    - [分区型swap](#swap-partion)
    - [文件型swap](#swap-file)
- [文件系统管理类](#file-manager)
- [练习](#test)


<a name='df'></a>
## df

report file system disk space usage

`df -h` 

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda3        18G  3.8G   14G  22% /
devtmpfs        474M     0  474M   0% /dev
...
```

<a name='df'></a>
## df

    du -h /etc     #报告每一个文件的大小
    du -sh /etc    #汇总每一个文件的大小之和

<a name='dd'></a>
## dd
dd 转换并复制文件

    if in file源输入文件
    of ount file目标输出文件
    seek 跳过空间创建文件
    bs 块大小
    count 共多少块

> dd也是复制文件, 但是不同于cp, cp通过vfs接口读取数据源然后填充到硬盘, dd复制的是底层的数据流, 是二进制代码, 并且可以指定字节

利用dd备份mbr

    // 备份MBR
    dd if=/dev/sda of=/mnt/mbr.backup bs=512 count=1
    // 跳过1023块, 填充1M数据到swapfile, 用于快速创建1G文件, 实际上du -sh查看文件没有1G
    dd if=/dev/zero of=/mnt/swapfile seek=1023 bs=1M count=1

大文件的创建, 通常用于磁盘性能测试

<a name='fstab'></a>
## fstab

开机启动自动挂载设备

```
要挂载的设备	挂载点		      文件系统类型	挂载选项 转储频率(完全备份,1每天,2每两天一次)	文件系统检测次序(只有根可以为1)		
/dev/sda5		/mnt/test		ext3		defaults		0 0
```

defaults 和`mount -o` 参数意义一致, 有rw,ro,acl等值

`mount -a`命令可挂载fstab中所有设备, 挂载成功写入信息到`/etc/mtab`, `mount -m`可指定不写入

### 卸载

umount /dev/sdb

解决卸载遇到busy不能卸载

    fuser -v /etc/sdb

<a name='fidsk'></a>
## fdisk

查看硬盘每块硬盘分区情况, 重新分区操作, 指定分区文件系统

<a name='fdisk-list'></a>
### 查看

`fdisk -l` 查看当前系统硬盘空间的使用情况 

`fdisk -l /dev/sdb`

```
Disk /dev/sdb: 42.9 GB, 42949672960 bytes, 83886080 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x7b5ef2a2

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb4            2048    83886079    41942016    5  Extended
/dev/sdb5            4096    20975615    10485760   83  Linux
/dev/sdb6        20977664    41949183    10485760   83  Linux
```

<a name='fdisk-option'></a>
### 操作

> 注意: 该命令操作, 会损坏硬盘原有数据

指定一块操作的硬盘`fdisk /dev/sdb`

```
[root@localhost centos]# fdisk /dev/sdb
Welcome to fdisk (util-linux 2.23.2).

Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): 
Command (m for help): m
Command action
   a   toggle a bootable flag
   b   edit bsd disklabel
   c   toggle the dos compatibility flag
   d   delete a partition 删除一个分区
   g   create a new empty GPT partition table
   G   create an IRIX (SGI) partition table
   l   list known partition types 打印可设置分区类型
   m   print this menu 帮助
   n   add a new partition 新建一个分区
   o   create a new empty DOS partition table
   p   print the partition table  查看当前分区
   q   quit without saving changes 退出
   s   create a new empty Sun disklabel
   t   change a partition's system id
   u   change display/entry units
   v   verify the partition table
   w   write table to disk and exit 保存变更并退出
   x   extra functionality (experts only)
```

MBR Master Boot Record主引导记录, 共512Byte
* 446Byte BootLoader  程序
* 64Byte 每16Byte标识一个主分区, 每块硬盘只能有4个分区
* 2Byte  Magic Number 标记MBR是否有效

因而确定当前还可以创建多少个分区是十分重要的, 这里以创建逻辑分区为例(主分区同理)

操作磁盘`dev/sdb`所有空间为扩展分区, 在此基础上创建一个2G大小的逻辑分区, 并变更逻辑分区的类型为swap

```
n #创建一个分区
e #分区类型为扩展分区
1 #当前磁盘号为1, 默认回车即可
#开始扇区号-- 回车操作即可
#结束扇区号-- 这里使用所有分区作为扩展分区

查看分区结果
Command (m for help): p

Disk /dev/sdb: 42.9 GB, 42949672960 bytes, 83886080 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk label type: dos
Disk identifier: 0x7b5ef2a2

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    83886079    41942016    5  Extended

n #继续创建分区
l #创建逻辑分区, 默认从5开始设备编号, 回车即可
#开始扇区号-- 回车操作即可
+2G #结束扇区号, 设置新分区大小为2G

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    83886079    41942016    5  Extended
/dev/sdb5            4096    20975615    10485760   83  Linux

t #变更分区类型
5 #输入变更分区号
l #查看可选择分区编号
82 #82  Linux swap / So 修改该分区的类型为交换分区（82）

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    83886079    41942016    5  Extended
/dev/sdb5            4096    20975615    10485760   82  Linux swap / Solaris

w 保存退出
```
<a name='portprobe'></a>
### partprobe

通知内核同步磁盘信息, RH6后也可以通过`partx -u /dev/sda`更新磁盘信息

    cat /proc/partitions
    partprobe 或 partprobe /dev/sdb

此时`fdisk -l`已经能查看新操作的分区

<a name='swap'></a>
## swap分区

swap分区存在的意义, 允许了内存不足时可以临时在次分区进行数据交换, 让服务器有一丝喘息的机会

<a name='swap-partion'></a>
### 分区型swap分区

#### 查看swap分区

```
free -h
或
swapon
```

#### 转换swap分区

也可以通过`fdisk /dev/sdb5` t选项指定分区类型

```
mkswap /dev/sdb5

[root@localhost centos]# mkswap /dev/sdb5
# /dev/sdb5原为ext3格式文件系统
mkswap: /dev/sdb5: warning: wiping old ext3 signature.
Setting up swapspace version 1, size = 10485756 KiB
no label, UUID=d1b37544-2d21-405b-ac69-a763c5a3c641
```

这是mk家族磁盘管理命令

#### 激活swap分区

```
swapon /dev/sdb5 -L swap_label1

free -m或swapon 检查结果
```

`swap -a` 启用所有定义在/etc/fstab中的swap设备

#### 设置开机自动挂载

/etc/fstab

```
/dev/sd5	swap	swap	defaults 0 0
```

#### 卸载swap分区

```
swapoff /dev/sdb5
```

删除/dev/fstab自启动挂载

`fdisk /dev/sdb` 管理分区删除操作

<a name='swap-file'></a>
### 文件型swap

回环设备创建swap分区

创建1G交换文件, 并填充0数据, 指定块大小1M, 读取1024块

    dd if=/dev/zero of=/swapfile bs=1M count=1024

挂载swapfile文件

    mkswap /swapfile -L swap_label2
    swapon /swapfile
    free -m
    [root@localhost centos]# swapon
    NAME      TYPE      SIZE USED PRIO
    /dev/sda2 partition   2G 3.4M   -1
    /swapfile file      1G   0B   -2

和创建分区方法有所不同, 该命令真实地创建了一个1G大小的文件, 且文件类型标识为文件, 性能其实对比上一个更差

卸载

    swapon /swapfile
    rm /swapfile
    vi /etc/fstab



<a name='file-manager'></a>
## 文件系统管理类

创建分区完毕, 还需要指定分区文件系统类型, 常见的有fat32(vfat), ext2, ext3, ext4, swap等

查看当前内核所支持的文件系统类型, 然后确定-t选项, 不支持的文件系统类型是因为内核不支持, 内核编译的时候去掉了

    cat /proc/filesystem

<a name='mkfs'></a>
### mkfs

格式化分区文件系统, 重新创建文件系统会损坏原有文件,  这个命令也是意味**格式化**

    mkfs -t ext2 /dev/sda5
    等同于
    mkfs.ext3 /dev/sdb5

<a name='test'>

创建一个5G的分区，文件系统为ext3，卷标为MYDATA，块大小为1024，预留管理空间为磁盘分区的3%，要求开机后可以自动挂载至/data目录，并且自动挂载的设备要使用卷标进行引用

创建一个本地回环文件/var/swaptemp/swapfile来用于swap，要求大小为512MB，卷标为SWAP-FILE，且开机自动启用此交换设备；

    mkdir /var/swaptemp
    dd if=/dev/zero of=/var/swaptemp/swapfile bs=1M count=512
    mkswap LABLE=SWAP-FILE /var/swaptemp/swapfile