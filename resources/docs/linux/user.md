# 用户管理
- [权限管理底层](#what-happen)
- [特殊权限](#special-permission)
    - [SUID](#suid)
    - [SGID](#sgid)
    - [Sticky](#sticky)
- [FACL](#facl)
    - [getfacl](#getfacl)
    - [setfacl](#setfacl)
    - [操作实例](#facl-example)

<a name='what-happen'></a>
## 权限管理底层

* 命令权限启动流程

ls命令属主,属组为root, 同组和其他用户可读可执行 

    [root@localhost centos]# ls -al /bin/ls
    -rwxr-xr-x. 1 root root 117656 Nov  5  2016 /bin/ls

当非root用户调用ls命令, 此时, ls命令产生的权限属主属组不再是root, 而是启动者自身

如: hadoop用户启动touch命令创建的文件, 则会以hadoop的身份结合umask去创建, 文件属主属组为hadoop

* 权限认证流程

```
owner -> facl:user -> group -> facl:group -> other
```

<a name='special-permission'></a>
## 特殊权限

* SUID 运行某程序时，相应进程的属主是程序文件自身的属主，而不是启动者
* SGID 运行某程序时，相应进程的属组是程序文件自身的属组，而不是启动者所属的基本组
* Sticky 在一个公共目录，每个都可以创建文件，删除自己的文件，但不能删除别人的文件

```
    chmod u+s  
        g+s   #仅仅指定组
        o+t
```

<a name='suid'></a>
### SUID

每个用户都需要变更自身密码, 但是shadow 除了root其他用户均无权限的特殊文件,
    
    [root@localhost centos]# ls -al /etc/shadow
    ----------. 1 root root 1329 Dec  6 09:25 /etc/shadow

passwd命令具有suid权限,非root用户执行passwd命令, 不再按正常流程以用户的身份启动, 而是文件属主身份, 即root身份执行命令(参考:[权限管理底层](#what-happen))

    [root@localhost centos]# ll /bin/passwd 
    -rwsr-xr-x. 1 root root 27832 Jun  9  2014 /bin/passwd

<a name='guid'></a>
### SGID

需求1: test目录为共享目录,hive和hbase用户都可以对里面的文件编辑, 可以删除任意同组文件

    # 创建组dev, 控制同组用户权限, 使test具有dev组权限
    groupadd dev
    useradd hive
    useradd hbase
    # 追加附加组dev到hive和hbase
    usermod hive -a -G dev
    usermod hbase -a -G dev
    mkdir test
    # 让test目录中的属组具有写权限
    chmod 775 test
    # 设置test目录属组dev
    chown :dev test
    # 为test目录增加特殊权限(用ls观察)
    chmod g+s test
    ############ 测试 ###############
    分别登陆hive和hbash, 创建文件, 文件属主为各自用户, 文件属组为dev, 可以删除任意dev组创建的文件

> 特点, 必须要为用户设置相同属组且与父目录同属组, 父目录为guid权限

<a name='sticky'></a>
### Sticky

需求2: 共享目录下, 用户只能删除属主为自身的文件

    chmod o+t test

<a name='facl'></a>
## FACL

Filesystem Access Control List 文件系统访问列表

利用文件扩展保存额外的访问控制权限, 实现一个文件多个用户访问

<a name='getfacl'></a>
### getfacl

    vagrant@homestead:~$ getfacl test.sh
    # file: test.sh
    # owner: vagrant
    # group: vagrant
    user::rwx
    group::r-x
    other::r-x

<a name='setfacl'></a>
### setfacl

setfacl -m u:username:rwx test.sh

```
--mask 指定
-m: 设定
    u:UID:perm
    g:GID:perm
-x：取消
    u:UID
    g:GID
```

> 知识确认: 设置的权限能超过自身吗?

<a name='facl-example'></a>
### 操作实例
默认地, peter用户无法修改test.sh, Permission denied

    peter@homestead:/home/vagrant$ echo "hello world" >> test.sh
    bash: test.sh: Permission denied

vagrant用户修改test.sh, 多了一下user:peter:rw-

```
vagrant@homestead:~$ setfacl -m u:peter:rw test.sh
vagrant@homestead:~$ getfacl test.sh 
# file: test.sh
# owner: vagrant
# group: vagrant
user::rwx
user:peter:rw-
group::r-x
mask::rwx
other::r-x

vagrant@homestead:~$ su peter
# 此时peter用户写入成功
peter@homestead:/home/vagrant$ echo "hello world" >> test.sh
```

取消文件访问列表

    setfacl -x u:peter test.sh 











