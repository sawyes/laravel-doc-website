# HTTP 控制器

- [简介](#introduction)
- [基础控制器](#basic-controllers)
- [控制器中间件](#controller-middleware)
- [RESTful 资源控制器](#restful-resource-controllers)
    - [部分资源路由](#restful-partial-resource-routes)
    - [命名资源路由](#restful-naming-resource-routes)
    - [嵌套资源](#restful-nested-resources)
    - [附加资源控制器](#restful-supplementing-resource-controllers)
- [依赖注入与控制器](#dependency-injection-and-controllers)
- [路由缓存](#route-caching)

<a name="introduction"></a>
## 简介

除了可以在单个的 `routes.php` 文件中定义所有的请求处理逻辑外，你可能还希望可以使用控制器类来组织此行为。控制器可将相关的 HTTP 请求处理逻辑组成一个类。控制器一般存放在 `app/Http/Controllers` 目录下。

> 译者注：请不要在 `routes.php` 文件里面写逻辑代码，逻辑处理代码请在 Controller 里书写。
1. 因为这是最佳实践，一开始做对了，后面节省你重构代码的时间；
2. [路由缓存](https://doc.laravel-china.org/docs/5.1/controllers#%E8%B7%AF%E7%94%B1%E7%BC%93%E5%AD%98) 并不会作用在基于闭包的路由。

<a name="basic-controllers"></a>
## 基础控制器

这是一个基础控制器类的例子。所有 Laravel 控制器都应继承基础控制器类，它包含在 Laravel 的默认安装中：

    <?php

    namespace App\Http\Controllers;

    use App\User;
    use App\Http\Controllers\Controller;

    class UserController extends Controller
    {
        /**
         * 显示指定用户的个人数据。
         *
         * @param  int  $id
         * @return Response
         */
        public function showProfile($id)
        {
            return view('user.profile', ['user' => User::findOrFail($id)]);
        }
    }

我们可以通过路由来指定控制器行为，就像这样：

    Route::get('user/{id}', 'UserController@showProfile');

现在，当请求和此特定路由的 URI 相匹配时，`UserController` 类的 `showProfile` 方法就会被运行。当然，路由的参数也会被传递至该方法。

#### 控制器和命名空间

有一点非常重要，那就是我们在定义控制器路由时，不需要指定完整的控制器命名空间。我们只需要定义「根」命名空间 `App\Http\Controllers` 之后的部分类名称即可。默认 `RouteServiceProvider` 会使用路由群组，把 `routes.php` 文件里所有路由规则都配置了根控制器命名空间。

若你需要在 `App\Http\Controllers` 目录内层使用 PHP 命名空间嵌套或组织控制器，只要使用相对于 `App\Http\Controllers` 根命名空间的特定类名称即可。例如控制器类全名为 `App\Http\Controllers\Photos\AdminController`，你可以像这样注册一个路由：

    Route::get('foo', 'Photos\AdminController@method');

#### 命名控制器路由

就像闭包路由，你可以指定控制器路由的名称：

    Route::get('foo', ['uses' => 'FooController@method', 'as' => 'name']);

#### 控制器行为的 URLs

你也可以使用 `route` 辅助函数，生成命名控制器路由的 URL：

    $url = route('name');

一旦你指定了控制器路由的名称，则可以很容易地生成能实现该行为的 URL。你也可以使用 `action` 辅助函数生成指向控制器行为的 URL。同样地，我们只需指定基类命名空间 `App\Http\Controllers` 之后的部分控制器类名称就可以了：

    $url = action('FooController@method');

你可以使用 `Route` facade 的 `currentRouteAction` 方法取到正在运行的控制器行为名称：

	$action = Route::currentRouteAction();

<a name="controller-middleware"></a>
## 控制器中间件

可将 [中间件](/docs/{{version}}/middleware) 指定给控制器路由，例如：

    Route::get('profile', [
        'middleware' => 'auth',
        'uses' => 'UserController@showProfile'
    ]);

不过，在控制器构造器中指定中间件会更为灵活。在控制器构造器中使用 `middleware` 方法，你可以很容易地将中间件指定给控制器。你甚至可以对中间件作出限制，仅将它提供给控制器类中的某些方法。

    class UserController extends Controller
    {
        /**
         * 添加一个 UserController 实例。
         *
         * @return void
         */
        public function __construct()
        {
            $this->middleware('auth');

            $this->middleware('log', ['only' => ['fooAction', 'barAction']]);

            $this->middleware('subscribed', ['except' => ['fooAction', 'barAction']]);
        }
    }

<a name="restful-resource-controllers"></a>
## RESTful 资源控制器

资源控制器让你可以轻松地创建与资源相关的 RESTful 控制器。例如，你可能想要创建一个用来处理应用程序保存「相片」时发送 HTTP 请求的控制器。使用 `make:controller` Artisan 命令，我们可以快速地创建一个像这样的控制器：

    php artisan make:controller PhotoController --resource

此 Artisan 命令会生成 `app/Http/Controllers/PhotoController.php` 控制器文件。此控制器会包含用来操作可获取到的各种资源的方法。

接下来，你可以在控制器中注册资源化路由：

    Route::resource('photo', 'PhotoController');

这一条路由声明会创建多个路由，用来处理各式各样和相片资源相关的的 RESTful 行为。同样地，生成的控制器有着各种和这些行为绑定的方法，包含要处理的 URI 及方法对应的注释。

#### 由资源控制器处理的行为

| 动词       | 路径                   | 行为（方法）   | 路由名称       |
|:----------|:----------------------|:-------------|:--------------|
| GET       | `/photo`              | index        | photo.index   |
| GET       | `/photo/create`       | create       | photo.create  |
| POST      | `/photo`              | store        | photo.store   |
| GET       | `/photo/{photo}`         | show         | photo.show    |
| GET       | `/photo/{photo}/edit`    | edit         | photo.edit    |
| PUT/PATCH | `/photo/{photo}`         | update       | photo.update  |
| DELETE    | `/photo/{photo}`         | destroy      | photo.destroy |

<a name="restful-partial-resource-routes"></a>
#### 部分资源路由

声明资源路由时，你可以指定让此路由仅处理一部分的行为：

    Route::resource('photos', 'PhotosController',
                    ['only' => ['index', 'show']]);

    Route::resource('photos', 'PhotosController',
                    ['except' => ['create', 'store', 'update', 'destroy']]);

<a name="restful-naming-resource-routes"></a>
#### 命名资源路由

所有的资源控制器行为默认都有路由名称；不过你可以在选项中传递一个 `names` 数组来重写这些名称：

    Route::resource('photos', 'PhotosController',
                    ['names' => ['create' => 'photo.build']]);

<a name="restful-naming-resource-route-parameters"></a>
#### 重命名资源路由器参数

默认情况下，`Route::resource` 会基于资源生成路由参数，如果你想重写此参数，可以在 `选项` 参数数组中传入 `parameters` 数组，在此数组中指定参数名称：

    Route::resource('user', 'AdminUserController', ['parameters' => [
        'user' => 'admin_user'
    ]]);

 上面的代码，产生以下的资源路由器 `show` 路由：

    /user/{admin_user}

你也可以传参单词 `singular` 来指示路由使用资源路由器的单数进行参数命名：

    Route::resource('users.photos', 'PhotoController', [
        'parameters' => 'singular'
    ]);

    // /users/{user}/photos/{photo}

或者，你可以使用以下方法来设置全局的，指示路由使用资源路由器的单数进行参数命名：

    Route::singularResourceParameters();

    Route::resourceParameters([
        'user' => 'person', 'photo' => 'image'
    ]);

当你在自定义路由参数的时候，请记住以下优先级：

1. 直接在 `Route::resource` 中指定 `parameters` 数组；
2. 全局指定 `Route::resourceParameters`；
3. 在 `Route::resource` 中设置 `parameters` 为 `singular` 或者通过 `Route::singularResourceParameters` 设置；
4. 默认的行为。

<a name="restful-supplementing-resource-controllers"></a>
#### 附加资源控制器

如果想在资源控制器中默认的资源路由之外加入其它额外路由，则应该在调用 `Route::resource` **之前** 定义这些路由。否则，由 `resource` 方法定义的路由可能会不小心覆盖你附加的路由：

    Route::get('photos/popular', 'PhotoController@method');

    Route::resource('photos', 'PhotoController');

<a name="dependency-injection-and-controllers"></a>
## 依赖注入与控制器

#### 构造器注入

Laravel 使用 [服务容器](/docs/{{version}}/container) 来解析控制器的依赖注入。依赖会自动被解析并注入控制器实例之中。

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Routing\Controller;
    use App\Repositories\UserRepository;

    class UserController extends Controller
    {
        /**
         * 用户 Repository 实例。
         */
        protected $users;

        /**
         * 创建新的控制器实例。
         *
         * @param  UserRepository  $users
         * @return void
         */
        public function __construct(UserRepository $users)
        {
            $this->users = $users;
        }
    }

当然，你也可以对任何的 [Laravel contract](/docs/{{version}}/contracts) 使用类型提示。若容器能够解析它，你就可以使用类型提示。

#### 方法注入

除了构造器注入之外，你也可以对 `控制器行为方法的依赖` 使用类型提示。例如，让我们对 `Illuminate\Http\Request` 实例的其中一个方法使用类型提示：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\Routing\Controller;

    class UserController extends Controller
    {
        /**
         * 保存一个新的用户。
         *
         * @param  Request  $request
         * @return Response
         */
        public function store(Request $request)
        {
            $name = $request->input('name');

            //
        }
    }

想要从控制器方法中获取路由参数的话，只要在其它的依赖之后列出路由参数即可。例如：

    Route::put('user/{id}', 'UserController@update');

你依然可以做 `Illuminate\Http\Request` 类型提示并通过类似下面例子这样来定义你的控制器方法，访问你的路由参数 `id`：

    <?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\Routing\Controller;

    class UserController extends Controller
    {
        /**
         * 更新指定的用户。
         *
         * @param  Request  $request
         * @param  int  $id
         * @return Response
         */
        public function update(Request $request, $id)
        {
            //
        }
    }

<a name="route-caching"></a>
## 路由缓存

> **注意：** 路由缓存并不会作用在基于闭包的路由。要使用路由缓存，你必须将所有闭包路由转换为控制器类。

若你的应用程序完全通过控制器使用路由，你可以利用 Laravel 的路由缓存。使用路由缓存可以大幅降低注册全部路由所需的时间。在某些情况下，你的路由注册甚至可以快上一百倍！要生成路由缓存，只要运行 `route:cache` 此 Artisan 命令：

    php artisan route:cache

这就可以了！现在你的缓存路由文件将被用来代替 `app/Http/routes.php` 这一文件。请记得，若你添加了任何新的路由，就必须生成新的路由缓存。因此你可能希望只在你的项目部署时才运行 `route:cache` 这一命令。

要移除缓存路由文件而不生成新的缓存，请使用 `route:clear` 命令：

    php artisan route:clear

> 译者注： 想知道更多 Laravel 程序调优的技巧？请参阅：[Laravel 5 程序优化技巧](https://phphub.org/topics/2020)

