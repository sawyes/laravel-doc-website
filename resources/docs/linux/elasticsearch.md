# Elasticsearch
- [简介](#intro)
- [环境搭建](#elasticsearch)
    - [安装](#es-install)
    - [配置](#es-config)
    - [启动](#es-start)
- [集群](#cluster)
    - [搭建集群](#cluster-create)
    - [查询 集群健康API health](#cluster-health)
    - [查询 集群状态API state](#cluster-state)
    - [查询 集群统计数据API stats](#cluster-stats)
    - [查询 集群挂起的任务API](#cluster-pending-tasks)
    - [Reroute分片管理](#cluster-reroute)
    - [_search_shards](#_search_shards)
- [插件](#plugins)
    - [安装方式](#plugins-install)
- [API](#api)
    - [查询格式](#api-fommat)
    - [查询帮助](#api-help)
    - [自定义查询](#api-custom)
- [CURD](#api-curd)
    - [创建文档](#doc-create)
    - [查看文档](#doc-read)
    - [更新文档](#doc-update)
    - [删除](#doc-delete)
    - [查看ES所有索引](#doc-indices)
    - [explain](#doc-explain)
- [mapping](#mapping)
    - [routing](#routing)
    - [all](#all)

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

```
Relational DB -> Databases -> Tables -> Rows -> Columns
Elasticsearch -> Indices -> Types -> Documents -> Fields
```

Shay Banon(ES作者), Daug Cutting(hadoop之父, lucense作者)为ES做出杰出贡献

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

第一步: 安装JDK

第二部: 安装Elasticsearch

#### 什么是JDK/JRE/JVM
java jdk 可以多版本共存, 一般而言直接下载安装即可

* JDK 1.7 是JAVA 7, JDK是JRE的超集`java-1.6.0-openjdk-devel.x86_64`, 用于开发
* JRE JAVA运行时环境`java-1.7.0-openjdk.x86_64`, 是JVM的实施实现
* JVM JAVA虚拟机, JDK和JRE都包含了JVM, 从而使得我们可以运行JAVA程序

##### 安装JDK
    
    # 最新版本
    yum install java

安装Java jdk环境, 具体版本要求需要到[ES官网](www.elastic.co)确认, 官方推荐Oracle JDK

如果你对以下内容熟悉, 直接看[Elasticsearch安装步骤](#es-install-now)

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

    echo "export JAVA_HOME=/usr" >> /etc/profile.d/java.sh
    
安装java devel

    yum install java-*-devel

<a name='es-install-now'></a>
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

* systemctl daemon-reload #重启进程
* systemctl enable elasticsearch.service #开机启动服务
* systemctl start elasticsearch.service #启动服务


查询rpm包依赖
```
rpm -ql elasticsearch
```
 
<a name='es-config'></a>
### 配置

配置文件: `/etc/elasticsearch/elasticsearch.yml`

[配置文档](https://www.elastic.co/guide/en/elasticsearch/reference/index.html)

```
cluster.name: test-es
node.name: host1.test.com
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 192.168.116.11
discovery.zen.ping.unicast.hosts: ["192.168.116.11", "192.168.116.12", "192.168.116.13"]
```

* cluster.name # 集群名称
* node.name #节点名称
* network.host # 服务绑定地址
* discovery.zen.ping.unicast.hosts # 集群发现, 单播主机地址列表


默认地, `9300`负责集群事务, `9200`负责提供检索服务

<a name='es-start'></a>
### 启动

Elasticsearch已经准备就绪，执行以下命令可在前台启动

    systemctl stop elasticsearch.service
    systemctl daemon-reload
    systemctl enable elasticsearch.service
    systemctl start elasticsearch.service
    systemctl status elasticsearch.service

检查9200 9300

    ss -tnl | egrep "9200|9300"

查看集群协商数据包

    tcpdump -i ens33 -nn tcp port 9300

对ES进行测试

    curl 'http://192.168.116.11:9200/?pretty'
    
你可能看到如下信息

    {
      "name" : "host1.test.com",
      "cluster_name" : "test-es",
      "cluster_uuid" : "7KDE8RYKTrOBsYJZaYhNwQ",
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


查询ES状态, ES是基于JAVA环境的, JAVA调优(`/etc/elasticsearch/java.options`)

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

elasticsearch 5.0后已经整合到x-pack

Marvel是Elasticsearch的管理和监控工具, 可在Elasticsearch目录中运行以下命令来下载和安装：

    ./bin/plugin -i elasticsearch/marvel/latest

你可能想要禁用监控，你可以通过以下命令关闭Marvel：

    echo 'marvel.agent.enabled: false' >> ./config/elasticsearch.yml

<a name='cluster'></a>
## 集群

<a name="cluster-create"></a>
### 搭建集群

三台主机host1, host2, host3 配置ES集群 

    host1 192.168.116.10
    host2 192.168.116.11
    host3 192.168.116.12

此处默认已经安装JDK环境, 已经配置网络环境, elasticsearch可正常启动的情况

elasticsearch配置如下:

```
#host1
cluster.name: test-es
node.name: host1.test.com
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 192.168.116.11
discovery.zen.ping.unicast.hosts: ["192.168.116.11", "192.168.116.12", "192.168.116.13"]

#host2
cluster.name: test-es 
node.name: host2.test.com
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 192.168.116.12
discovery.zen.ping.unicast.hosts: ["192.168.116.11", "192.168.116.12", "192.168.116.13"]

#host3
cluster.name: test-es 
node.name: host3.test.com
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 192.168.116.13
discovery.zen.ping.unicast.hosts: ["192.168.116.11", "192.168.116.12", "192.168.116.13"]
```

如果不希望某节点参与master选举
```
node.master: false
```

ES启动过程有点慢, 可以查看`/var/log/elasticsearch/{cluster_name}.log`日志, 查看服务是否启动完毕

检查9300端口数据通讯过程

    tcmpdump -i ens33 -nn tcp port 9300

<a name="cluster-health"></a>
### 集群健康API health

    http://192.168.116.11:9200/_cluster/health?pretty

<a name="cluster-state"></a>
### 集群状态API state

格式

    curl -XGET "http://localhost:9200/_cluster/state/{metrics}/{indeices}"

检查集群节点, v表示详细信息(多了标题行)

    curl "http://192.168.116.11:9200/_cat/nodes?v"

    curl "http://192.168.116.11:9200/_cluster/stats?pretty&human"


通过构建url的metrics可以深入获取json数据如: state->version


    curl "http://192.168.116.11:9200/_cluster/state/version?pretty"
    
    curl "http://192.168.116.11:9200/_cluster/state/state_uuid,master_node,routing_table?pretty"
    
    只返回foo,bar索引的所有信息
    curl "http://192.168.116.11:9200/_cluster/state/_all/foo,bar"

<a name="cluster-stats"></a>
### 集群统计数据API stats

查询创建索引, 更新mapping, allocate shards(分配中的分片)等所有未执行的任务

    curl "http://192.168.116.11:9200/_cluster/stats/?pretty"
    
<a name="cluster-pending-tasks"></a>
### 集群挂起的任务API

    curl "http://192.168.116.11:9200/_cluster/pending_tasks"

<a name="cluster-reroute"></a>
### Cluster Reroute

elasticsearch可以通过reroute api来手动进行索引分片的分配。分片位置控制
 
不过要想完全手动，必须先把`cluster.routing.allocation.disable_allocation`参数设置为true，禁止es进行自动索引分片分配，否则你从一节点把分片移到另外一个节点，那么另外一个节点的一个分片又会移到那个节点。

#### 移动（move）
 
把分片从一节点移动到另一个节点。可以指定索引名和分片号。 

#### 取消（cancel） 

取消分配一个分片。可以指定索引名和分片号。node参数可以指定在那个节点取消正在分配的分片。allow_primary参数支持取消分配主分片。 

#### 分配（allocate） 

分配一个未分配的分片到指定节点。可以指定索引名和分片号。node参数指定分配到那个节点。allow_primary参数可以强制分配主分片，不过这样可能导致数据丢失。 

[官方示例](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-reroute.html)


    GET _cluster/reroute
    {
      "commands": [
        {
          "move": {
            "index": "students",
            "shard": 0,
            "to_node": "_pgV8mzzQby7cABIcjGS8w",
            "from_node": "M2vg-bZdQ160OiCGkqI7_w"
          }
        }
      ]
    }
    
执行成功, 返回信息中迁移分片状态为`RELOCATING`

应用场景, 10个分片分别指定路由存储不同的数据, 但是其中一个分片特别大, 这个时候可以考虑移动分片储存位置

<a name="_search_shards"></a>
### _search_shards

查看分片在集群中的分布分布

    GET students/_search_shards/

<a name='plugins'></a>
## 插件
<a name='plugins-install'></a>
### 安装方式

#### 方式一
直接将插件放置于`plugins目录`中即可, 不同的插件可能安装放置目录不一样

    # 查询rpm包依赖
    rpm -ql elasticsearch | grep plugins
    /usr/share/elasticsearch/plugins
    
#### 方式二
使用elasticsearch自带的`plugin程序`脚本进行安装
    
    rpm -ql elasticsearch | grep "bin.*plugin"
    /usr/share/elasticsearch/bin/elasticsearch-plugin

旧版本

     /usr/share/elasticsearch/bin/plugin
     # 帮助信息
     /usr/share/elasticsearch/bin/plugin -h
      -l 显示插件列表
      -i ,--install
      -r 卸载插件
     
    /usr/share/elasticsearch/bin/plugin -i marvel -u file:///root/maravel.zip            

#### 旧版本的插件

http://localhost:9200/_plugin/plugin_name

* marvel
* bigdesk
* head
* kopf


<a name="api"></a>
## API

四类Restful API:

* 检查集群/节点/索引状态
* 管理集群/节点/缩影及源数据
* CURD操作
* 高级操作, 如paging, filetering

ES访问接口: TCP 9200

<a name='api-fommat'></a>
### 查询格式

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
    
    curl -XGET http://192.168.116.11:9200?pretty
    curl http://192.168.116.11:9200

<a name='api-help'></a>
### 查询帮助
#### help
help表示查询该API的详细帮助

    curl "http://192.168.116.11:9200/_cat/nodes?help"

#### human

    GET _cluster/state?human
    
#### v

查看包含详细的表头信息

    GET _cat/indices?v

#### pretty

美化JSON结果格式

    GET students/_settings?pretty

<a name='api-custom'></a>
### 自定义查询

默认地查询信息非常有效, 通过`help`API查询, 可以获取更多的查询信息

* h 是head
* v 详细信息

```
curl "http://192.168.116.11:9200/_cat/nodes?help"
curl "http://192.168.116.11:9200/_cat/nodes?h=name,ip,master,uptime,disk.used,heap.current&v"

name           ip             master uptime disk.used heap.current
host1.test.com 192.168.116.11 -       27.5m     1.4gb       96.9mb
host3.test.com 192.168.116.13 *        3.7h     1.4gb       83.5mb
host2.test.com 192.168.116.12 -       27.3m     1.4gb       87.5mb
```    

<a name='api-curd'></a>
## CURD

<a name='doc-create'></a>
### 创建文档

格式: {indices}/{types}/{id}

索引不存在的情况下, 自动创建文档

    curl -XPUT '192.168.116.11:9200/students/class1/1?pretty' -d '
    {
      "first_name": "Rong",
      "last_name": "Huang",
      "gender": "Female",
      "age": 23,
      "courses": "Luoying Shenjian"
    }'
    
返回数据, 自动创建了索引students

    {
      "_index": "students",
      "_type": "class1",
      "_id": "1",
      "_version": 1,
      "result": "created",
      "_shards": {
        "total": 2,
        "successful": 2,
        "failed": 0
      },
      "_seq_no": 0,
      "_primary_term": 1
    }
    
一个索引可以包含多个type, 并且遵循scheme free


<a name='doc-read'></a>
### 查看文档

格式: {indices}/{types}/{id}

    curl "192.168.116.11:9200/students/class1/1?pretty"
    {
      "_index" : "students",
      "_type" : "class1",
      "_id" : "1",
      "_version" : 3,
      "found" : true,
      "_source" : {
        "first_name" : "Rong",
        "last_name" : "Huang",
        "gender" : "Female",
        "age" : 23,
        "courses" : "Luoying Shenjian"
      }
    }   

只查看文档数据

    GET /students/class1/1/_source?pretty
    {
      "first_name": "Rong",
      "last_name": "Huang",
      "gender": "Female",
      "age": 23,
      "courses": "Luoying Shenjian",
    }

<a name='doc-update'></a>
### 更新文档

更新操作, doc的version则会+1

#### PUT覆盖更新

当id值已经存在, 则`完全替换`未现有文档数据, 方法和创建一致

    curl -XPUT '192.168.116.11:9200/students/class1/1?pretty' -d '
    {
      "first_name": "Rong",
      "last_name": "Chen",
      "gender": "Female",
      "age": 23,
      "courses": "Luoying Shenjian"
    }'

#### POST部分更新   

更新字段不存在则创建, 否则覆盖指定字段, 注意 doc 结构是必须的

    curl -XPOST '192.168.116.11:9200/students/class1/2/_update?pretty' -d '
    {
      "doc": {
        "age": 22
      }
    }'
 
<a name='doc-delete'></a>
### 删除

删除文档

    curl -XDELETE '192.168.116.11:9200/students/class1/1'

删除索引
    
    curl -XDELETE '192.168.116.11:9200/students'

<a name='doc-indices'></a>
### 查看ES所有索引

通过_cat API 你能了解到当前集群每个索引的主分片数(pri), 备份数(rep), 文档统计, 存储大小等信息    
   
    GET /_cat/indices?v
    health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
    green  open   students V-vS6GXHQMSnEiv94XwBZg   5   1          2            0     24.9kb         12.4kb
    green  open   .kibana  A3DqtyamRNOcNaQEGD8kJg   1   1          1            0      7.3kb          3.6kb


<a name='doc-explain'></a>
### explain

查看文档信息, 如匹配和分片位置

    GET students/students/_search
    {
      "query": {
        "term": {
          "_id": {
            "value": "1"
          }
        }
      }, 
      "explain":true
    }

explain 查询语句

    {
      "took": 20,
      "timed_out": false,
      "_shards": {
        "total": 5,
        "successful": 5,
        "skipped": 0,
        "failed": 0
      },
      "hits": {
        "total": 1,
        "max_score": 1,
        "hits": [
          {
            "_shard": "[students][3]",
            "_node": "ma5Nf6RpRmS817IHNZ2t_w",
            "_index": "students",
            "_type": "students",
            "_id": "1",
            "_score": 1,
            "_source": {
              "explain": true
            },
            "_explanation": {
              "value": 1,
              "description": "ConstantScore(_id:[fe 1f])",
              "details": []
            }
          }
        ]
      }
    }

<a name='mapping'></a>
## mapping

<a name='routing'></a>
### routing

路由可以控制数据存储分片位置, 默认地公式为 `hash(_routing) % number_of_shards`

当不指定路由值默认使用_id作为路由

往指定路由存两条数据

    PUT test/test/1?routing=A
    {
      "name":"steven"
    }
     PUT test/test/2?routing=A
    {
      "name":"jobs"
    }
    
查看结果, 此时可以看见无论_id为什么, 数据存储都在A路由

    GET test/test/_search
    {
      "explain": true
    }

    结果
    {
     "_shard": "[test][1]",
     ...
        "_id": "1",
        "_score": 1,
        "_routing": "A",
     ...
      ...
         "_id": "2",
         "_score": 1,
         "_routing": "A",
      ...

    }

测试, 指定路由查询
    
    GET test/test/_search?routing=A
    {
      "query": {
        "match": {
          "name": "steven"
        }
      }, 
      "explain": true
    }

在A 路由上能获取对应的结果 steven, 如果我们枚举路由0-9, 像下面这样

    GET test/test/_search?routing=1
    GET test/test/_search?routing=2
    GET test/test/_search?routing=3
    GET test/test/_search?routing=4
    GET test/test/_search?routing=5
    {
      "query": {
        "match": {
          "name": "steven"
        }
      }, 
      "explain": true
    }

你会很惊奇的发现, 有部分数字路由可以获取到查询结果, 有部分不可以, 其中的原因在前面提及的分布式算法hash取模上,当hash路由值得到的余数和A路由得到的余数相等, ES都会路由到对应的分片, 而分片刚好存储了这条数据, 所以可以返回匹配的数据

> 因而可以确定, 路由值不是唯一的, 只有hash余数相等, 都可以到达对应分片

此时, 我们明确一个事情, 数据是存储在分片上的, 路由提供数据存储分片的路径信息, 精准的分片路由控制, 合理分类数据, 不尝为一种优化查询方法

至此路由和分片的关系已经非常清晰

<a name='all'></a>
### _all

all 是一个字符串类型字段, 是一个特殊的包含所有内容的默认字段, 需要额外的计算周期, 如果你确定不需要分析all字段, 可以通过配置mapping设置关闭

    PUT test
    {
      "mappings": {
        "_default_":{
          "_all": {
            "enabled":false
          }
        },
        "test" : {
          "_all": {
            "enabled": false
          }, 
          "properties": {
            
            "name":{
              "type": "keyword"
            }
          }
        }
      }
    }

需要注意`_default_`默认设置只能在其往后新建的类型生效, 已经设置的不能再改变














