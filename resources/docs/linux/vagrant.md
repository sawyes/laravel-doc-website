# vagrant

- [简介](#intro)
- [安装](#install)
- [卸载](#uninstall)

<a name='intro'></a>
## 简介

[Vagrant(主页)]()让我们可以通过代码的方式快速地、可重复地创建针对不同虚拟环境的虚拟机，包括Virtualbox、AWS、Docker等。它使得我们可以一次性地、自动创建多个环境相同的虚拟机，对于软件开发和测试尤其有用

<a name='install'></a>
## 安装

### 在线安装

查看box类型, 并选择合适的box[下载1](https://app.vagrantup.com/boxes/search)[下载2](http://www.vagrantbox.es/)

    mkdir centos7
    cd centos7
    vagrant box add centos/7 
    vagrant init centos/7
    vagrant up 
    
实例 
    
    $ vagrant box add centos/7
    ==> box: Loading metadata for box 'centos/7'
        box: URL: https://vagrantcloud.com/centos/7
    This box can work with multiple providers! The providers that it
    can work with are listed below. Please review the list and choose
    the provider you will be working with.
    
    1) hyperv
    2) libvirt
    3) virtualbox
    4) vmware_desktop
    
    Enter your choice: 3
    ==> box: Adding box 'centos/7' (v1710.01) for provider: virtualbox
        box: Downloading: https://vagrantcloud.com/centos/boxes/7/versions/1710.01/providers/virtualbox.box
        box:
    ==> box: Successfully added box 'centos/7' (v1710.01) for 'virtualbox'!

    
由于伟大的墙, 这个速度会有点慢, 可以记录下其中的url, 然后用迅雷下载
    
### 离线安装

首先手动下载一个box
    
    cd /path/to/box
    vagrant box add metadata.json
    
修改matadata.json

    {
        "name": "laravel/homestead",
        "versions": [{
            "version": "2.1.0",
            "providers": [{
                "name": "virtualbox",
                "url": "virtualbox.box"
            }]
        }]
    }

* name为vagrant box list中将要显示的名称
* versions->version 为显示的版本号
* versions->providers->name 包含了虚拟机驱动, 可以为vmware, virtualbox
* versions->providers->url 为导入的box路径

<a name='uninstall'></a>
## 卸载

### 方法一(推荐)

销毁虚拟机镜像box, 不销毁vagrant box

1. 关闭虚拟机软件
2. vagrant box 启动目录(vagrant init folder)

```
vagrant destroy -f
```

### 方法二

查看已创建的所有虚拟机

    vagrant global-status 

根据上面的命令

    vagrant destroy [vm_id]
    
### 销毁vagrant box
执行销毁虚拟机命令后，box文件仍然是存在的(这一步非必要,除非你想连box也删除,以后都不安装了)

    vagrant box list
    
    vagrant box remove laravel/homestead
    
    vagrant box remove laravel/homestead --box-version 0.2.7

### 删除不干净

以homestead为例

1. 打开 VirtualBox,手动删除虚拟机
2. 找到虚拟机文件保存目录(~/VirtualBox VMs),删除
3. 清空vagrant项目文件夹(homestead),重新github


## 简单命令
    
    vagrant version

    vagrant box list
    
    vagrant box add laravel/homestead
    vagrant box add laravel/homestead --box-version=0.3.3
    
    vagrant init
    
    vagrant up
    vagrant up --provision
    
    vagrant relaod
    vagrant reload --provision
    
    vagrant halt
    vagrant provision
    
    vagrant ssh
    
### 启动调试

    vagrant up --debug
    
### 开启Virtual GUI调试

Vagrantfile配置

    vb.gui = true    



## 打包分发

当你配置好开发环境后，退出并关闭虚拟机。在终端里对开发环境进行打包：
    
    $ vagrant package
   
打包完成后会在当前目录生成一个 `package.box` 的文件，将这个文件传给其他用户，其他用户只要添加这个 box 并用其初始化自己的开发目录就能得到一个一模一样的开发环境了。

添加方法：

假设我们拿到的 box 存放路径是 ~/box/package.box，在终端里输入

    $ vagrant box add mydev ~/box/package.box  # 添加 package.box 镜像并命名为 hahaha
    $ cd ~/dev  # 切换到项目目录
    $ vagrant init mydev  # 用 hahaha 镜像初始化。
    
## 安装插件

vagrant-vbguest

    vagrant plugin install vagrant-vbguest
    vagrant plugin list
    
vagrant-share

    vagrant plugin install vagrant-share
    
    

    
    
    