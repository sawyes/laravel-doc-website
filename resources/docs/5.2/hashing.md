# 哈希

- [简介](#introduction)
- [基本用法](#basic-usage)

<a name="introduction"></a>
## 简介

Laravel 通过 `Hash` [facade](/docs/{{version}}/facades) 提供 Bcrypt 加密来保存用户密码。如果你在当前应用使用了 `AuthController` 控制器，它将自动使用 Bcrypt 加密来进行注册跟验证。

由于 Bcrypt 的 「加密系数（word fator）」可以任意调整，这使它成为最好的加密选择。这代表每一次加密的时间可以随着硬件设备的升级而加长。

<a name="basic-usage"></a>
## 基本用法

你可以通过调用 `Hash` facade 的 `make` 方法加密一个密码：

    <?php

    namespace App\Http\Controllers;

    use Hash;
    use App\User;
    use Illuminate\Http\Request;
    use App\Http\Controllers\Controller;

    class UserController extends Controller
    {
        /**
         * 为用户更新密码。
         *
         * @param  Request  $request
         * @param  int  $id
         * @return Response
         */
        public function updatePassword(Request $request, $id)
        {
            $user = User::findOrFail($id);

            // 验证新密码的长度...

            $user->fill([
                'password' => Hash::make($request->newPassword)
            ])->save();
        }
    }

另外，你也可以使用 `bcrypt` 辅助函数：

    bcrypt('plain-text');

#### 根据哈希值验证密码

`check` 方法允许你通过一个指定的纯字符串跟哈希值进行验证。如果你目前正使用 [Laravel 内含的](/docs/{{version}}/authentication) `AuthController`，你可能不需要直接使用该方法，它已经包含在控制器当中并且会被自动调用。

    if (Hash::check('plain-text', $hashedPassword)) {
        // The passwords match...
    }

#### 验证密码是否须重新加密

`needsRehash` 函数允许你检查已加密的密码所使用的加密系数是否被修改：

    if (Hash::needsRehash($hashed)) {
        $hashed = Hash::make('plain-text');
    }
