# Shell

- [shebang魔数](#shebang)
- [输出重定向](#output-redirect)
- [运行错误](#errors)
    - [执行权限不够](#errors-without-exec-permission)
- [变量类型](#var-type)
    - [本地变量](#local-var)
    - [局部变量](#jubu-var)
    - [环境变量](#env-var)
    - [位置变量](#position-var)
    - [特殊变量](#special-var)
- [代码执行](#code-run)
- [变量操作](#var)
    - [查看](#var-index)
    - [变量声明](#var-declare)
    - [运算](#var-add)
    - [删除](#var-del)
- [条件判断](#condition)
    - [条件测试的表达式](#condition-test-express)
    - [文件测试](#condition-file-test)
    - [控制结构](#condition-control)
    - [整数比较](#condition-num-oprator)
    - [逻辑关系](#condition-logic-relation)
- [循环控制](#loop-control)

> 不要忘记Linux创建的文件没有执行权限，shell也不例外，chmod u+x filename

<a name="shebang"></a>
## shebang魔数

```
 #!/bin/shell
 # 注释行，不执行
```

<a name="output-redirect"></a>
## 输出重定向

```code
* >     输出重定向
* >>    输出追加重定向
* 2>    错误输出重定向
* 2>>   错误输出追加重定向
* &>    真确和错误都输出
```

> /dev/null: 软件设备， bit bucket，数据黑洞 

<a name="errors"></a>
## 运行错误

<a name="errors-without-exec-permission"></a>
### 执行权限不够

引用错误, 原因为创建文件默认权限一定不会包含执行权限
```
# ./user.sh
-bash: ./user.sh: 权限不够
```

正确确方法

#### 方法1 用登录bash运行
```
bash ~/user.sh
```

#### 方法2 添加执行权限
```
chmod u+x ~/user.sh
```

<a name="var-type"></a>
## 变量类型

> 反引号，能把命令执行结果提取出来

```
USERID=`id -u $name`
```

<a name='local-var'></a>
### 本地变量

本地变量仅用于当前bash
* 双引号弱引用，内部的变量会引用
* 单引号强引用，内部变量不会引用

> 变量赋值等号左右两边不能有空格，否则语法错误

```
NAME=peter
echo $NAME 
echo "my name is $NAME"
# 区分变量  
echo "my name is ${NAME}wu"  //my name is peterwu
# 本地变量
echo 'my name is ${NAME}wu' //my name is ${NAME}wu
```

```code
引用变量, 大花括号， ${VAR_NAME}, 大多数时候可以省略
```

<a name='jubu-var'></a>
### 局部变量

```
仅作用于当前代码段
local var_name=test
```

<a name='env-var'></a>
### 环境变量

导出环境变量
```
export VARNAME=VALUE
```

原本变量作用域只能存在于当前的shell,export变量使其可以切换bash后保持变量
```
name=peter
export name
bash 
echo $name
```

<a name="position-var"></a>
### 位置变量

```code
获取脚本运行参数值
$1,$2,$3
```

```
# 运行脚本, 空格为一个参数
./filetest.sh /etc/fstab /etc/inittab
$1: /etc/fstab
$2: /etc/inittab
```

<a name="special-var"></a>
### 特殊变量
```code
$?: 上一个命令的执行状态返回值；
$#：参数的个数
$*: 参数列表
$@：参数列表
```

程序执行，可能有两类返回值：
* 0: 正确执行
* 1-255：错误执行，1，2，127系统预留；

判断用户是否存在
```
id student &> /dev/null
echo $?
```

<a name='var'></a>
## 变量操作

<a name="var-index"></a>
### 查看

```
// shell中的变量, 临时变量，或登录脚本的变量
set
// shell中的环境变量
printenv
env
export
```

<a name='var-declare'></a>
### 变量声明

关键字 declar

* -i 数值类型， 默认地bash不支持浮点型计算
* -x 声明变量为环境变量

```
// 声明一个变量SUM为整数类型
declare -i SUM=0
```

<a name='var-add'></a>
### 运算

默认地都是字符串操作
```
A=2
B=3
C=$A+$B
echo $C // 2+3 字符串
```

算术运算
```
1、let 算术运算表达式
    let C=$A+$B

2、$[算术运算表达式]
    C=$[$A+$B]

3、$((算术运算表达式))
    C=$(($A+$B))

4、expr 算术运算表达式，表达式中各操作数及运算符之间要有空格，而且要使用命令引用
    C=`expr $A + $B`

```

> 判断是否为数字, expr $n + 0

字符比较(help let查看手册)
==
!=
>
<
-n string: 测试字符串是否为空,空为真
-s string: 测试字符串是否不为空，不空为真
```
[[ $a == $b ]]
[-s $a]
```

homestead 默认~/.profile环境变量
```
# set PATH so it includes user's private bin directories
PATH="$HOME/bin:$HOME/.local/bin:$PATH"
PATH="/home/vagrant/.composer/vendor/bin:$PATH"
```



<a name='var-del'></a>
### 删除

撤销变量，而不是变量的值
```
unset name
```


<a name="condition"></a>
## 条件判断

> linux中命令状态返回值0为真，其他为假

<a name="condition-test-express"></a>
### 条件测试的表达式

> 条件中括号内部左右两边必须分别有一个空格，否则语法错误

返回命令执行的状态，从而判断结果的真假
```
# 数值比较, 一定要加中括号
1. 命令测试法
[ expression ]
2. 关键字测试法
[[ expression ]]
test expression

# 判断参数是否存在
[[ $1 ]]
# 字符串测试
[[ $a == $b ]]
# 注意，单引号是自身$a，不代表变量
[ "$a" == "$b" ]
```

> 执行结果和执行状态的区别

反引号可以保存命令的执行结果

```
# 获取命令的执行结果的uid，判断是否等于0
if `id -u $NAME` -eq 0; then
...

# 获取id命令的执行状态，判断用户是否存在
if id $NAME; then
...
```

<a name="condition-file-test"></a>
### 文件测试

```
-e FILE：测试文件是否存在
-f FILE: 测试文件是否为普通文件
-d FILE: 测试指定路径是否为目录
-r FILE: 测试当前用户对指定文件是否有读取权限；
-w FILE: 写
-x FILE: 执行

[ -e /etc/inittab ]
[ -x /etc/rc.d/rc.sysinit ] 
```

<a name="code-run"></a>
## 代码执行

定义脚本退出状态码

如果脚本没有明确定义退出状态码，那么，最后执行的一条命令的退出码即为脚本的退出状态码
```
exit: 8
```

> 调试

单步执行调试
```
bash -x bashname

chmod +x a.sh
bash -x a.sh
a.sh: line 3: syntax error near unexpected token `;'
a.sh: line 3: `if [ $# -lt 2 ]; then;'

```
<a name="condition-control"></a>
## 控制结构

```
if 判断条件
    statement1
fi

# then和if同一行，“;”不能少
if 判断条件; then
    statement1
    statement2
    ...
else
    statement3
    statement4
    ...
fi
```

<a name="condition-num-oprator"></a>
### 整数比较:
* eq: 测试两个整数是否相等；比如 $A -eq $B
* ne: 测试两个整数是否不等；不等，为真；相等，为假；
* gt: 测试一个数是否大于另一个数；大于，为真；否则，为假；
* lt: 测试一个数是否小于另一个数；小于，为真；否则，为假；
* ge: 大于或等于
* le：小于或等于

<a href="condition-logic-relation"></a>
### 逻辑关系

* 与 &&
* 或 ||
* 非 !

如果用户存在，就显示用户已存在；否则，就添加此用户
```
! id user1 && useradd user1 && echo "user1" | passwd --stdin user1  || echo "user1 exists."
```

判断用户和组名是否一样
```
if [ `id -un $1` == `id -gn $1` ]; then
    echo "it's same username groups"
else
    echo "it's not same username groups"
fi
```

<a name="loo-control">
## 循环控制

### for

命令替换seq, 或者展开{1,4}, {1..100}这样的表达式

```
#!/bin/bash
#

declare -i SUM=0

for i in {1..100}; do
    let SUM=$SUM+$i
done
echo $SUM
```

> 算数表达式let SUM=$SUM+$i等同于let SUM=$[$SUM+$i]
