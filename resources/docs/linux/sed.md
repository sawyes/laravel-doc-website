# sed (stream edit)

- [简介](#intro)
- [语法](#usage)
- [练习](#test)

<a name="intro"></a>
## sed 
* 流编辑器,行文本编辑器,
* 每次都是逐行处理, 读取数据到内存中
* 模式空间,即可以像grep一样做过滤
* 不编辑原文件

<a name='usage'></a>
## 语法

sed 区间+命令 处理的文件 

sed [options] 'AddressCommand' file ...

* Options
```
	-n: 静默模式，不再默认显示模式空间中的内容（和p命令结合可以只会打印匹配的行）
	    sed -n '/^\//p' #只打印以斜杠开头的行，等同于grep '^\/' /etc/fstab
	-i: 直接修改原文件
	-e SCRIPT -e SCRIPT:可以同时执行多个脚本
	-f /PATH/TO/SED_SCRIPT
		sed -f /path/to/scripts  file
	-r: 表示使用扩展正则表达式
```

* Address：
```
1、StartLine,EndLine
	比如1,100
	$：最后一行
2、/RegExp/
	# 不现实斜线开头，以及#号开头的行（d删除）
	sed '/^\//d' /etc/fstab |sed '/^#/d' $1 
3、/pattern1/,/pattern2/
	第一次被pattern1匹配到的行开始，至第一次被pattern2匹配到的行结束，这中间的所有行
4、LineNumber
	指定的行
5、StartLine, +N
	从startLine开始，向后的N行；
```

* Command：
```
	d: 删除符合条件的行；
	p: 显示符合条件的行(选项n静默配合)
	
	a \string: 在指定的行后面追加新行，内容为string
		string内\n：可以用于换行
		所有以斜杠开头的行后新增一行追加字符串# hello world
		sed '/^\//a \#hello world' /etc/fstab
	i \string: 在指定的行前面添加新行，内容为string
	
	r FILEPATH: 将指定的文件的内容添加至符合条件的行处, 可用于文件合并
	    把/etc/issue文件内容追加到/etc/fstab第2行,第5行后面
	    sed '2,5r /etc/issue' /etc/fstab
	w FILEPATH: 将地址指定的范围内的行另存至指定的文件中; 
	    把/etc/fstab内包含oot的行保存到/tmp/oot.txt中
	    sed -n "/oot/w /tmp/oot.txt" /etc/fstab 
	    
	s/pattern/string/修饰符: 查找并替换，默认只替换每行中第一次被模式匹配到的字符串
		sed 's/oot/OOT/' /etc/fstab, oot->OOT替换字符串，一行中只会替换一次
		加修饰符
		g: 全局替换，替换一行内的所有
		    sed 's/oot/OOT/g' /etc/fstab
		i: 忽略字符大小写
		分隔符是三个相同的字符即可可以避免转义
        s///: s###->s@@@
        
        例子1：全局替换斜杠为#号
        sed 's@/@#@g' /etc/fstab
            \(\), \1, \2
		例子2：
        l..e: like-->liker
              love-->lover
              
              like-->Like
              love-->Love
            &: 引用模式匹配整个串
            
            sed "s@l..e@&r@g" test
            等同于 sed "s@\(l..e\)@\1r@g" test
        
        例子3：大小写
            like -> Like
            love -> Love
            
            sed "s@l\(..e\)@L\1@g" test
```

过滤/etc/fstab前9行内容, 并显示
> 注意sed是不会删除原文件的, 每次处理数据都保存在模式空间中

```
sed "1,9d" /etc/fstab
```

<a name="test"></a>
## sed练习：


* 删除/etc/grub.conf文件中行首的空白符；
```
sed -r 's@^[[:spapce:]]+@@g' /etc/grub.conf
```

* 替换/etc/inittab文件中"id:3:initdefault:"一行中的数字为5；
```
sed 's@\(id:\)[0-9]\(:initdefault:\)@\15\2@g' /etc/inittab
```

* 删除/etc/inittab文件中的空白行；
```
sed '/^$/d' /etc/inittab
```

* 删除/etc/inittab文件中开头的#号; 
```
sed 's@^#@@g' /etc/inittab
```

* 删除某文件中开头的#号及后面的空白字符，但要求#号后面必须有空白字符;
```
sed -r 's@^#[[:space:]]+@@g' /etc/inittab
```

* 删除某文件中以空白字符后面跟#类的行中的开头的空白字符及#
```
sed -r 's@^[[:space:]]+#@@g' /etc/inittab
```

* 取出一个文件路径的目录名称;
```
echo "/etc/rc.d/" | sed -r 's@^(/.*/)[^/]+/?@\1@g'	
基名：
echo "/etc/rc.d/" | sed -r 's@^/.*/([^/]+)/?@\1@g'	
```




