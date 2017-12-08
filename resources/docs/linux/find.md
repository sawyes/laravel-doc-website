# 文件查找(locate|find)

- [locate](#locate)
    - [手动建立索引](#locate-index)
    - [常用操作](#locate-option)
- [find](#find)
    - [格式](#find-formar)
    - [匹配标准](#find-options)
    - [组合条件](#find-condition)
    - [查找动作](#find-action)
    - [xargs](#xargs)
- [练习](#test)

<a name='locate'></a>
## locate

非实时,根据系统数据进行模糊匹配查找,优势在于速度快

<a name='locate-index'></a>
### 手动建立索引

更新数据库索引, 默认地最近创建的文件无法查找, 所以必须先得索引

    updatedb

<a name='locate-option'></a>
### 常用操作

    locate -A 搜索所有数据库
    locate -b redis 字符匹配 搜索文件名含有redis的文件(不是路径)
    locate --regexp 'etc.*redis.*f' 正则匹配
    locate -i REDIS 忽略大小写匹配
    locate -e redis.conf 仅显示locate数据库中存在,同时文件在系统中也存在的文件

<a name='find'></a>
## find

<a name='find-format'></a>
### 格式

find 路径 查找标准 查找动作

    查找路径：**默认为当前目录**
    查找标准：默认为指定路径下的所有文件
    处理运作：默认为显示
    find /sbin /usr/sbin -executable \! -readable -print
    find /home/{user1,user2}/log -name *.log

> 默认地输入find, 即可列出当前目录所有文件,包括目录子文件

权限报错可以用数据黑洞接收

    find /etc/ -name "passwd" 2> /dev/null


<a name='find-options'></a>
### 匹配标准

```
-name 'FILENAME'：对**文件名**作精确匹配
    文件名通配：
        *：任意长度的任意字符
        ?
        []
    find /etc/ -name "passwd"

-iname 'FILENAME': 文件名匹配时不区分大小写
-regex PATTERN：基于正则表达式进行文件名匹配

-user USERNAME: 根据属主查找
find / -user vagrant
-group GROUPNAME: 根据属组查找
-uid UID: 根据UID查找, 文件原本属于A, A用户被删除了, 文件属主变为A的id值
-gid GID: 根据GID查找

-nouser：查找没有属主的文件, 需要定时脚本处理, 重新指定属主
-nogroup: 查找没有属组的文件

-type 文件类型筛选
    f: 普通文件
    d: 目录
    c: 字符设备
    b: 块设备
    l: 符号链接
    p: 管道设备
    s: 套接设备socket
find -type s
find -type d -name redis

-size [+|-] 文件大小筛选
    #k
    #M
    #G
find -size 20M
find -size +20M
    
```

<a name='find-condition'></a>	
### 组合条件

```
-a     并且
-o     或者
-not   非

# 查找home目录下无属主的文件
find /home -nouser -a -type f

-mtime       
-ctime
-atime
    [+|-]#    + 表示多少天内, -表示多少天以前, 无符号表示刚好5天
# 5天内有变更的文件
find /home/ -mtime +5
-mmin
-cmin
-amin
    [+|-]#
    
-perm MODE：精确匹配
    /MODE: 任意一位匹配即满足条件
    -MODE: 文件权限能完全**包含**此MODE时才符合条件
    
    -644
    644: rw-r--r--
    755: rwxr-xr-x
    750: rwxr-x---
```

<a name='find-action'></a>
### 查找动作

**非常有用的exec**

> {}表示原有文件名的引用(占位符)

	-print: 显示
	-ls：类似ls -l的形式显示每一个文件的详细
	-ok COMMAND {} \; 每一次操作都需要用户确认
	-exec COMMAND {} \;

    # 查找/home/peter目录非root属主文件,并且变更属主为vagrant
    find /home/peter/ -not -user root -exec chown vagrant:vagrant {} \;
    find -name redis -ls

<a name='xargs'></a>
#### xargs

xargs - build and execute command lines from standard input

    find / -size +100M | xargs echo >> /tmp/large.file
    find /home/{vagrant,peter} -name *.log | xargs rm -fr

<a name='test'></a>
## 练习

    1、查找/var目录下属主为root并且属组为mail的所有文件；
    find /var -user root -group mail

    2、查找/usr目录下不属于root,bin,或student的文件；
    find /usr -not -user root -a -not -user bin -a -not -user student
    find /usr -not \( -user root -o -user bin -o -user student \)

    3、查找/etc目录下最近一周内内容修改过且不属于root及student用户的文件；
    find /etc -mtime -7 -not \ ( -user root -o -user student \)
    find /etc -mtime -7 -not -user root -a -not -user student


    4、查找当前系统上没有属主或属组且最近1天内曾被访问过的文件，并将其属主属组均修改为root；
    find / \( -nouser -o -nogroup \) -a -atime -1 -exec chown root:root {} \; 

    5、查找/etc目录下大于1M的文件，并将其文件名写入/tmp/etc.largefiles文件中；
    find /etc -size +1M >> /tmp/etc.largefiles

    6、查找/etc目录下所有用户都没有写权限的文件，显示出其详细信息；
    find /etc -not -perm /222 -ls	


