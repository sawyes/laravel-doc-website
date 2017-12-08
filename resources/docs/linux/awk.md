# awk

- [简介](#intor)
- [使用](#usage)
    - [调用方式](#use-way)
- [入门](#first)
- [内置变量](#awk-var)
- [printf & print](#print)
- [BEGIN & END](#begingend)
- [AWK编程](#coding)
    - [if](#if)
    - [循环语句](#for)
- [总结](#end)

<a name="intor"></a>
## 简介

awk是一个强大的文本分析工具，相对于grep的查找，[sed的编辑](/docs/{{version}}/sed)，awk在其对数据分析并生成报告时，显得尤为强大。简单来说awk就是把文件逐行的读入，以空格为默认分隔符将每行切片，切开的部分再进行各种分析处理。

<a name="usage"></a>
## 使用

尽管操作可能会很复杂，但语法总是这样

    awk '{pattern + action}' {filenames}
    如：awk -F':' '/root/{print $1}' /etc/passwd


其中 pattern 表示 AWK 在数据中查找的内容,花括号（{}）不需要在程序中始终出现, -F 为操作项分隔域

添加行首和行尾

    #如果只是显示/etc/passwd的账户和账户对应的shell,而账户与shell之间以逗号分割,而且在所有行添加列名name,shell,在最后一行添加"blue,/bin/nosh"。
    cat /etc/passwd |awk  -F ':'  'BEGIN {print "name,shell"}  {print $1","$7} END {print "blue,/bin/nosh"}'

BEGIN为脚本开始前动作, END 为脚本结束后动作

<a name='use-way'></a>
### 调用方式

有三种方式调用awk

* 命令行方式 
```
awk [-F  field-separator]  'commands'  input-file(s)

[-F域分隔符]是可选的

commands 是真正awk命令

input-file(s) 是待处理的文件。
```   

* shell脚本方式

将所有的awk命令插入一个文件，并使awk程序可执行，然后awk命令解释器作为脚本的首行，一遍通过键入脚本名称来调用。
相当于shell脚本首行的：#!/bin/sh**可以换成：#!/bin/awk**

* 将所有的awk命令插入一个单独文件，然后调用：

```
awk -f awk-script-file input-file(s)
```

其中，-f选项加载awk-script-file中的awk脚本，input-file(s)跟上面的是一样的

<a name="first"></a>
## 入门

如果只是显示/etc/passwd的账户

    #cat /etc/passwd |awk  -F ':'  '{print $1}'  
    root
    daemon
    bin
    sys

这种是awk+action的示例，每行都会执行action{print $1}。

-F指定域分隔符为':'。


如果只是显示/etc/passwd的账户和账户对应的shell,而账户与shell之间以tab键分割

    #cat /etc/passwd |awk  -F ':'  '{print $1"\t"$7}'
    root    /bin/bash
    daemon  /bin/sh
    bin     /bin/sh
    sys     /bin/sh


搜索/etc/passwd有root关键字的所有行

    #awk -F: '/root/' /etc/passwd
    root:x:0:0:root:/root:/bin/bash


<a name="awk-var"></a>
## 内置变量

awk有许多内置变量用来设置环境信息，这些变量可以被改变，下面给出了最常用的一些变量。

    ARGC               命令行参数个数
    ARGV               命令行参数排列
    ENVIRON            支持队列中系统环境变量的使用
    FILENAME           awk浏览的文件名
    FNR                浏览文件的记录数
    FS                 设置输入域分隔符，等价于命令行 -F选项
    NF                 浏览记录的域的个数
    NR                 已读的记录数
    OFS                输出域分隔符
    ORS                输出记录分隔符
    RS                 控制记录分隔符


 此外,$0变量是指整条记录。$1表示当前行的第一个域,$2表示当前行的第二个域,......以此类推。
 
<a name='print'></a>
## print & prinf

统计/etc/passwd:文件名，每行的行号，每行的列数，对应的完整行内容:

    #awk  -F ':'  '{print "filename:" FILENAME ",linenumber:" NR ",columns:" NF ",linecontent:"$0}' /etc/passwd

使用printf替代print,可以让代码更加简洁，易读

     awk  -F ':'  '{printf("filename:%10s,linenumber:%s,columns:%s,linecontent:%s\n",FILENAME,NR,NF,$0)}' /etc/passwd

<a name='begingend'></a>
## BEGIN & END

    # 统计用户数
    awk 'BEGIN {count=0;} {count++;} END{printf("count is %s", count);}' /etc/passwd

<a name='coding'></a>
## AWK编程

    awk '{count++;print $0;} END{print "user count is ", count}' /etc/passwd
    root:x:0:0:root:/root:/bin/bash
    ......
    user count is  40

count是自定义变量。之前的action{}里都是只有一个print,其实print只是一个语句，而action{}可以有多个语句，以;号隔开。


### if

统计某个文件夹下的文件占用的字节数,过滤4096大小的文件(一般都是文件夹):

    ls -l |awk 'BEGIN {size=0;print "[start]size is ", size} {if($5!=4096){size=size+$5;}} END{print "[end]size is ", size/1024/1024,"M"}' 
    [end]size is  8.22339 M

### 循环语句

awk中的循环语句同样借鉴于C语言，支持while、do/while、for、break、continue，这些关键字的语义和C语言中的语义完全相同。

显示/etc/passwd的账户

    awk -F ':' 'BEGIN {count=0;} {name[count] = $1;count++;}; END{for (i = 0; i < NR; i++) print i, name[i]}' /etc/passwd
    0 root
    1 daemon
    2 bin
    3 sys
    4 sync
    5 games
    ......

 因为awk中数组的下标可以是数字和字母，数组的下标通常被称为关键字(key)。值和关键字都存储在内部的一张针对key/value应用hash的表格里。由于hash不是顺序存储，因此在显示数组内容时会发现，它们并不是按照你预料的顺序显示出来的。数组和变量一样，都是在使用时自动创建的，awk也同样会自动判断其存储的是数字还是字符串。一般而言，awk中的数组用来从记录中收集信息，可以用于计算总和、统计单词以及跟踪模板被匹配的次数等等。

<a name='end'></a>
## 总结
[更多学习资料](http://www.gnu.org/software/gawk/manual/gawk.html)














