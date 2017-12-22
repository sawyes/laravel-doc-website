# 解压缩

- [压缩格式](#zip-type)
- [压缩命令](#zip-command)
    - [gzip bzip2 xz](#gzip-bizp2-xz)
    - [zip](#zip)
- [tar](#tar)
- [cpio](#cpio)


<a name='zip-type'></a>
## 压缩格式

gz, bz2, xz, zip, Z

压缩算法：算法不同，压缩比也会不同

<a name='zip-command'></a>
## 压缩命令

<a name='gzip-bizp2-xz'></a>
### gzip bzip2 xz

#### 通用选项
注意这些命令都是会删除源文件, 且只能对文件进行操作, 文件夹操作一般称为归档

    -d: 解缩
    -#: 压缩级别1-9,默认是6
    -k: 压缩时保留原文件

以上选项所有命令都相同, 但是`xz`压缩命令默认是需要安装的, 压缩比相对比较高的是`xz`

    # 用gzip 压缩当前文件, 源文件压缩后删除
    gzip filename
    # 解压文件, 解压后压缩文件删除
    gzip -d filename.gz

#### 查看但不解压

* zcat
* bzcat
* xzcat

<a name='zip'></a>
### zip

zip: 既归档又压缩的工具

	zip FILENAME.zip FILE1 FILE2 ...: 压缩后不删除原文件
    zip test.zip test*.txt

	unzip FILENAME.zip

<a name='tar'></a>
## tar

归档工具, 归档并压缩, 不会删除源文件

    # c 表示创建压缩gzip文件
    tar zvcf test.tar.gz test*.txt
    # bzip2方式压缩文件
    tar jvcf test.tar.gz test*.txt
    # x 展开压缩文件
    tar vxf test.tar.gz
    # -C 解压文件到指定的目录
    tar -xf test.tar.gz -C ~/.

选项

    -z 压缩乐行, z表示gzip, j 表示bzip2
    -v 显示进度条
    -x 解压展开选项
    -c 创建文件选项
    -f 一定要放在参数最后, 表示压缩或者解压文件
    --xattrs: 归档时，保留文件的扩展属性信息, 备份的时候经常使用

常用组合,解压`xvf`, 压缩`zcvf`

<a name='cpio'></a>
### cpio

归档工具

    cp /boot/initrd.img-4.4.0-92-generic ./
    mv initrd.img-4.4.0-92-generic initrd.img-4.4.0-92-generic.gz
    gzip -d initrd.img-4.4.0-92-generic.gz

    vagrant@homestead:/tmp/aa$ ll initrd.img-4.4.0-92-generic
    -rw-r--r-- 1 vagrant vagrant  82360320 Dec 16 17:08 initrd.img-4.4.0-92-generic

    ## 解压出来的文件就是cpio格式
    vagrant@homestead:/tmp/aa$ file initrd.img-4.4.0-92-generic 
    initrd.img-4.4.0-92-generic: ASCII cpio archive (SVR4 with no CRC)
