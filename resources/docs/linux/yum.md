# yum

- [自建yum仓库](#custom-yum-respositroy)

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

