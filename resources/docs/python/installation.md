# python 安装指南

- [安装pip-scrapy](#install)
    - [centos](#centos)
    - [windows](#windows)
- [豆瓣源](#doubanio)


<a name='install'></a>
## 安装

<a name='centos'></a>
### centos

centos 7, 非必要步骤

    yum install epel-release
    yum makecache

linux 一般自带python, 检查python 版本

    python -V
    
    yum -y install python-devel
    yum -y install libevent-devel
    yum -y install gcc
    
#### pip安装
    
pip是一个安装和管理Python包的工具,python安装包的工具有easy_install,setuptools,pip,distribute等

distribute是setuptools的替代品, 而pip是easy_install的替代品。

* [pypi官网](https://pypi.python.org/pypi/pip)下载

* yum 安装


yum 安装前请确认已经配置epel镜像源

```
yum -C search python | grep pip
yum -y install python2-pip

pip -V

对安装好的pip进行升级 
pip install --upgrade pip
```

#### 安装scrapy

    pip install scrapy
    
    scrapy version
    
如果出现如下报错, 意味着 `Twisted` 包安装不成功, 请检查`python-devel`, `libevent-devel`, `gcc`是否安装成功
    
    ...
    unable to execute gcc: No such file or directory
        error: command 'gcc' failed with exit status 1
    Command "/usr/bin/python2 -u -c "import setuptools, tokenize;__file__='/tmp/pip-build-DImeUI/Twisted/setup.py';f=getattr(tokenize, 'open', open)(__file__);code=f.read().replace('\r\n', '\n');f.close();exec(compile(code, __file__, 'exec'))" install --record /tmp/pip-GHssWT-record/install-record.txt --single-version-externally-managed --compile" failed with error code 1 in /tmp/pip-build-DImeUI/Twisted/

<a name='windows'></a>
### windows

[python下载](https://www.python.org/downloads/)


下载完毕即可直接安装, 记得勾选默认`环境变量`, 默认地window版本已经包含了`pip`

打开cmd窗口

    python -V
    pip -V

#### 安装scrapy

    pip install scrapy
    
如果出现报错, 请到[兼容window编译的python](https://www.lfd.uci.edu/~gohlke/pythonlibs/#twisted)查找对应版本的安装包(`32/64`)

    pip install /path/to/pywin32

    pip install /path/to/Twisted-17.9.0-cp36-cp36m-win_amd64.whl





<a name='doubanio'></a>
## 豆瓣源

https://pypi.doubanio.com/simple/


    pip install -i https://pypi.doubanio.com/simple/ sentry


http 源不安全`--trusted-host`添加信任参数即可

    pip install web.py -i http://pypi.douban.com/simple --trusted-host pypi.douban.com


如果想配置成默认的源，方法如下：

需要创建或修改配置文件（一般都是创建），

    linux的文件在~/.pip/pip.conf，
    
    windows在%HOMEPATH%\pip\pip.ini），

文件配置如下

    [global]
    index-url = https://pypi.douban.com/simple






