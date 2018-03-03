# Kibana

- [安装](#install)
- [配置](#config)
- [安装x-pack](#x-pack)
    - [配置monitoring](#config-monitoring)

[官方ELK文档](https://www.elastic.co/guide/index.html)

<a name="install"></a>
## 安装

注意安装之前请确认es可以正常访问

[官网下载Kibana](https://www.elastic.co/cn/downloads/kibana)

[官网安装教程](https://www.elastic.co/guide/en/kibana/current/install.html)

[官网RPM安装教程](https://www.elastic.co/guide/en/kibana/current/rpm.html)


### 离线下载方式安装

    yum install -y kibana-6.0.0-x86_64.rpm
    
    rpm -ql kibana | grep kibana.yml
    /etc/kibana/kibana.yml

官方说明配置非常简单, 设置绑定kibana服务的ip, 以及es访问url即可`vim /etc/kibana/kibana.yml`
    
    server.host: "192.168.116.11"
    elasticsearch.url: "http://192.168.116.11:9200"

设置kibana开机启动
    
    systemctl daemon-reload
    systemctl enable kibana
    systemctl start kibana
    
    ss -tnl | grep 5601
    
访问url, 默认为5601端口
```
    http://192.168.116.11:5601
```

<a name="config"></a>
## 配置文件

[官网配置介绍](https://www.elastic.co/guide/en/kibana/6.2/settings.html)

<a name="x-pack"></a>
## 安装x-pack

[柴少鹏的官方网站-X-PACK安装资料](http://www.51niux.com/?id=210)

[kibana中安装X-PACK](https://www.elastic.co/guide/en/kibana/6.2/installing-xpack-kb.html)

[X-PACK安全介绍](https://www.elastic.co/guide/en/x-pack/6.2/security-getting-started.html)

[es中X-PACK的 api](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/xpack-api.html)


X-PACK安装完毕，将在kibana侧边导航增加3个页面

* Machine Learning
* Graph
* Monitoring


安装前置条件

<img src='/assets/img/XpackInstallationFlow.jpg'>


根据安装介绍， 需要找到kibana的kibana-plugin的运行目录

```
rpm -ql kibana | grep kibana-plugin

/usr/share/kibana/bin/kibana-plugin

cd /usr/share/kibana
```

安装教程安装即可, 安装过程中有提示下载的地址

```
bin/kibana-plugin install x-pack
```

或者离线安装, 下载地址`https://artifacts.elastic.co/downloads/packs/x-pack/x-pack-6.2.2.zip`

```
bin/kibana-plugin install file:///path/to/file/x-pack-6.2.2.zip
```

设置kibana的用户名和密码，此处密码在elasticsearch中的xpack插件有配置
```
elasticsearch.username: "kibana"
elasticsearch.password: "kibanapassword"
```

<a name="confg-monitoring"></a>
### 配置monitoring

[配置monitoring](https://www.elastic.co/guide/en/kibana/6.2/monitoring-xpack-kibana.html)






























