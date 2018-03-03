# logstash

- [安装](#install)
    - [安装测试](#logstash-test)
- [使用logstash解析日志](#parse-log)



[产品官网](https://www.elastic.co/products/logstash)

[官方ELK文档](https://www.elastic.co/guide/index.html)

[官网安装教程](https://www.elastic.co/guide/en/logstash/current/installing-logstash.html)

[官网安装教程](https://www.elastic.co/guide/en/logstash/current/installing-logstash.html)

[ELK第三方博客收录](http://www.51niux.com/?cate=44)


<a name='install'></a>
## 安装

### JAVA

已经存在JAVA环境可忽略此步骤

    yum install -y java
    
更改JAVA_HOME

    echo "export JAVA_HOME=/usr" >> /etc/profile.d/java.sh


### 离线安装

[下载页面](https://www.elastic.co/downloads/logstash)

    yum install -y logstash-6.0.0.rpm 

添加logstash环境变量
    
    # 无结果
    whereis logstash
    rpm -ql | grep logstash/bin
    vim /etc/profile.d/logstash.sh
    
    export PATH=/usr/share/logstash/bin:$PATH
    
    source /etc/profile.d/logstash.sh
    
启动

    systemctl start logstash.service
    
    ps aux | grep logstash

    ss -an | grep 9600
    
<a name='logstash-test'></a>
### 安装测试

[检索重置更新logstash](https://www.elastic.co/guide/en/logstash/6.2/logging.html)

    curl -XGET '127.0.0.1:9600/_node/logging?pretty'

[测试你的安装](https://www.elastic.co/guide/en/logstash/current/first-event.html), 手动输入hello world

    cd logstash-6.2.2
    bin/logstash -e 'input { stdin { } } output { stdout {} }'
    
    控制台输入hello world
    输出：2018-02-26T00:59:28.849Z host2.test.com hello world

测试配置是否正确

    bin/logstash -f first-pipeline.conf --config.test_and_exit

    input {
        beats {
            port => "5044"
        }
    }
    # The filter part of this file is commented out to indicate that it is
    # optional.
    # filter {
    #
    # }
    output {
        stdout { codec => rubydebug }
    }


-w  指定线程,默认是 cpu 核数 

-f  指定配置文件 

-t  测试配置文件是否正常 

-b  执行 filter 模块之前最大能积累的日志,数值越大性能越好,同时越占内存


<a name='parse-log'></a>
## 使用logstash解析日志

根据自己的需求在对应的位置配置 [输入插件](https://www.elastic.co/guide/en/logstash/current/input-plugins.html)、[过滤器插件](https://www.elastic.co/guide/en/logstash/current/filter-plugins.html)、[输出插件](https://www.elastic.co/guide/en/logstash/current/output-plugins.html) 和 [编码解码插件](https://www.elastic.co/guide/en/logstash/current/codec-plugins.html) 即可。

### input

测试
```
input{
    stdin{
    }
}
output{
    elasticsearch {
        hosts => "192.168.255.11:9200" 
        index => "logstash-test"
        user => "elastic"
        password => "elastic"
    }
    stdout{
        codec=>rubydebug
    }
}

```

手动输入字符串，此时应在elastic能看见对应的索引

#### beat 例子

经测试

```
input{
    beats {
        port=> 5044
	    type => "logs"
    }       
}

output{
    elasticsearch {
        hosts => "192.168.255.11:9200" 
        index => "%{[@metadata][beat]}-%{+YYYY.MM.dd}"
        user => "elastic"
        password => "elastic"
    }
    stdout{
        codec=>rubydebug
    }
}

```

启动程序监听
    
    serivice logstash restart
    logstash -f beats-input.conf
    
    ...
    [INFO ] 2018-02-27 10:37:15.574 [[main]-pipeline-manager] beats - Beats inputs: Starting input listener {:address=>"0.0.0.0:5044"}
    [INFO ] 2018-02-27 10:37:15.638 [[main]<beats] Server - Starting server on port: 5044
    ...

客户端filebeat    [官方教程](https://www.elastic.co/guide/en/beats/filebeat/master/filebeat-installation.html)   [下载](https://www.elastic.co/guide/en/beats/filebeat/current/setup-repositories.html)
    
    egrep -v  '#|^$' /etc/filebeat/filebeat.yml
        filebeat.prospectors:
        - type: log
          enabled: true
          paths:
            - /var/log/nginx/dc.access_log 
        filebeat.config.modules:
          path: ${path.config}/modules.d/*.yml
          reload.enabled: false
        setup.template.settings:
          index.number_of_shards: 3
        setup.kibana:
          host: "192.168.255.133:5601"
          username: "elastic"
          password: "elastic"
          
        #output.elasticsearch:
          #hosts: ["localhost:9200"]  
        # 客户端发送日志到logstash  
        output.logstash:
          hosts: ["192.168.255.12:5044"]

注： 如需要直接连接es, 则修改配置项的`output.elasticsearch`

启用|查看nginx[filebeat模块](https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-module-nginx.html),此处为官方配置模板，可选，如不需要跳过此处
    
    filebeat modules enable nginx 
    filebeat modules list
    filebeat setup -e
    filebeat -e

客户端启动filebeat

    filebeat -e -c /etc/filebeat/filebeat.yml  

此时`filebeat`收集的日志将发送到`logstash`，在存储到`elasticsearch`

#### file 例子

```
input {
    # file为常用文件插件，插件内选项很多，可根据需求自行判断
    file {
        path => "/var/lib/mysql/slow.log"
        # 要导入的文件的位置，可以使用*，例如/var/log/nginx/*.log
        Excude =>”*.gz”
        # 要排除的文件
        start_position => "beginning"
        # 从文件开始的位置开始读,end表示从结尾开始读
        ignore_older => 0  
        # 多久之内没修改过的文件不读取，0为无限制，单位为秒
        sincedb_path => "/dev/null"
        # 记录文件上次读取位置，输出到null表示每次都从文件首行开始解析
        type => "mysql-slow"
        # type字段，可表明导入的日志类型
    }   
}
```

#### redis 例子
```
input {

    # redis插件为常用插件，插件内选项很多，可根据需求自行判断
    redis {
        batch_count => 1 
        # EVAL命令返回的事件数目，设置为5表示一次请求返回5条日志信息
        data_type => "list" 
        # logstash redis插件工作方式
        key => "logstash-test-list" 
        # 监听的键值
        host => "127.0.0.1" 
        # redis地址
        port => 6379 
        # redis端口号
        password => "123qwe" 
        # 如果有安全认证，此项为认证密码
        db => 0 
        # 如果应用使用了不同的数据库，此为redis数据库的编号，默认为0。
        threads => 1 
        # 启用线程数量
      }
}
```










