# 新建文档库指南

- [目录结构](#directory-instruction)
- [新建项目文档](#new-document)
    - [documentation](#documentation)
    - [installation](#installation)
- [清除文档缓存](#clear-cache)

<a name="directory-instruction"></a>
## 目录结构

首先你得理解, 所有文档库, 保存在resources/docs下

```
resources
    docs
        master
        5.2
        5.3
        ...
```

<a name="new-document"></a>
## 新建项目文档

创建文档库文件夹

> resources/docs/project_name

创建菜单文件和默认加载文件

```
documentation.md
installation.md
```

<a name="documentation"></a>
### documentation.md 文档库目录菜单索引

菜单文件, 文档库导航文件, 必要文件

内容形如:

```code
    - 前言
        - [前言](/docs/{{version}}/installation)
    - 首次使用
        - [新建文档指南](/docs/{{version}}/new)
        ...
```

* version 当前文档占位符, 无需修改

目录内容对应文件夹内md文件

如 前言 installation 目录, 对应地存在installation.md

<a name="installation"></a>
### installation.md 介绍

此文件用于渲染默认打开的页面内容, 必要文件, 文件内容无具体要求

内容形如
```code
# 前言

- [说明](#intor)
- [环境要求](#server-requirements)

<a name="intor"></a>
## 说明

<a name="server-requirements"></a>
## 环境要求

...

```

> "##" 才会出现"#"大标记二级标题, 注意a标签的属性为name

### 添加导航链接

路由地址格式，其中master为version
> http://your.app/docs/master/new

修改文件 app/Documentation.php，在右上角，添加文档库链接入口

```
    /**
     * Get the publicly available versions of the documentation
     *
     * @return array
     */
    public static function getDocVersions()
    {
        return [
            'master' => 'Master',
            '5.4' => '5.4',
            'linux' => 'linux',
            'psr' => 'psr',
            'ES6' => 'ES6',
            '5.3' => '5.3',
            '5.2' => '5.2',
        ];
    }
```

<a name="clear-cache"></a>
## 清除文档缓存

文档显示就会生成缓存文件,因而在写作的时候十分不方便, 需要设置定时缓存清理

* 在计划任务中添加定时清理缓存任务


```
* * * * * php /home/vagrant/Code/dt/artisan docs:clear-cache >> /dev/null 2>&1
* * * * * php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 5; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 10; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 15; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 20; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 25; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 30; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 35; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 40; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 45; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 50; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
* * * * * sleep 55; php /home/vagrant/Code/dt/artisan cache:clear >> /dev/null 2>&1
```


* 缓存文件路径

```
public/page-cache/docs/
```

* 浏览器缓存强制刷新
