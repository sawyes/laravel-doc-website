# Shell例子

- [添加一个用户](#user-shell)
- [判断数值是否相等](#equal-num)
- [空行判断](#empty-line)
- [获取具有指定bash的用户](#bash-user)

<a name="#user-shell"></a>
## 添加一个用户

练习：写一个脚本，完成以下任务
1. 添加5个用户, user1,..., user5
2. 每个用户的密码同用户名，而且要求，添加密码完成后不显示passwd命令的执行结果信息；
3. 每个用户添加完成后，都要显示用户某某已经成功添加

```
#!/bin/bash
useradd user1
echo "user1" | passwd --stdin user1 &> /dev/null
echo "Add user1 successfully."
```

如果用户存在，就显示用户已存在；否则，就添加此用户
```
! id user1 && useradd user1 && echo "user1" | passwd --stdin user1  || echo "user1 exists."
```

shell
```
root # bash ./adduser.sh peter
root # cat ./adduser.sh

#!/bin/bash

# 条件判断左右两边必须有空格
if [[ $1 ]]
then
    # 数据黑洞
    ! id $1 &> /dev/null
    # 命令执行成功，则用户不存在
    # 通过反引号可以保存命令结果，`id $1`
    if [ $? -eq 0 ]
    then
        useradd $1 && echo "$1" | passwd --stdin $1 > /dev/null
        echo "add user $1 successfully !"
    else
        echo "user $1 already exists !"
    fi
else
    echo "Miss argments: username"
fi
```

简单判断用户是否存在
```
$ cat ./checkuser.sh 
#!/bin/bash

testUser=$1

# 命令的结果不需要，只要返回结果的状态
# 数值比较一定要加中括号
if id $testUser &> /dev/null; then
   echo "$testUser exists!"
fi

```

给定一个用户，获取其密码警告期限；
而后判断用户密码使用期限是否已经小于警告期限；
    提示：计算方法，最长使用期限减去已经使用的天数即为剩余使用期限；
    
如果小于，则显示“Warning”；否则，就显示“OK”。

圆整：丢弃小数点后的所有内容
```
#!/bin/bash
# 6 表示剩余?天过期需要提前发出警告
W=`grep "student" /etc/shadow | cut -d: -f6`
S=`date +%s`
T=`expr $S / 86400`
# 5 表示最大有效时间
L=`grep "^student" /etc/shadow | cut -d: -f5`
# 3 最后一次必须变更密码时间
N=`grep "^student" /etc/shadow | cut -d: -f3`
SY=$[$L-$[$T-$N]]

if [ $SY -lt $W ]; then
  echo 'Warning'
else
  echo 'OK'
fi
```

<a href="equal-num"></a>
## 判断数值是否相等

```
#!/bin/bash

INT1=63
INT2=62
if [[ $INT1 -eq $INT2 ]]
then
        echo "相等"
else
        echo "不相等"
fi
```

<a name="empty-line"></a>
空行判断

给定一个文件，比如/etc/inittab
判断这个文件中是否有空白行；
如果有，则显示其空白行数；否则，显示没有空白行。
```
#!/bin/bash
FILE=/etc/inittab

# 文件不存在
if [ ! -e $FILE ]; then
  echo "No $FILE."
  exit 8
fi

if grep "^$" $FILE &> /dev/null; then
  echo "Total blank lines: `grep "^$" $FILE | wc -l`."
else
  echo "No blank line."
fi

```
<a name='bash-user'>
## 获取具有指定bash的用户

${变量}

```
#!/bin/bash
#
if [ $1 == '-s' ]; then
  ! grep "${2}$" /etc/shells &> /dev/null && echo "Invalid shell." && exit 7
elif [ $1 == '--help' ];then
  echo "Usage: showshells.sh -s SHELL | --help"
  exit 0
else
  echo "Unknown Options."
  exit 8
fi

NUMOFUSER=`grep "${2}$" /etc/passwd | wc -l`
SHELLUSERS=`grep "${2}$" /etc/passwd | cut -d: -f1`
SHELLUSERS=`echo $SHELLUSERS | sed 's@[[:space:]]@,@g'`

echo -e "$2, $NUMOFUSER users, they are: \n$SHELLUSERS"
```

