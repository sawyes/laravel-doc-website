# logstash

- [安装](#install)

<a name='#install'></a>
## 安装

### JAVA

已经存在JAVA环境可忽略此步骤

    yum install -y java
    
更改JAVA_HOME

    echo "export JAVA_HOME=/usr" >> /etc/profile.d/java.sh


### logstash

    yum install -y logstash-6.0.0.rpm 

添加logstash环境变量
    
    # 无结果
    whereis logstash
    rpm -ql | grep logstash/bin
    vim /etc/profile.d/logstash.sh
    
    export PATH=/usr/share/logstash/bin:$PATH
    
### 测试

    input {
        stdin: {}
    }
    
    output {
        stdout: {
            codec: rubydebug
        }
    }
    




