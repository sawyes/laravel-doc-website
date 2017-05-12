# 数据库测试

- [简介](#introduction)
- [每次测试后重置数据库](#resetting-the-database-after-each-test)
    - [使用迁移](#using-migrations)
    - [使用事务](#using-transactions)
- [模型工厂](#writing-factories)
    - [多个工厂类型](#factory-types)
- [在测试中使用工厂](#using-factories)
    - [创建模型](#creating-models)
    - [持久化模型](#persisting-models)
    - [模型关联](#relationships)

<a name="introduction"></a>
## 简介

Laravel 也提供了多种有用的工具来让你更容易的测试使用数据库的应用程序。首先，你可以使用 `seeInDatabase` 辅助函数，来断言数据库中是否存在与指定条件互相匹配的数据。举例来说，如果我们想验证 `users` 数据表中是否存在 `email` 值为 `sally@example.com` 的数据，我们可以按照以下的方式来做测试：

    public function testDatabase()
    {
        // 创建调用至应用程序...

        $this->seeInDatabase('users', [
            'email' => 'sally@example.com'
        ]);
    }

当然，使用 `seeInDatabase` 方法及其它的辅助函数只是为了方便。你也可以随意使用 PHPUnit 内置的所有断言方法来扩充测试。

<a name="resetting-the-database-after-each-test"></a>
## 每次测试后重置数据库

在每次测试结束后都需要对数据进行重置，这样前面的测试数据就不会干扰到后面的测试。

<a name="using-migrations"></a>
### 使用迁移

其中有一种方式就是在每次测试后都还原数据库，并在下次测试前运行迁移。Laravel 提供了简洁的 `DatabaseMigrations` trait，它会自动帮你处理好这些操作。你只需在测试类中使用此 trait 即可：

    <?php

    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Foundation\Testing\DatabaseMigrations;
    use Illuminate\Foundation\Testing\DatabaseTransactions;

    class ExampleTest extends TestCase
    {
        use DatabaseMigrations;

        /**
         * 基本的功能测试示例。
         *
         * @return void
         */
        public function testBasicExample()
        {
            $this->visit('/')
                 ->see('Laravel 5');
        }
    }

<a name="using-transactions"></a>
### 使用事务

另一个方式，就是将每个测试案例都包含在数据库事务中。Laravel 提供了一个简洁的 `DatabaseTransactions` trait 来自动帮你处理好这些操作。

    <?php

    use Illuminate\Foundation\Testing\WithoutMiddleware;
    use Illuminate\Foundation\Testing\DatabaseMigrations;
    use Illuminate\Foundation\Testing\DatabaseTransactions;

    class ExampleTest extends TestCase
    {
        use DatabaseTransactions;

        /**
         * 基本的功能测试示例。
         *
         * @return void
         */
        public function testBasicExample()
        {
            $this->visit('/')
                 ->see('Laravel 5');
        }
    }

> {note} 此 trait 的事务只包含默认的数据库连接。 如果你的应用程序使用多个数据库连接，就需要你手动处理事务和多个数据库之间的业务逻辑。

<a name="model-factories"></a>
## 模型工厂

测试时，常常需要在运行测试之前写入一些数据到数据库中。创建测试数据时，除了手动的来设置每个字段的值，还可以使用 [Eloquent 模型](/docs/{{version}}/eloquent) 的「工厂」来设置每个属性的默认值。在开始之前，你可以先查看下应用程序的 `database/factories/ModelFactory.php` 文件。此文件包含一个现成的工厂定义：

    $factory->define(App\User::class, function (Faker\Generator $faker) {
        return [
            'name' => $faker->name,
            'email' => $faker->email,
            'password' => bcrypt(str_random(10)),
            'remember_token' => str_random(10),
        ];
    });

闭包内为工厂的定义，你可以返回模型中所有属性的默认测试值。在该闭包内会接收到 [Faker](https://github.com/fzaninotto/Faker) PHP 函数库的实例，它可以让你很方便的生成各种随机数据以进行测试。

当然，你也可以随意将自己额外的工厂增加至 `ModelFactory.php` 文件。你也可以在 `database/factories` 里为每一个数据模型创建对应的工厂模型类，如 `UserFactory.php` 和 `CommentFactory.php`。 在 `factories` 目录中的文件都会被 Laravel 自动加载。

<a name="factory-types"></a>
### 多个工厂类型

有时你可能希望针对同一个 Eloquent 模型类来创建多个工厂。例如，除了一般用户的工厂之外，还有「管理员」工厂。你可以使用 `defineAs` 方法来定义这个工厂：

    $factory->defineAs(App\User::class, 'admin', function ($faker) {
        return [
            'name' => $faker->name,
            'email' => $faker->email,
            'password' => str_random(10),
            'remember_token' => str_random(10),
            'admin' => true,
        ];
    });

除了从一般用户工厂复制所有基本属性，你也可以使用 `raw` 方法来获取所有基本属性。一旦你获取到这些属性，就可以轻松的为其增加任何额外值：

    $factory->defineAs(App\User::class, 'admin', function ($faker) use ($factory) {
        $user = $factory->raw(App\User::class);

        return array_merge($user, ['admin' => true]);
    });

<a name="using-factories"></a>
## 在测试中使用工厂

<a name="creating-models"></a>
### 创建模型

在工厂定义后，就可以在测试或是数据库的填充文件中，通过全局的 `factory` 函数来生成模型实例。接着让我们先来看看几个创建模型的例子。首先我们会使用 `make` 方法创建模型，但不将它们保存至数据库：

    public function testDatabase()
    {
        $user = factory(App\User::class)->make();

        // 在测试中使用模型...
    }

你也可以创建一个含有多个模型的集合，或创建一个指定类型的模型：

    // 创建一个 App\User 实例
    $users = factory(App\User::class, 3)->make();

    // 创建一个 「admin」 类型的 App\User 实例
    $user = factory(App\User::class, 'admin')->make();

    // 创建 3 个 「admin」 类型的 App\User 实例
    $users = factory(App\User::class, 'admin', 3)->make();

#### 重写模型属性

如果你想重写模型中的某些默认值，则可以传递一个包含数值的数组至 `make` 方法。只有指定的数值会被替换，其它剩余的数值则会按照工厂指定的默认值来设置：

    $user = factory(App\User::class)->make([
        'name' => 'Abigail',
    ]);

<a name="persisting-models"></a>
### 持久化工厂模型

你不仅可使用 `create` 方法来创建模型实例，而且也可以使用 Eloquent 的 `save` 方法来将它们保存至数据库：

    public function testDatabase()
    {
        // 创建一个 App\User 实例
        $user = factory(App\User::class)->create();

        // 创建 3 个 App\User 实例
        $users = factory(App\User::class, 3)->create();

        // 在测试中使用模型...
    }

同样的，你可以在数组传递至 `create` 方法时重写模型的属性

    $user = factory(App\User::class)->create([
        'name' => 'Abigail',
    ]);

<a name="relationships"></a>
### 模型关联

在本例中，我们还会增加关联至我们所创建的模型。当使用 `create` 方法创建多个模型时，它会返回一个 Eloquent [集合实例](/docs/{{version}}/eloquent-collections)，让你能够使用集合所提供的便利函数，像是 `each`：

    $users = factory(App\User::class, 3)
               ->create()
               ->each(function ($u) {
                    $u->posts()->save(factory(App\Post::class)->make());
                });

#### 关联和属性闭包

你可以使用闭包参数来创建模型关联。例如如果你想在创建一个 `Post` 的顺便创建一个 `User` 实例：

    $factory->define(App\Post::class, function ($faker) {
        return [
            'title' => $faker->title,
            'content' => $faker->paragraph,
            'user_id' => function () {
                return factory(App\User::class)->create()->id;
            }
        ];
    });

这些闭包也可以获取到生成的工厂包含的属性数组：

    $factory->define(App\Post::class, function ($faker) {
        return [
            'title' => $faker->title,
            'content' => $faker->paragraph,
            'user_id' => function () {
                return factory(App\User::class)->create()->id;
            },
            'user_type' => function (array $post) {
                return App\User::find($post['user_id'])->type;
            }
        ];
    });

## 译者署名
| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@JobsLong](https://phphub.org/users/56)  | <img class="avatar-66 rm-style" src="https://dn-phphub.qbox.me/uploads/avatars/56_1427370654.jpeg?imageView2/1/w/100/h/100">  |  翻译  | 我的个人主页：[http://jobslong.com](http://jobslong.com)  |
