# yum

- [缓存](#cache)
- [自建yum仓库](#custom-yum-respositroy)
- [epel仓库](#epel-respositroy)

<a name='cache'></a>
## 缓存

缓存服务器包信息, 加快搜索速度
    
    # 缓存信息
    yum makecache
    
    # 搜索
    yum -C search htop
    
    # 查看详情
    yum -C info htop

<a name='custom-yum-respositroy'></a>
## 自建yum仓库

插入CentOS ISO光驱

    挂载光驱
    mkdir -p /media/cdrom
    mount /dev/cdrom /media/cdrom
    
    变更Base仓库(需要联网查找,因而先停用)
    mv /media/yum.repos.d/CentOS-Base.repo /media/yum.repos.d/CentOS-Base.repo.bak
    设置enable=1, 其他不变
    grep -v "#" /etc/yum.repos.d/CentOS-Media.repo 
    [c7-media]
    name=CentOS-$releasever - Media
    baseurl=file:///media/CentOS/
            file:///media/cdrom/
            file:///media/cdrecorder/
    gpgcheck=1
    enabled=1
    gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CentOS-7
    
    更新yum源
    yum clean all
    yum list
    测试安装vim工具
    yum search vim
    yum -y install vim

<a name='epel-respositroy'></a>
## 第三方软件库

EPEL(Extra Packages for Enterprise Linux)是由Fedora Special Interest Group维护的Enterprise Linux（RHEL、CentOS）中经 常用到的包。

    # 确认安装包信息
    yum info epel-release
    
    # 安装
    yum install -y epel-release
    
    # 把服务器的包信息下载到本地电脑缓存起来
    yum makecache
    
    # 默认仓库是没有supervisor, elep仓库有, 测试是否可以寻找此软件
    yum -C info supervisor
    yum -C search supervisor
    
[清华大学开源软件站](https://mirrors.tuna.tsinghua.edu.cn/help/epel/)