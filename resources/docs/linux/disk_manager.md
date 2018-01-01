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
    - [blkid](#blkid)
    - [mke2fs创建文件系统](#mke2fs)
    - [tune2fs无损操作文件系统](#tune2fs)
    - [dumpe2fs](#dumpe2fs)
    - [基本分区信息](#base-fs-info)
    - [文件系统修复](#fs-repair)
    - [练习](#test)
- [mount挂载文件系统](#mount-fs)
    - [mount](#mount)
    - [umount](#umount)
    - [fuser](#fuser)
- [RAID](#raid)
    - [磁盘接口类型](#disk-interface-type)
    - [RAID级别](#raid-level)
    - [mdadm](#mdadm)
- [LVM](#lvm)
    - [创建分区](#partions-lvm)
    - [PV](#pv)
    - [GV](#gv)
    - [LV](#lv)

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

<a name='du'></a>
## du

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

    cat /proc/partitions #查看严重内核加载磁盘信息
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

<a name='blkid'></a>
### blkid

查看block属性, 磁盘属性

    [root@localhost centos]# blkid /dev/sdb6
    /dev/sdb6: LABEL="TEST_DATA" UUID="24713fc9-9d74-4aca-aac6-62cce331cf3b" TYPE="ext4" 

<a name='mke2fs'></a>
### mke2fs管理文件系统

格式化分区文件系统, 重新创建文件系统会损坏原有文件,  这个命令也是意味**格式化**
    
    mke2fs /etc/sda5
    # 等同
    mkfs -t ext2 /dev/sda5
    # 等同
    mkfs.ext2 /dev/sdb5

`mkfs.ext2`, `mkfs.ext3`, `mkfs.ext4`,  等... `mkfs`是一个系列的命令, 用于分区后创建管理文件系统

高级选项
#### -j 创建ext3文件系统
    mke2fs -j /dev/sdb5 等同与 mke2fs -t ext3 /dev/sdb5
#### -b 指定Block Size大小, 默认4096, 这个参数基本不用动, 提升了系统提示太大
    mke2fs -b 2048 /dev/sdb5    
#### -L volume-label 卷标, File System Label
    mke2fs -L WEB_DATA /dev/sdb5
#### -m 预留给超级用户的块百分比,默认为5个百分比, 进输入数字即可, 这个命令还是很有意义的, 尤其大硬盘
     mke2fs -m 3 /dev/sdb5
#### -i 指定多少个字节大小就产生一个inode, 块的倍数
     mke2fs -i 4096 /dev/sdb5
#### -N 手动指定inode个数,不按照块字节比例创建了
#### -F 强制
#### -E 用户指定额外文件[系统属性(参考fstab)](#fstab)

<a name='tune2fs'></a>
### tune2fs无损操作文件系统

查看超级块信息,无损升级,ext2->ext3等属性转换, 文件不损坏, 有数据也没问题,其他文件系统类型不支持

    Usage: tune2fs [-c max_mounts_count] [-e errors_behavior] [-g group]
        [-i interval[d|m|w]] [-j] [-J journal_options] [-l]
        [-m reserved_blocks_percent] [-o [^]mount_options[,...]] [-p mmp_update_interval]
        [-r reserved_blocks_count] [-u user] [-C mount_count] [-L volume_label]
        [-M last_mounted_dir] [-O [^]feature[,...]]
        [-E extended-option[,...]] [-T last_check_time] [-U UUID]
        [ -I new_inode_size ] device

    -j 设置ext3格式
        tune2fs -j /dev/sdb5 
    -L 设置卷标
        tune2fs -L WEB_DATA /dev/sdb5
    -m 调整预留百分比
        tune2fs -m 3 /dev/sdb5
    -r 预留块数量,而不是百分比
    -o 设定默认规则
    **acl** 文件访问控制, fstab中的defaults字段是一样的意思
    **-c** Maximum mount count 指定挂在次数达到设定值后进行自检, 0或-1关闭此功能
    **-i** Mount count 没挂载多少天后进行自检,0或-1关闭此功能, 结合-c使用
    **-l** 显示超级块中的信息, 很有用的选项
        tune2fs -l /dev/sdb5

<a name='dumpe2fs'></a>
### dumpe2fs

显示超Superblock的信息

    dumpe2fs /dev/sdb5
    dumpe2fs -h /dev/sdb5 只显示超级块信息

详细的dumpe2fs 包含了每个分组的信息, 从信息的`free block`中可以清晰地看到**文件碎片**的表现形式, 不连续的block空间

<a name='base-fs-info'></a>
### 基本分区信息

    root@localhost centos]# mkfs -L WWW_DATA -t ext2 /dev/sdb5
    mke2fs 1.42.9 (28-Dec-2013)
    Filesystem label=WWW_DATA
    OS type: Linux
    Block size=4096 (log=2)
    Fragment size=4096 (log=2)
    Stride=0 blocks, Stripe width=0 blocks
    655360 inodes, 2621440 blocks
    131072 blocks (5.00%) reserved for the super user
    First data block=0
    Maximum filesystem blocks=2684354560
    80 block groups
    32768 blocks per group, 32768 fragments per group
    8192 inodes per group
    Superblock backups stored on blocks: 
        32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632

    Allocating group tables: done                            
    Writing inode tables: done                            
    Writing superblocks and filesystem accounting information: done 


*  **Filesystem label** 卷标
*  **OS type** `fdisk -l`显示的系统类型
*  **Block size** 块大小, 4096字节, 4KB
*  **inode** 记录与自身相关的block磁盘信息,快速定位, 属组,属主,inode编号,时间戳, 文件大小, 32768 blocks per group / 8192 inodes per group = 4, 每个inode记录4个block块信息, 16KB
*  **block groups** 块组, 磁盘分区后会分成若干个块组, 每个块组都包含:`Superblock`->`GDT`(group descript 快组描述)->`Block Bitmap`(block位图)->`Inode Bitmap`->`Inode Table`->`Data Block`
*  **Superblock** **拥有多个备份**, 记录全局信息,如多少块组, 每个块组大小, 块大小, Inode空闲信息等
* **journal** ext3后新增的日志block, 数据线写到该区域, 写完成后才正式移动到inode table



<a name='fs-repair'></a>
### 文件系统修复

#### fsck
检查并且修复文件系统

    -t FSTYPE: 指定文件系统类型, ext4
    -a 自动修复

#### e2fsck

修复ext2,ext3文件系统了些

    -f 强制
    -p 自动修复

    e2fsck -f /dev/sdb5
    e2fsck -f -p /dev/sdb5


<a name='test'></a>
### 练习

创建一个5G的分区，文件系统为ext3，卷标为MYDATA，块大小为1024，预留管理空间为磁盘分区的3%，要求开机后可以自动挂载至/data目录，并且自动挂载的设备要使用卷标进行引用

    [root@localhost centos]# fdisk /dev/sdb
    p (查看当前磁盘分区信息)
    n (新建)
    l (逻辑分区)
    (回车使用默认,开始扇区区编号)
    +5G(结束扇区)
    p
    w (保存操作退出)
    [root@localhost centos]# partprobe /dev/sdb
    [root@localhost centos]# blkid /dev/sdb5
    /dev/sdb5: UUID="44af6010-0173-42d0-9272-81f9f8578580" SEC_TYPE="ext2" TYPE="ext3" 
    [root@localhost centos]# mke2fs -j -L MYDATA -b 2048 -m 3 /dev/sdb5
    [root@localhost centos]# mkdir /data
    [root@localhost centos]# mount /dev/sdb5 /data
    [root@localhost /]# vim /etc/fstab
    LABEL=MYDATA	/data	ext3	defaults	0 0
    [root@localhost ~]# mount -a #立刻挂载所有/etc/fstab所有设备



创建一个本地回环文件/var/swaptemp/swapfile来用于swap，要求大小为512MB，卷标为SWAP-FILE，且开机自动启用此交换设备；

    mkdir /var/swaptemp
    dd if=/dev/zero of=/var/swaptemp/swapfile bs=1M count=512
    mkswap LABLE=SWAP-FILE /var/swaptemp/swapfile

<a name='mount-fs'></a>
## mount挂载文件系统

默认地, mount 可以挂载文件系统

    mkdir /data
    mount /dev/sdb5 /data

但是, 开机启动会失效, 除非你写入到`/etc/fstab`实现自动加载(自动会写入`/etc/mtab`)

<a name='mount'></a>
### mount

`mount` 不带参数显示当前已经挂载的设备, 和挂载点(实际上显示/etc/mtab文件信息)

    mount

查看当前挂载信息, `cdrom`/文件系统 等

    [root@localhost ~]# df -h
    Filesystem      Size  Used Avail Use% Mounted on
    /dev/sda3        18G  4.1G   14G  23% /
    devtmpfs        474M     0  474M   0% /dev
    tmpfs           489M  156K  489M   1% /dev/shm
    tmpfs           489M   14M  476M   3% /run
    tmpfs           489M     0  489M   0% /sys/fs/cgroup
    /dev/sda1       297M  152M  146M  51% /boot
    tmpfs            98M   20K   98M   1% /run/user/1000
    /dev/sr0        4.1G  4.1G     0 100% /run/media/centos/CentOS 7 x86_64
    /dev/sdb5       4.9G   12M  4.7G   1% /data

挂载所有/etc/[fstab](#fstab)中的设备

    mount -a

#### 挂载选项

    -a 挂载/etc/fstab中的所有文件系统
    -n 默认情况下, 挂载一个设备都保存信息在/etc/mtab, -n选项表示挂载时不写入这个文件
    -t FSTYPE, 指定正在挂载的文件系统类型,默认可以不指定, 程序调用blkid自动获取
    -r 只读挂载,光盘常用
    -w 读写挂载
    -o 指定额外的挂载选项, 详情看man, 默认异步(async),actime等
        ro
        rw
        remount
        mount -o remount,ro,noexec,loop /dev/sdb5 /mnt/test
    --bind
    --move

<a name='umount'></a>
### umount

1. 设备不在占用
2. 事先存在
3. 目录中的原有文件暂时隐藏

```
umount /dev/sdb5
# 或者
umount /data
```

<a name='fuser'></a>
### fuser

fuser: 验正进程正在使用的文件或套接字文件, 存在程序占用不可直接umount, 需要fuser找出并中介进程

	-v: 查看某文件上正在运行的进程
    fuser -v /home 查看home目录下的所有进程
    
    -km: 终止访问某文件挂载点的所有进程
    fuser -km /mnt/cdrom 结束/mnt/cdrom的所有程序

 <a name='raid'></a>
## RAID   

 <a name='disk-interface-type'></a>
### 磁盘接口类型

* IDE 并行, 133Mbpms
* SATA 串行, 6Gbps
* USB 串行
* SCSI 并行,自带芯片控制, 类CPU, 320Mbps, Ultra
* SAS 串行附加存储, SCSI串行设备, 空间小, 容量小,转速快,造价高
* RAID 独立冗余磁盘阵列

sda 为scsi disk a
sr0 为scsi disk rom

#### 适配器/控制器/target

* 扩展槽的设备为适配器
* 主板集成为控制器

SCSI比较特殊, SCSI总线,一个适配器接出一条线, 线上的为target, 一个target可以继续扩展多个插槽

如一个8target的SCSI, 其中一个target作为适配器链接主板为`initiator`, 上面接的每块磁盘都有自己的LUN(Logic Unit Number)

<a name='raid-level'></a>
### RAID级别

0 鸡蛋 速度加倍
1 镜子 空间减半
5 奇偶校验

```
0： 条带
	性能提升: 读，写
	冗余能力（容错能力）: 无
	空间利用率：nS
	至少2块盘
1： 镜像
	性能表现：写性能下降，读性能提升
	冗余能力：有
	空间利用率：1/2
	至少2块盘
2
3
4: 
5: 
	性能表现：读，写提升
	冗余能力：有
	空间利用率：(n-1)/n
	至少需要3块
10:
	性能表现：读、写提升
	冗余能力：有
	空间利用率：1/2
	至少需要4块
01:
	性能表现：读、写提升
	冗余能力：有
	空间利用率：1/2
	至少需要4块
50:
	性能表现：读、写提升
	冗余能力：有
	空间利用率：(n-2)/n
    至少需要6块
jbod:
	性能表现：无提升
	冗余能力：无
	空间利用率：100%
	至少需要2块
```
<a name='mdadm'></a>
### mdadm

用户空间工具，管理工具

    mdadm -D --scan

#### 常用模式

* Create 创建 -C

```
专用选项：
    -l: 级别
    -n #: 设备个数
    -a {yes|no}: 是否自动为其创建设备文件
    -c: CHUNK大小, 2^n，默认为64K
    -x #: 指定空闲盘个数
```
* Manage 管理 --add, --remove, --fail, -a, -r, -f

```
mdadm  /dev/md1 -f /dev/sdb5
```

* Follow or Monitor 监控 

```
mdadm -D /dev/md1 #mdadm --detail /dev/md1
```

* Grow 增长
* Assemble 装配 -A

```
#备份配置
mdadm -D --scan > /etc/mdadm.conf
#重新装配
mdadm -A /etc/mdadm.conf
```

自动创建阵列设备/dev/md1, 有两块硬盘组成, 阵列级别为1的镜像卷, 分区编号sdb5, sdb6

```
mdadmin -C /dev/md1 -a yes -n 2 -l 1 /dev/sdb5 /dev/sdb6
```

查看磁盘阵列状态`cat /proc/mdstat`, 可查看磁盘同步过程

#### raid阵列

实验:同一块硬盘, 4个分区, 大小各2G, 分区类型fd, 每两块硬盘设置为raid1阵列, 设置阵列磁盘文件系统为ext3, 并挂载其中一块到文件/media 

    fdisk /dev/sdb
    n
    +2G
    t
    fd    #磁盘阵列硬盘格式
    w
    partprobe /dev/sdb
    cat /etc/partitions

    [root@localhost centos]# mdadm -C /dev/md1 -a yes -n 2 -l 1 /dev/sdb5 /dev/sdb6
    mdadm: Defaulting to version 1.2 metadata
    mdadm: array /dev/md1 started.
    [root@localhost centos]# mdadm -C /dev/md2 -a yes -n 2 -l 1 /dev/sdb7 /dev/sdb8

    # 查看磁盘同步状态
    [root@localhost centos]# cat /proc/mdstat
    Personalities : [raid1] 
    md2 : active raid1 sdb8[1] sdb7[0]
        2095104 blocks super 1.2 [2/2] [UU]
        [=======>.............]  resync = 38.2% (801536/2095104) finish=0.1min speed=200384K/sec
        
    md1 : active raid1 sdb6[1] sdb5[0]
        2095104 blocks super 1.2 [2/2] [UU]

    # 查看磁盘识别情况
    [root@localhost centos]# fdisk -l
    ...
    Disk /dev/md1: 2145 MB, 2145386496 bytes, 4190208 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes

    Disk /dev/md2: 2145 MB, 2145386496 bytes, 4190208 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes

    # 设置raid磁盘分区格式为ext3, 卷标为1
    [root@localhost centos]# mke2fs -j /dev/md1 -L Raid1
    [root@localhost centos]# mke2fs -j /dev/md2 -L Raid2

    # 挂载分区
    [root@localhost centos]# mount /dev/md1 /media/
    [root@localhost centos]# df | grep /dev/md1
    /dev/md1         2029392    3108   1921532   1% /media
    [root@localhost centos]# cd /media/
    # 存在lost+found, 文件系统挂载成功
    [root@localhost media]# ls
    lost+found

查看阵列信息

    mdadm -D /dev/md1 # mdadm --detail

模拟损坏磁盘

    mdadm  /dev/md1 -f /dev/sdb5 
    mdadm --detail /dev/sdb5
    #磁盘状态 : State faulty
    
    mdadm  /dev/md1 -r /dev/sdb5
    #磁盘状态 : State removed

修复磁盘

    # 准备一块新磁盘, 大小和sdb5一样
    [root@localhost media]# mdadm /dev/md1 -a /dev/sdb9
    mdadm: added /dev/sdb9

    [root@localhost media]# mdadm --detail /dev/md1
    ...
    Number   Major   Minor   RaidDevice State
       2       8       25        0      active sync   /dev/sdb9
       1       8       22        1      active sync   /dev/sdb6

       0       8       21        -      faulty   /dev/sdb5

停用阵列md1

    umount /dev/mdm1
    mdadm -S /dev/md1

装配停用阵列

    # dev/sdb5已损坏移除(模拟)
    [root@localhost /]# mdadm -A /dev/md1 /dev/sdb9 /dev/sdb6
    mdadm: /dev/md1 has been started with 2 drives.

    # 查看转载结果
    [root@localhost /]# mdadm -D /dev/md1

继续装载空闲盘, 作为standby 备份, 状态显示为spare, 表示在等待中

    [root@localhost /]# mdadm /dev/md1 -a /dev/sdb5
    [root@localhost /]# mdadm -D /dev/md1
    Number   Major   Minor   RaidDevice State
       2       8       25        0      active sync   /dev/sdb9
       1       8       22        1      active sync   /dev/sdb6

       3       8       21        -      spare   /dev/sdb5
    # 模拟sdb9损坏    
    [root@localhost /]# mdadm /dev/md1 -f /dev/sdb9
    # sdb5自动顶上了
    [root@localhost /]# mdadm -D /dev/md1
    Number   Major   Minor   RaidDevice State
       3       8       21        0      spare rebuilding   /dev/sdb5
       1       8       22        1      active sync   /dev/sdb6

       2       8       25        -      faulty   /dev/sdb9

<a name='lvm'></a>
## LVM

* PV
* GV
* LV

PE是最小单位

<a name='partions-lvm'></a>
### 创建分区

分区类型为8e - linux lvm

新建4个分区,分区类型为linxu lvm

```
fdisk /dev/sdb
n
l
+2G
t
8e
p

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    83886079    41942016    5  Extended
/dev/sdb5            4096     4198399     2097152   8e  Linux LVM
/dev/sdb6         4200448     8394751     2097152   8e  Linux LVM
/dev/sdb7         8396800    12591103     2097152   8e  Linux LVM
/dev/sdb8        12593152    16787455     2097152   8e  Linux LVM

w

[root@localhost centos]# cat /proc/partions
[root@localhost centos]# partprobe
# 确认配置生效
[root@localhost centos]# fdisk -l

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1            2048    83886079    41942016    5  Extended
/dev/sdb5            4096     4198399     2097152   8e  Linux LVM
/dev/sdb6         4200448     8394751     2097152   8e  Linux LVM
/dev/sdb7         8396800    12591103     2097152   8e  Linux LVM
/dev/sdb8        12593152    16787455     2097152   8e  Linux LVM

```

> 注意fdisk最多只能创建15个物理分区

<a name='pv'></a>
### PV管理

pvcreate, pvmove, pvremve, pvs, pvdisplay

#### 创建

pvcreate

把物理卷创建成PV,`pvcreate`命令选项挺多, 不过好的暂时用不上

```
# 命令行扩展批量创建
pvcreate /dev/sd{5..8}
```

> pv创建lvm会有空间损耗, 一般20%以内都是可接受的

####  查看

pvs, pvdisplay, pvscan

    [root@localhost centos]# pvs
    PV         VG Fmt  Attr PSize PFree
    /dev/sdb5     lvm2 ---  2.00g 2.00g
    /dev/sdb6     lvm2 ---  2.00g 2.00g
    /dev/sdb7     lvm2 ---  2.00g 2.00g
    /dev/sdb8     lvm2 ---  2.00g 2.00g

未加入卷组(GV)前PV中PE都是为0的

    [root@localhost centos]# pvdisplay /dev/sdb5
    "/dev/sdb5" is a new physical volume of "2.00 GiB"
    --- NEW Physical volume ---
    PV Name               /dev/sdb5
    VG Name               
    PV Size               2.00 GiB
    Allocatable           NO
    PE Size               0   
    Total PE              0
    Free PE               0
    Allocated PE          0
    PV UUID               mF2CDh-3DkA-nID6-0mVg-d06F-pqNl-VvyYib

    [root@localhost centos]# pvscan
    PV /dev/sdb6                      lvm2 [2.00 GiB]
    PV /dev/sdb7                      lvm2 [2.00 GiB]
    PV /dev/sdb5                      lvm2 [2.00 GiB]
    PV /dev/sdb8                      lvm2 [2.00 GiB]
    Total: 4 [8.00 GiB] / in use: 0 [0   ] / in no VG: 4 [8.00 GiB]

<a name='vg'></a>
### VG

vgcreate, vgremove, rgextend, vgreduce, vgs, vgdisplay, vgscan

#### 创建

vgcreate 卷组名 物理卷(PV卷)

    [root@localhost centos]# vgcreate myvg /dev/sdb{6,7}
      Volume group "myvg" successfully created

指定PE SIZE `vgcreate -s 8M myvg2 /dev/sdb{6,7}`, 默认为4M, 红帽系统默认PE为32M

> PE值可以设定很大支持GB,TB级别

#### 查看

    [root@localhost centos]# vgs
    VG   #PV #LV #SN Attr   VSize VFree
    myvg   2   0   0 wz--n- 3.99g 3.99g

    [root@localhost centos]# vgscan
    Reading volume groups from cache.
    Found volume group "myvg" using metadata type lvm2

查看一个PE的大小, PE SIZE为4M

    [root@localhost centos]# vgdisplay
    --- Volume group ---
    VG Name               myvg
    System ID             
    Format                lvm2
    Metadata Areas        2
    Metadata Sequence No  1
    VG Access             read/write
    VG Status             resizable
    MAX LV                0
    Cur LV                0
    Open LV               0
    Max PV                0
    Cur PV                2
    Act PV                2
    VG Size               3.99 GiB
    PE Size               4.00 MiB
    Total PE              1022
    Alloc PE / Size       0 / 0   
    Free  PE / Size       1022 / 3.99 GiB
    VG UUID               yLkVC4-ef62-eOZl-9V0c-8GBL-DGka-2Eyl9D

比较PV的变化, PE Total不一样了

    [root@localhost centos]# pvdisplay /dev/sdb6
    --- Physical volume ---
    PV Name               /dev/sdb6
    VG Name               myvg
    PV Size               2.00 GiB / not usable 4.00 MiB
    Allocatable           yes 
    PE Size               4.00 MiB
    Total PE              511
    Free PE               511
    ...

    # 未使用到VG中
    [root@localhost centos]# pvdisplay /dev/sdb8
    "/dev/sdb8" is a new physical volume of "2.00 GiB"
    --- NEW Physical volume ---
    PV Name               /dev/sdb8
    VG Name               
    PV Size               2.00 GiB
    Allocatable           NO
    PE Size               0   
    Total PE              0
    Free PE               0
    ...

而且PV中也有标识分区属于哪个VG

    [root@localhost centos]# pvs
    PV         VG   Fmt  Attr PSize PFree
    /dev/sdb5       lvm2 ---  2.00g 2.00g
    /dev/sdb6  myvg lvm2 a--  2.00g 2.00g
    /dev/sdb7  myvg lvm2 a--  2.00g 2.00g
    /dev/sdb8       lvm2 ---  2.00g 2.00g

#### 删除

vgremove

    vgremove myvg

> vg删除操作危险性性高, 小心操作

#### 缩减

vgreduce VG卷名 PV盘区名

缩小VG 意味着里面的PE数据可能要移除, 因而VG中的PV的PE必须要挪出到其他PV中

> pvmove是移动数据, 把物理盘区的数据移动到其他设备, pvremove是删除覆盖数据

第一步, 移动PV数据到其他盘区

    pvmove /dev/sdb6

    [root@localhost centos]# pvscan
    PV /dev/sdb6   VG myvg            lvm2 [2.00 GiB / 2.00 GiB free]
    PV /dev/sdb7   VG myvg            lvm2 [2.00 GiB / 2.00 GiB free]
    PV /dev/sdb5                      lvm2 [2.00 GiB]
    PV /dev/sdb8                      lvm2 [2.00 GiB]
    Total: 4 [7.99 GiB] / in use: 2 [3.99 GiB] / in no VG: 2 [4.00 GiB]

    [root@localhost centos]# pvmove /dev/sdb6
    No data to move for myvg

第二步, 缩减VG

    vgreduce myvg /dev/sdb6
   
    [root@localhost centos]# vgreduce myvg /dev/sdb6
    Removed "/dev/sdb6" from volume group "myvg"
    [root@localhost centos]# pvscan
    PV /dev/sdb7   VG myvg            lvm2 [2.00 GiB / 2.00 GiB free]
    PV /dev/sdb6                      lvm2 [2.00 GiB]
    PV /dev/sdb5                      lvm2 [2.00 GiB]
    PV /dev/sdb8                      lvm2 [2.00 GiB]
    Total: 4 [8.00 GiB] / in use: 1 [2.00 GiB] / in no VG: 3 [6.00 GiB]

第三部, 可选操作, 永久删除pv

    pvremove /dev/sdb6

#### 扩展VG

相对VG而言, PV来自哪个磁盘不重要, 扩展是缩减都是非常灵活的

    [root@localhost centos]# vgextend myvg /dev/sdb6
    Volume group "myvg" successfully extended
    [root@localhost centos]# pvs
    PV         VG   Fmt  Attr PSize PFree
    /dev/sdb5       lvm2 ---  2.00g 2.00g
    /dev/sdb6  myvg lvm2 a--  2.00g 2.00g
    /dev/sdb7  myvg lvm2 a--  2.00g 2.00g
    /dev/sdb8       lvm2 ---  2.00g 2.00g

> PV只有在加入到VG后才能确认PE的大小, 所以PV的创建无法看见PE的大小值

<a name='lv'></a>
### LV

lvcreate, lvremvoe, lvextend, lvreduce, lvresize, lvs, lvdisplay

#### 创建

lvcreate -n LV_NAME -L 10G VG_NAME

```
    -L|--size
```

创建50M的LV

```
[root@localhost centos]# lvcreate -L 50M -n mylv myvg
  Rounding up size to full physical extent 52.00 MiB
  Logical volume "mylv" created.

```

#### 查看

lv的查看是比较特殊的, 因为设备路径是在vg下的文件, 如/dev/myvg/mylv

```
[root@localhost centos]# lvs
  LV   VG   Attr       LSize  Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  mylv myvg -wi-a----- 52.00m  
[root@localhost centos]# lvscan
  ACTIVE            '/dev/myvg/mylv' [52.00 MiB] inherit
[root@localhost centos]# lvdisplay /dev/myvg/mylv 
  --- Logical volume ---
  LV Path                /dev/myvg/mylv
  LV Name                mylv
  VG Name                myvg
  LV UUID                zRe1Q0-5Q5v-dMYN-RuMg-OMc1-6Gsz-quaoPp
  LV Write Access        read/write
  LV Creation host, time localhost.localdomain, 2017-12-21 09:34:47 -0800
  LV Status              available
  # open                 0
  LV Size                52.00 MiB
  Current LE             13
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     8192
  Block device           253:0
```

#### 挂载LV卷

第一步 需要把LV想象为物理分区, 格式化LV文件系统

```
[root@localhost centos]# mke2fs -j /dev/myvg/mylv 
mke2fs 1.42.9 (28-Dec-2013)
Filesystem label=
OS type: Linux
Block size=1024 (log=0)
Fragment size=1024 (log=0)
...
```

第二步 挂载

    [root@localhost centos]# mount /dev/myvg/mylv /media

查看磁盘信息, 发现其设备名称在maooer/myvg-mylv, 其实这是一个软链接

    [root@localhost centos]# df | grep media
    /dev/mapper/myvg-mylv     47463     859     43942   2% /media

> 其实, 最终都是指向了同一个dev设备

    [root@localhost centos]# ll /dev/mapper/myvg-mylv 
    lrwxrwxrwx. 1 root root 7 Dec 21 09:41 /dev/mapper/myvg-mylv -> ../dm-0
    [root@localhost centos]# ll /dev/dm-0 
    brw-rw----. 1 root disk 253, 0 Dec 21 09:41 /dev/dm-0

    [root@localhost centos]# ll /dev/myvg/mylv 
    lrwxrwxrwx. 1 root root 7 Dec 21 09:41 /dev/myvg/mylv -> ../dm-0

#### 移除

lvremove

lvremove 卷路径

lvremvoe /dev/myvg/mylv
lvremove /dev/mapper/myvg-mylv

>  挂载中的逻辑卷是不能直接移除的

移除后数据就没了, 相当于分区的移除

```
[root@localhost centos]# umount /media/
[root@localhost centos]# lvremove /dev/myvg/mylv 
Do you really want to remove active logical volume myvg/mylv? [y/n]: y
  Logical volume "mylv" successfully removed
```

#### 扩展

lvextend, 扩展LV卷大小, 物理边界

    # 扩展到20G
    lvextend -L 20G /dev/myvg/mylv
    # 增加3G
    lvextend -L +3G /dev/myvg/mylv

resize2fs(ext2, ext4), 逻辑边界

    resize2fs /dev/myvg/mylv 5G
    # 通常地和-p结合, 表示物理边界有多大空间, 能用多少就用多少
    resize2fs -p /dev/myvg/mylv

创建一个2G大小的lv, 文件系统ext3, 并且开机可自动挂载到/users目录, 扩展LV大小到3G

```
[root@localhost centos]# lvcreate -L 2G -n testlv myvg

[root@localhost centos]# lvs
  LV     VG   Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  testlv myvg -wi-a----- 2.00g 

[root@localhost centos]# mkdir /users
[root@localhost centos]# tail -n 1 /etc/fstab 
/dev/myvg/testlv			/users			ext3	defaults,acl	0 0
[root@localhost centos]# mke2fs -j /dev/myvg/testlv
# 重新读取/etc/fstab, 立刻挂载分区
[root@localhost centos]# mount -a

扩展
 未扩展前
[root@localhost /]# df -lh | grep testlv
/dev/mapper/myvg-testlv  2.0G  3.1M  1.9G   1% /users

 扩展物理边界
[root@localhost /]# lvextend -L 3G /dev/myvg/testlv
  Size of logical volume myvg/testlv changed from 2.00 GiB (512 extents) to 3.00 GiB (768 extents).
  Logical volume myvg/testlv successfully resized.
 查看lvs大小已经变更为3G
[root@localhost /]# lvs
  LV     VG   Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  testlv myvg -wi-ao---- 3.00g 
 分区依然还是2G(逻辑边界)
[root@localhost /]# df -h | grep testlv
/dev/mapper/myvg-testlv  2.0G  3.1M  1.9G   1% /users

 开始扩展逻辑边界
[root@localhost /]# resize2fs -p /dev/myvg/testlv 
resize2fs 1.42.9 (28-Dec-2013)
Filesystem at /dev/myvg/testlv is mounted on /users; on-line resizing required
old_desc_blocks = 1, new_desc_blocks = 1
The filesystem on /dev/myvg/testlv is now 786432 blocks long.
 再次查看, 逻辑边界已经扩展到了3G
[root@localhost /]# df -h | grep testlv
/dev/mapper/myvg-testlv  2.9G  3.1M  2.8G   1% /users
```

> 分为两个步骤, 既要扩展LV(物理边界), 也要扩展文件系统(逻辑边界), resize2fs只对ext文件系统作用


#### 缩减

缩减过程和扩展刚号相反, 风险非常高

注意：

* 不能在线缩减，得先卸载；
* 确保缩减后的空间大小依然能存储原有的所有数据；
* 在缩减之前应该先强行检查文件，以确保文件系统处于一至性状态；

    resize2fs /dev/myvg/testlv 2G
    lvreduce -L 2G /dev/myvg/testlv

确认空间缩减后不能小于2.1M, 是否挂载等

    [root@localhost /]# df -h | grep testlv
    /dev/mapper/myvg-testlv  2.9G  3.1M  2.8G   1% /users

确保卸载成功

    [root@localhost /]# umount /users
    [root@localhost /]# mount | grep testlv

强行文件系统检查

    [root@localhost centos]# e2fsck -f /dev/myvg/testlv 
    e2fsck 1.42.9 (28-Dec-2013)
    第一步: 检查inode,块,和大小
    第二步: 检查目录结构
    第3步: 检查目录连接性
    Pass 4: Checking reference counts
    第5步: 检查簇概要信息
    /dev/myvg/testlv: 12/196608 files (0.0% non-contiguous), 29518/786432 blocks

缩减逻辑边界

    [root@localhost centos]# resize2fs /dev/myvg/testlv 2G
    resize2fs 1.42.9 (28-Dec-2013)
    Resizing the filesystem on /dev/myvg/testlv to 524288 (4k) blocks.
    The filesystem on /dev/myvg/testlv is now 524288 blocks long.

缩减物理边界,系统有提示可能会有风险

    [root@localhost centos]# lvreduce -L 2G /dev/myvg/testlv 
    WARNING: Reducing active logical volume to 2.00 GiB.
    THIS MAY DESTROY YOUR DATA (filesystem etc.)
    Do you really want to reduce myvg/testlv? [y/n]: y
    Size of logical volume myvg/testlv changed from 3.00 GiB (768 extents) to 2.00 GiB (512 extents).
    Logical volume myvg/testlv successfully resized.

重新挂载, 并且可以看见文件无损坏

    [root@localhost centos]# mount -a
    [root@localhost centos]# df -lh | grep testlv
    /dev/mapper/myvg-testlv  2.0G  3.1M  1.9G    1% /users

#### 快照卷

* 生命周期为整个数据时长；在这段时长内，数据的增长量不能超出快照卷大小,否则会自我销毁
* 快照卷应该是只读的；
* 跟原卷在同一卷组内；

lvcreate

    -s 快照卷
    -p 权限 r|w

    lvcreate -L 2G -n SLV_NAME -p r /dev/myvg/testlv

为testlv创建快照卷1G的快照卷(一般选择为一样大小, 这里仅为实验)
```
[root@localhost users]# lvcreate -L 1G -n lv_snap -s -p r /dev/myvg/testlv
  Using default stripesize 64.00 KiB.
  Logical volume "lv_snap" created.

[root@localhost users]# lvs
  LV      VG   Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  lv_snap myvg sri-a-s--- 1.00g      testlv 0.00                                   
  testlv  myvg owi-aos--- 2.00g 
```

> 应该挂载快照卷的大小, 权限, 对应的快照源LV

挂载快照卷, 发现, 新建的快照卷上已经有数据内容, 默认为只读挂载

    [root@localhost users]# mkdir /lv_snap
    [root@localhost users]# mount /dev/myvg/lv_snap /lv_snap/
    mount: /dev/mapper/myvg-lv_snap 写保护，将以只读方式挂载
    [root@localhost users]# cd /lv_snap/
    [root@localhost lv_snap]# ll
    总用量 20
    -rw-r--r--. 1 root root   511 12月 22 06:34 inittab
    drwx------. 2 root root 16384 12月 22 06:29 lost+found

现在对源LV卷的inittab文件进行编辑修改, 发现快照卷的内容并没有发生变更, 因而目前这样使用还不是完全备份+增量备份机制

移除快照卷

    umount /lv_snap
    lvremove /dev/myvg/lv_snap