# 应用程序目录结构

- [简介](#introduction)
- [根目录](#the-root-directory)
    - [`app` 目录](#the-root-app-directory)
    - [`bootstrap` 目录](#the-bootstrap-directory)
    - [`config` 目录](#the-config-directory)
    - [`database` 目录](#the-database-directory)
    - [`public` 目录](#the-public-directory)
    - [`resources` 目录](#the-resources-directory)
    - [`routes` 目录](#the-routes-directory)
    - [`storage` 目录](#the-storage-directory)
    - [`tests` 目录](#the-tests-directory)
    - [`vendor` 目录](#the-vendor-directory)
- [App 目录](#the-app-directory)
    - [`Console` 目录](#the-console-directory)
    - [`Events` 目录](#the-events-directory)
    - [`Exceptions` 目录](#the-exceptions-directory)
    - [`Http` 目录](#the-http-directory)
    - [`Jobs` 目录](#the-jobs-directory)
    - [`Listeners` 目录](#the-listeners-directory)
    - [`Mail` 目录](#the-mail-directory)
    - [`Notifications` 目录](#the-notifications-directory)
    - [`Policies` 目录](#the-policies-directory)
    - [`Providers` 目录](#the-providers-directory)

<a name="introduction"></a>
## 简介

默认的 Laravel 应用程序结构意在给不同大小的应用程序提供一个好的起始点。当然，你也可以依照个人喜好来随意组织应用程序。Laravel 几乎没有对任何类的放置位置进行强加限制 - 只要 Composer 可以自动加载这些类即可。

#### 为何没有 Models 目录？

许多初学者都会困惑 Laravel 为什么没有 `models` 目录，这是有意而为之的。因为 `models` 这个词对不同人而言有不同的含义，容易造成歧义，有些开发者认为应用的模型指的是业务逻辑，另外一些人则认为模型指的是与数据库的交互。

正是因为如此，我们默认将 Eloquent 的模型放置到 `app` 目录下，从而允许开发者自行选择放置的位置。

<a name="the-root-directory"></a>
## 根目录

<a name="the-root-app-directory"></a>
#### App 目录

`app` 目录，如你所料，这里面包含应用程序的核心代码。我们之后将很快对这个目录的细节进行深入探讨。

<a name="the-bootstrap-directory"></a>
#### Bootstrap 目录

`bootstrap` 目录包含了几个框架启动跟自动加载设置的文件。以及在 `cache` 文件夹中包含着一些框架在启动性能优化时所生成的文件。

<a name="the-config-directory"></a>
#### Config 目录

`config` 目录，顾名思义，包含所有应用程序的配置文件。

<a name="the-database-directory"></a>
#### Database 目录

`database` 目录包含数据库迁移与数据填充文件。如果你愿意的话，你也可以在此文件夹存放 SQLite 数据库。

<a name="the-public-directory"></a>
#### Public 目录

`public` 目录存放着  `index.php` 文件，此文件被视为 Laravel 的 HTTP 入口。此目录还包含了前端控制器和资源文件（图片、JavaScript、CSS，等等）。

<a name="the-resources-directory"></a>
#### Resources 目录

`resources` 目录包含了视图、原始的资源文件 (LESS、SASS、CoffeeScript) ，以及语言包。

<a name="the-routes-directory"></a>
#### Routes 目录

`routes` 目录包含了应用的所有路由定义。Laravel 默认提供了三个路由文件：`web.php`、`api.php` 和 `console.php`。

`web.php` 文件里定义的路由都会在 `RouteServiceProvider` 中被指定应用到 `web` 中间件组，具备 Session、CSRF 防护以及 Cookie 加密功能，如果应用无需提供无状态的、RESTful 风格的API，所有路由都会定义在 `web.php` 文件。

`api.php` 文件里定义的路由都会在 `RouteServiceProvider` 中被指定应用到 `api` 中间件组，具备频率限制功能，这些路由是无状态的，所以请求通过这些路由进入应用需要通过 API 令牌进行认证并且不能访问 Session 状态。

`console.php` 文件用于定义所有基于闭包的控制台命令，每个闭包都被绑定到一个控制台命令并且允许与命令行 IO 方法进行交互，尽管这个文件并不定义 HTTP 路由，但是它定义了基于命令行的应用入口（路由）。

<a name="the-storage-directory"></a>
#### Storage 目录

`storage` 目录包含编译后的 Blade 模板、基于文件的 session、文件缓存和其它框架生成的文件。此文件夹分格成 `app`、`framework`，及 `logs` 目录。`app` 目录可用于存储应用程序使用的任何文件。`framework` 目录被用于保存框架生成的文件及缓存。最后，`logs` 目录包含了应用程序的日志文件。

`storage/app/public` 可以用来生成用户上传文件，作为公开磁盘使用。默认的 `public` 磁盘使用 `local` 驱动，并且存储文件至 `storage/app/public` 文件夹中。为了能公开访问，你需要创建 `public/storage` 文件夹，然后作为符号链接到 `storage/app/public` 文件夹，你可以使用 `php artisan storage:link` 来创建符号链接。

<a name="the-tests-directory"></a>
#### Tests 目录

`tests` 目录包含自动化测试。这有一个现成的 [PHPUnit](https://phpunit.de/) 例子。每一个测试类都需要添加 `Test` 前缀，你可以使用 `phpunit` 或者 `php vendor/bin/phpunit` 命令来运行测试。

<a name="the-vendor-directory"></a>
#### Vendor 目录

`vendor` 目录包含你的 [Composer](https://getcomposer.org) 依赖模块。

<a name="the-app-directory"></a>
## App 目录

应用程序的「内容」存在于 `app` 目录中。默认情况下，这个目录在 `App` 命名空间下借助 Composer 使用 [PSR-4 自动加载标准](https://phphub.org/topics/2081)自动加载。**你可以使用 `app:name` Artisan 命令修改这个命名空间**。

`app` 目录附带许多个额外的目录，例如：`Console`、`Http` 和 `Providers`。可以将 `Console` 和 `Http` 目录试想为提供 API 进入应用程序的「核心」。HTTP 协定和 CLI 都是跟应用程序进行交互的机制，但实际上并不包含应用程序逻辑。换句话说，它们是两种简单地发布命令给应用程序的方法。`Console` 目录包含你全部的 Artisan 命令，而 `Http` 目录包含你的控制器、中间件和请求。

其他目录将会在你通过 Artisan 命令 `make` 生成相应类的时候生成到 `app` 目录下。例如，`app/Jobs` 目录在你执行 `make:job` 命令生成任务类时，才会出现在 `app` 目录下。

> {tip} `app` 目录中的很多类都可以通过 Artisan 命令生成，要查看所有有效的命令，可以在终端中运行 `php artisan list make` 命令。

<a name="the-console-directory"></a>
#### Console 目录

`Console` 目录包含应用所有自定义的 Artisan 命令，这些命令类可以使用 `make:command` 命令生成。该目录下还有 `console` 核心类，在这里可以注册自定义的 Artisan 命令以及定义 [调度任务](/docs/{{version}}/scheduling)。

<a name="the-events-directory"></a>
#### Events 目录

`Events` 目录默认不存在，会在你使用 `event:generate` 或者 `event:make` 命令以后才会生成。如你所料，此目录是用来放置 [事件类](/docs/{{version}}/events) 的。事件可以被用于当指定动作发生时，通知你应用程序的其它部分，提供了很棒的灵活性及解耦。

<a name="the-exceptions-directory"></a>
#### Exceptions 目录

`Exceptions` 目录包含应用程序的异常处理进程，同时也是个处置应用程序抛出异常的好位置。如果你想自定义异常的记录和渲染，你应该修改此目录下的  `Handler` 类。

<a name="the-http-directory"></a>
#### Http 目录

`Http` 目录包含了控制器、中间件以及表单请求等，几乎所有进入应用的请求处理都在这里进行。

<a name="the-jobs-directory"></a>
#### Jobs 目录

该目录默认不存在，可以通过执行 `make:job` 命令生成，`Jobs` 目录用于存放 [队列任务](/docs/{{version}}/queues)，应用中的任务可以被队列化，也可以在当前请求生命周期内同步执行。同步执行的任务有时也被看作命令，因为它们实现了 [命令总线设计模式](https://en.wikipedia.org/wiki/Command_pattern)。

<a name="the-listeners-directory"></a>
#### Listeners 目录

这个目录默认不存在，可以通过执行 `event:generate` 和 `make:listener` 命令创建。`Listeners` 目录包含处理 [事件](/docs/{{version}}/events) 的类（事件监听器），事件监听器接收一个事件并提供对该事件发生后的响应逻辑，例如，`UserRegistered` 事件可以被 `SendWelcomeEmail` 监听器处理。

<a name="the-mail-directory"></a>
#### Mail 目录

这个目录默认不存在，但是可以通过执行 `make:mail` 命令生成，`Mail` 目录包含邮件发送类，邮件对象允许你在一个地方封装构建邮件所需的所有业务逻辑，然后使用 `Mail::send` 方法发送邮件。

<a name="the-notifications-directory"></a>
#### Notifications 目录

这个目录默认不存在，你可以通过执行 `make:notification` 命令创建， `Notifications` 目录包含应用发送的所有通知，比如事件发生通知。Laravel 的通知功能将通知发送和通知驱动解耦，你可以通过邮件，也可以通过 Slack、短信或者数据库发送通知。

<a name="the-policies-directory"></a>
#### Policies 目录

这个目录默认不存在，你可以通过执行 `make:policy` 命令来创建， `Policies` 目录包含了所有的授权策略类，策略用于判断某个用户是否有权限去访问指定资源。更多详情，请查看 [授权文档](/docs/{{version}}/authorization)。

<a name="the-providers-directory"></a>
#### Providers 目录

Providers 目录包含应用的 [服务提供者](/docs/{{version}}/providers) 。服务提供者在启动应用过程中绑定服务到容器、注册事件，以及执行其他任务，为即将到来的请求处理做准备。

在新安装的 Laravel 应用中，该目录已经包含了一些服务提供者，你可以按需添加自己的服务提供者到该目录。
