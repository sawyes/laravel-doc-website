# Kibana

- [安装](#安装)

<a name="kibana"></a>
## Kibana

注意安装之前请确认es可以正常访问
官网下载[Kibana](https://www.elastic.co/cn/downloads/kibana)

    yum install -y kibana-6.0.0-x86_64.rpm
    
    rpm -ql kibana | grep kibana.yml
    /etc/kibana/kibana.yml

配置非常简单, 设置服务主机名, 以及es访问url

    server.host: "192.168.116.11"
    elasticsearch.url: "http://192.168.116.11:9200"

重启服务

    systemctl enable kibana
    systemctl start kibana
    
    ss -tnl | grep 5601
    
访问url
```
    http://192.168.116.11:5601
```
