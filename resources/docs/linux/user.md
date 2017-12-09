# 用户管理
- [权限管理底层](#what-happen)
- [特殊权限](#special-permission)
    - [SUID](#suid)
    - [SGID](#sgid)
    - [Sticky](#sticky)
- [FACL](#facl)
    - [getfacl](#getfacl)
    - [setfacl](#setfacl)
    - [effective](#effective)
    - [Default ACL](#default-acl)
    - [chacl](#chacl)
    
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

默认情况下获取文件的访问规则

    peter@homestead:/tmp/test$ touch filename
    peter@homestead:/tmp/test$ getfacl filename
    # file: filename
    # owner: peter
    # group: peter
    user::rw-
    group::rw-
    other::r--
    peter@homestead:/tmp/test$ ll filename 
    -rw-rw-r-- 1 peter peter 0 Dec  8 16:22 filename

授权vagrant用户具有rwx权限

    peter@homestead:/tmp/test$ setfacl -m u:vagrant:rwx filename

下面我们用getfacl来看定义了FACL规则文件

    peter@homestead:/tmp/test$ getfacl filename 
    # file: filename
    # owner: peter
    # group: peter
    user::rw-
    user:vagrant:rwx
    group::rw-
    mask::rwx
    other::r--

我们发现group::rw-在linux文件系统组的权限竟然为rwx(未授权vagrant为rw-), 授权用户权限, 组权限却变了

    peter@homestead:/tmp/test$ ll filename
    -rw-rwxr--+ 1 peter peter 33 Dec  8 16:28 filename*

'+' 号, 表示这是一个FACL文件

* 疑问点: 属主peter只有rw权限, peter授权vagrant, vagrant拥有rwx权限, 那么peter,vagrant对文件filename的执行权限如何

答案: **惊奇的是没有执行权限的peter, 成功让vagrant用户拥有执行权限**, peter用户只有rw权限, 会被系统deny

* 疑问点: 属组peter的其他用户对filename执行权限如何?

答案: **同组(peter)也无法执行filename文件**, 因为rwx权限不再表示同组权限, 而是FACL的mask权限, peter组的权限依然为rw

> 结论 如果一个文件设置了FACL(+号文件), 我们都需要通过getfacl来确认权限, 以免发生混淆

基础知识

    // 这个是文件权限
    ACL_USER_OBJ：相当于Linux里file_owner的permission 

    ACL_USER：定义了额外的用户可以对此文件拥有的permission 

    // 这个是文件权限
    ACL_GROUP_OBJ：相当于Linux里group的permission 

    ACL_GROUP：定义了额外的组可以对此文件拥有的permission 

    ACL_MASK：定义了ACL_USER, ACL_GROUP_OBJ和ACL_GROUP的最大权限 (这个我下面还会专门讨论) 

    // 这个是文件权限
    ACL_OTHER：相当于Linux里other的permission

继续, 设置文件filename的mask为read only



<a name='setfacl'></a>
### setfacl

> 默认复制不理会ACL属性, 这里特意说明, cp  -p  可以复制文件或目录的acl规则到新的位置

选项

```
--mask：重新计算有效权限，即使ACL mask被明确指定。
-m(--modify): 修改文件或目录的规则
    u:UID:perm
    g:GID:perm
-x(--remove): 删除ACL规则
    u:UID
    g:GID

-b,--remove-all：删除所有扩展的acl规则，基本的acl规则(所有者，群组，其他）将被保留。 
-k,--remove-default：删除缺省的acl规则。如果没有缺省规则，将不提示。 
-n，--no-mask：不要重新计算有效权限。setfacl默认会重新计算ACL mask，除非mask被明确的制定。 
 
-d，--default：设定默认的acl规则。 
--restore=file：从文件恢复备份的acl规则（这些文件可由getfacl -R产生）。通过这种机制可以恢复整个目录树的acl规则。此参数不能和除--test以外的任何参数一同执行。 
--test：测试模式，不会改变任何文件的acl规则，操作后的acl规格将被列出。 
-R，--recursive：递归的对所有文件及目录进行操作。
-L，--logical：跟踪符号链接，默认情况下只跟踪符号链接文件，跳过符号链接目录。 
-P，--physical：跳过所有符号链接，包括符号链接文件。
```

授权其他用户对文件具有访问权限

    setfacl -m u:user1:r filename

设置mask为read

    setfacl -m mask::r-- filename 
<a name='effective'></a>
### effective

继续上述操作, 变更mask权限由rwx到r--

    peter@homestead:/tmp/test$ setfacl -m mask::r-- filename 
    peter@homestead:/tmp/test$ ll filename
    -rw-r--r--+ 1 peter peter 33 Dec  8 16:28 filename
    peter@homestead:/tmp/test$ getfacl filename
    # file: filename
    # owner: peter
    # group: peter
    user::rw-
    user:vagrant:rwx		#effective:r--
    group::rw-			#effective:r--
    mask::r--
    other::r--

组权限变为了r--, 是和mask对应的, 这点没变

mask的含义是设置最大权限, 超过权限的都会被屏蔽, 这个就是effective的意义

此时vagrant 不具有执行权限了

<a name='default-acl'></a>
### Default Acl

> 作用于目录, 目录下的文件自动使用目录的默认ACL

举个例子, root用户创建了一个目录

    root@homestead:/tmp# mkdir dir
    root@homestead:/tmp# getfacl --omit-header dir
    user::rwx
    group::r-x
    other::r-x

默认ACL个i这, 设置用户peter对dir目录拥有rw权限

    root@homestead:/tmp# setfacl -d -m u:peter:rw dir
    root@homestead:/tmp# getfacl dir
    # file: dir
    # owner: root
    # group: root
    user::rwx
    group::r-x
    other::r-x
    default:user::rwx
    default:user:peter:rw-
    default:group::r-x
    default:mask::rwx
    default:other::r-x

这个操作, 用户希望dir文件夹下创建的任何文件, peter都默认拥有rw权限, 可以看到, 默认dir目录下的文件都用上了FACL(即便复制过来的文件也会默认用上这个规则)

    root@homestead:/tmp# cd dir
    root@homestead:/tmp/dir# touch test
    root@homestead:/tmp/dir# getfacl --omit-header test 
    user::rw-
    user:peter:rw-
    group::r-x			#effective:r--
    mask::rw-
    other::r--

<a name='chacl'></a>
### chacl

可以彻底删除文件或目录的ACL属性, 包括Default ACL

    chacl -B filename

默认地, setfacl -x 删除的acl属性还会有 '+' 号