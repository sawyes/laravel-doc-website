# Elasticsearch
- [简介](#intro)
- [环境搭建](#elasticsearch)
    - [安装](#es-install)
    - [配置](#es-config)
    - [启动](#es-start)
- [基本使用](#usage)
    - [查询](#select)
    

<a name='intro'></a>
## 为了搜索,你懂的

现在大部分数据库在提取可用知识方面显得异常无能。它们能够通过时间戳或者精确匹配做过滤，但是它们能够进行全文搜索，处理`同义词`和根据`相关性`给`文档打分`吗？它们能根据同一份数据生成`分析`和`聚合`的结果吗？最重要的是，它们在没有大量工作进程（线程）的情况下能做到对`数据的实时处理`吗？

Elasticsearch鼓励你浏览并利用你的数据，而不是让它烂在数据库里，因为在数据库里实在太难查询了。

### 什么是ES

Elasticsearch是一个基于`Apache Lucene(TM)`的开源搜索引擎。无论在开源还是专有领域，Lucene可以被认为是迄今为止最
先进、性能最好的、功能最全的搜索引擎库。

* 分布式的实时文件存储，每个字段都被索引并可被搜索
* 分布式的实时分析搜索引擎
* 可以扩展到上百台服务器，处理PB级结构化或非结构化数据

### 应用场景
它用于全文搜索、结构化搜索、分析以及将这三者混合使用：
* 维基百科使用Elasticsearch提供全文搜索并高亮关键字，以及输入实时搜索(search-as-you-type)和搜索纠错(did-youmean)等搜索建议功能。
* 英国卫报使用Elasticsearch结合用户日志和社交网络数据提供给他们的编辑以实时的反馈，以便及时了解公众对新发表
的文章的回应。
* StackOverflow结合全文搜索与地理位置查询，以及more-like-this功能来找到相关的问题和答案。
* Github使用Elasticsearch检索1300亿行的代码。


而且，所有的这些功能被集成到一个服务里面，你的应用可以通过简单的 RESTful API 、各种语言的客户端甚至命令行与之
交互。

上手Elasticsearch非常容易。它提供了许多合理的缺省值，并对初学者隐藏了复杂的搜索引擎理论。它`开箱即用`（安装即可
使用），只需很少的学习既可在生产环境中使用。

<a name='elasticsearch'></a>
## 环境搭建

<a name='es-install'></a>
### 安装

#### JAVA环境
java jdk 可以多版本共存, 一般而言直接下载安装即可

* JDK 1.7 是JAVA 7, JDK是JRE的超集`java-1.6.0-openjdk-devel.x86_64`, 用于开发
* JRE JAVA运行时环境`java-1.7.0-openjdk.x86_64`, 是JVM的实施实现
* JVM JAVA虚拟机, JDK和JRE都包含了JVM, 从而使得我们可以运行JAVA程序



##### 检查版本
安装Java jdk环境, 具体版本要求需要到[ES官网](www.elastic.co)确认, 官方推荐Oracle JDK

    echo $JAVA_HOME
    
    查看java程序路径
    which java
    /usr/bin/java
    
    了解多版本JAVA, 怎么确定程序路径
    ls -l `which java`
    lrwxrwxrwx. 1 root root 22 Dec  1 09:29 /usr/bin/java -> /etc/alternatives/java
    ls -l /etc/alternatives/java
    rwxrwx. 1 root root 71 Dec  1 09:29 /etc/alternatives/java -> /usr/lib/jvm/java-1.8.0-openjdk-1.8.0.102-4.b14.el7.x86_64/jre/bin/java

    java -version
    openjdk version "1.8.0_102"
    OpenJDK Runtime Environment (build 1.8.0_102-b14)
    OpenJDK 64-Bit Server VM (build 25.102-b14, mixed mode)

对于java而言, 需要设置$JAVA_HOME为你的程序路径    

yum 检查jdk版本
    
    yum makecache
    yum list all | grep jdk
    
更改JAVA_HOME

    vim /etc/profile.d/java.sh
    export JAVA_HOME=/usr
    
安装java devel

    yum install java-*-devel

#### 安装ES

官网下载最新版的ES, 本文时为ES6.0版本, `yum install elasticsearch-6.0.0.rpm`也可以安装, 解决依赖问题

    [root@mytest ~]# rpm -ivh elasticsearch-6.0.0.rpm 
    warning: elasticsearch-6.0.0.rpm: Header V4 RSA/SHA512 Signature, key ID d88e42b4: NOKEY
    Preparing...                          ################################# [100%]
    Creating elasticsearch group... OK
    Creating elasticsearch user... OK
    Updating / installing...
       1:elasticsearch-0:6.0.0-1          ################################# [100%]
    ### NOT starting on installation, please execute the following statements to configure elasticsearch service to start automatically using systemd
     sudo systemctl daemon-reload
     sudo systemctl enable elasticsearch.service
    ### You can start elasticsearch service by executing
     sudo systemctl start elasticsearch.service


<a name='es-config'></a>
### 配置

配置文件: `/etc/elasticsearch/elasticsearch.yml`

[配置文档](https://www.elastic.co/guide/en/elasticsearch/reference/index.html)

最基本的默认集群名称需要修改

    [root@mytest elasticsearch]# grep -v '#' elasticsearch.yml 
    cluster.name: my-test
    node.name: learn-es1
    path.data: /var/lib/elasticsearch
    path.logs: /var/log/elasticsearch

默认地, `9300`负责集群事务, `9200`负责提供检索服务

<a name='es-start'></a>
### 启动

Elasticsearch已经准备就绪，执行以下命令可在前台启动

    cd /etc/elasticsearch/
    systemctl daemon-reload
    systemctl enable elasticsearch.service
    systemctl start elasticsearch.service
    
检查9200 9300

    ss -tnl

对ES进行测试

    curl 'http://localhost:9200/?pretty'
    
你可能看到如下信息

    {
      "name" : "learn-es1",
      "cluster_name" : "my-test",
      "cluster_uuid" : "t6ZgLTzXRqqrFKdMx1WAYA",
      "version" : {
        "number" : "6.0.0",
        "build_hash" : "8f0685b",
        "build_date" : "2017-11-10T18:41:22.859Z",
        "build_snapshot" : false,
        "lucene_version" : "7.0.1",
        "minimum_wire_compatibility_version" : "5.6.0",
        "minimum_index_compatibility_version" : "5.0.0"
      },
      "tagline" : "You Know, for Search"
    }

查询ES状态, ES是基于JAVA环境的, JAVA调优

    systemctl status elasticsearch.service 
    
    ● elasticsearch.service - Elasticsearch
       Loaded: loaded (/usr/lib/systemd/system/elasticsearch.service; enabled; vendor preset: disabled)
       Active: active (running) since Thu 2017-12-28 06:05:38 PST; 8min ago
         Docs: http://www.elastic.co
     Main PID: 9653 (java)
       CGroup: /system.slice/elasticsearch.service
               └─9653 /bin/java -Xms1g -Xmx1g -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCMSInitiatingOccupancyOnly -XX:+AlwaysPreT...
    
    Dec 28 06:05:38 mytest.com systemd[1]: Started Elasticsearch.
    Dec 28 06:05:38 mytest.com systemd[1]: Starting Elasticsearch...
    
> 注意防火墙iptables不要禁用

<a name='marvel'></a>
### 安装Marvel

Marvel是Elasticsearch的管理和监控工具, 可在Elasticsearch目录中运行以下命令来下载和安装：

    ./bin/plugin -i elasticsearch/marvel/latest

你可能想要禁用监控，你可以通过以下命令关闭Marvel：

    echo 'marvel.agent.enabled: false' >> ./config/elasticsearch.yml


<a name='usage'></a>
## 使用

四类Restful API:

* 检查集群/节点/索引状态
* 管理集群/节点/缩影及源数据
* CURD操作
* 高级操作, 如paging, filetering

ES访问接口: TCP 9200

查询格式

    curl -X<VERB> '<PROTOCOL>://<HOST>/<PATH>?<QUERY_STRING>' -d '<BODY>'
    
* VERB HTTP方法： GET , POST , PUT , HEAD , DELETE
* PROTOCOL http或者https协议（只有在Elasticsearch前面有https代理的时候可用）
* HOST Elasticsearch集群中的任何一个节点的主机名，如果是在本地的节点，那么就叫localhost
* PORT Elasticsearch HTTP服务所在的端口，默认为9200
* QUERY_STRING 一些可选的查询请求参数，例如 ?pretty 参数将使请求返回更加美观易读的JSON数据
* BODY 一个JSON格式的请求主体（如果请求需要的话） 

举例说明，为了计算集群中的文档数量，我们可以这样做：

    curl -XGET 'http://localhost:9200/_count?pretty' -d '
    {
    "query": {
        "match_all": {}
        }
    }
    '

Elasticsearch返回一个类似 200 OK 的HTTP状态码和JSON格式的响应主体（除了 HEAD 请求）。上面的请求会得到如下的
JSON格式的响应主体：

    {
        "count" : 0,
        "_shards" : {
            "total" : 5,
            "successful" : 5,
            "failed" : 0
        }
    }


查询测试
    
    curl -XGET http://127.0.0.1:9200?pretty
    curl http://127.0.0.1:9200








