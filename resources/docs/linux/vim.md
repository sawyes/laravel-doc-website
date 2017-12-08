# VIM

- [介绍](#intro)
- [vim模式](#vim-mode)
    - [模式转换](#vim-mode-change)
- [使用](#usage)
    - [打开文件](#open-file)
    - [关闭文件](#close-file)
    - [移动光标](#move-cursor)
    - [翻屏](#scroll-screen)
    - [删除单个字符](#del-char)
    - [删除命令](#del-command)
    - [粘贴命令](#paste-command)
    - [复制命令(等同于删除)](#del-command)
    - [修改命令(等同于删除)](#del-command)
    - [替换命令](#replace-command)
    - [撤销命令](#undo-command)
    - [重复操作命令](#repeat-command)
    - [可视化模式](#vitual-mode)
    - [查找命令](#find-command)
    - [查找并替换](#find-replace-command)
- [分屏操作](#screen)
- [高级操作](#adven)
- [配置文件](#vim-config)


<a name='#intro'></a>
## 介绍

vi: Visual Interface

vim: VI iMproved, 全屏编辑器，**模式化**编辑器  

<a name='vim-mode'></a>
## vim模式

编辑模式(打开默认,命令模式)

输入模式

末行模式(命令管理)

<a name='vim-mode-change'></a>
### 模式转换

编辑-->输入：

	i: 在当前光标所在字符的前面，转为输入模式；
	a: 在当前光标所在字符的后面，转为输入模式；
	o: 在当前光标所在行的下方，新建一行，并转为输入模式；
	
	I：在当前光标所在行的行首，转换为输入模式
	A：在当前光标所在行的行尾，转换为输入模式
	O：在当前光标所在行的上方，新建一行，并转为输入模式；

输入-->编辑：ESC
	
编辑-->末行：：(冒号)

末行-->编辑：ESC, ESC

<a name='usage'></a>
### 使用

<a name='open-file'></a>
### 打开文件

 打开文件第12行

    vim +12 /path/to/file
    
打开文件,并且光标处于最后一行

    vim + /path/to/file
    
打开文件,并且光标定位到第一次出现so的位置

    vim +/so /path/to/file

<a name='close-file'></a>
### 关闭文件

* 末行模式关闭文件

```
    :q  退出
    :wq 保存并退出
    :q! 不保存并退出
    :w 保存
    :w! 强行保存(管理员)
    :wq --> **:x**
```

* 编辑模式下退出

```
    ZZ: 保存并退出
```

<a name='move-cursor'></a>
### 移动光标(编辑模式)

* 逐字符移动

> less命令相同

```
    h: 左
    l: 右
    j: 下
    k: 上
    数字+移动操作符号(3h,移动3个字符)
```

* 以单词为单位移动

```
    w: 移至下一个单词的词首
    e: 跳至当前或下一个单词的词尾
    b: 跳至当前或前一个单词的词首
    数字+移动操作符号
```

* 行内跳转：

```
    0: 绝对行首
    ^: 行首的第一个非空白字符
    $: 绝对行尾
```

* 行间跳转

```
    #G：跳转至第#行；112G, 调整到112行,必须大写
    G：最后一行(shift + g为大写操作)
```

<a name='scroll-screen'></a>
### 翻屏

> less 命令 f,b,d,u 翻屏

Ctrl+f: 向下翻一屏

Ctrl+b: 向上翻一屏

Ctrl+d: 向下翻半屏

Ctrl+u: 向上翻半屏

<a name='del-char'></a>
### 删除单个字符

    x: 删除一个字符
    num+x: 删除指定个数字符

<a name='del-command'></a>
### 删除命令

* d 删除
* c 删除并编辑(修改)
* y 复制

编辑模式

    d$ 删除光标所在字符位置到行结束
    d0 删除光标所在字符位置到行首
    dw/3dw  删除光标所在单词(指定个数单词)
    de/3de  删除单词但不包括空格
    db/3db  向前删除单词
    dd/3dd  删除光标所在行

末行模式下：

    :1,100d  1-100行删除
	.: 表示当前行,    :.,100  当前行到100行删除
	$: 最后一行       :.,$    当前行到最后一行删除
	+#: 向下的#行     :.,+13d 当前行到+13行删除
    同理复制,   :1,4y   然后p

<a name='paste-command'></a>
### 粘贴命令 

> 通常和命令d结合, 可以是dd de dw等操作

p: 如果删除或复制为整行内容，则粘贴至光标所在行的下方，如果复制或删除的内容为非整行，则粘贴至光标所在字符的后面；

P: 如果删除或复制为整行内容，则粘贴至光标所在行的上方，如果复制或删除的内容为非整行，则粘贴至光标所在字符的前面；

<a name='replace-command'></a>
### 替换命令

编辑模式

    小r, 单个字符替换
    选择需要替换的字符, 按r, 输入替换的字符
    大R, 替换模式, 连续替换字符

<a name='undo-command'></a>
### 撤销命令

* 撤销前一次操作
    
编辑模式下按u, 可以连续, 一般而言是50次缓存

4u, 一次撤销4次操作

* 还原撤销

还原撤销操作 ctrl + r

<a name='repeat-command'></a>
### 重复上一次操作

.

<a name='vitual-mode'></a>
### 可视化模式

v

移动光标选择内容块, 然后选择操作如:d,y

<a name="find-command"></a>
### 查找命令

编辑模式下

/ 向后查找, 输入查找内容即可

    /oot 向后查找,表示查找oot字符串, 支持正则表达式
    ?oot 向前查找

    n 下一个匹配内容


<a name='find-replace-command'></a>
### 查找并替换

末行模式, 替换所有行,把On 替换成abcd
    
    # 全局模式替换行内所有字符串
    :1,$s/On/abcd/g

<a name='screen'></a>
## 分屏操作

ctrl +w, v 垂直
ctrl +w, h 分屏
ctrl +w, w 切换光标
:q      退出一个分屏
:qa     退出所有

<a name='adven'></a>
## 高级操作

* 显示或取消显示行号

```
    :set number
    :set nu

    :set nonu
```
* 显示忽略或区分字符大小写

```
    :set ignorecase
    :set ic

    :set noic
```
* 设定自动缩进

```
    :set autoindent
    :set ai
    :set noai
```
* 查找到的文本高亮显示或取消

```
    :set hlsearch
    :set nohlsearch
```
* 语法高亮

```
    :syntax on
    :syntax off
```

<a name='vim-multi-file'></a>
## 编辑多个文件
vim FILE1 FILE2 FILE3

    :next 切换至下一个文件
    :prev 切换至前一个文件
    :last 切换至最后一个文件
    :first 切换至第一个文件


<a name='vim-config'></a>
## 配置文件

预设配置参数, 如高亮, 行号等!

    /etc/vimrc
    ~/.vimrc



