# 开机启动

- [rc.local](#rc.local)
- [init.d](#init.d)


rc.local和init.d都可以操作开机启动项

<a name="rc.local"></a>
## rc.local

rc.local文件头部/bin/sh修改为/bin/bash, 注意: 一定要将命令添加在exit 0之前。里面可以直接写命令或者执行Shell脚本文件sh。

> 如果是执行sh文件，那么要赋予执行权限sudo chmod +x xxx.sh，然后启动时加上sudo sh xxx.sh

```
chmod +x /etc/rc.local

exec 2> /var/log/rc.local  # send stderr from rc.local to a log file  
exec 1>&2 # send stdout to the same log file  
set -x # tell sh to display commands before execution
exec /root/IntelliJIDEALicenseServer_linux_amd64 &> /dev/null &

```

<a name="init.d"></a>
## init.d

书写符合LSB-style规范的shell

```
vim /etc/init.d/active

#!/bin/bash
### BEGIN INIT INFO
# Provides:          test.com
# Required-Start:    $local_fs $network
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: active service
# Description:       active service daemon
### END INIT INFO

/root/IntelliJIDEALicenseServer_linux_amd64 &> /dev/null &

```

保存上述脚本

什么是LSB风格? `man chkconfig` 里面由例子说明,一下为摘录

chkconfig also supports LSB-style init stanzas, and will apply them in preference to "chkconfig:" lines where available.  A LSB stanza looks like:



### Ubuntu开机启动

```
update-rc.d active.sh enable
update-rc.d active.sh disable
```


### CentOS

通过设置`chkconfig`操作服务启动

```
chkconfig --add active
chkconfig --list
active       	0:off	1:off	2:on	3:on	4:on	5:on	6:off

chkconfig --del active
```


