var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.sass('laravel.scss', 'public/assets/css');

    mix.scripts(
        [
            'jquery.js',
            'plugins/prism.js',
            'plugins/bootstrap.js',
            'plugins/scotchPanels.js',
            'plugins/algoliasearch.js',
            'plugins/typeahead.js',
            'plugins/hogan.js',
            'plugins/mousetrap.js',
            'laravel.js'
        ],
        'public/assets/js/laravel.js',
        'resources/assets/js/'
    );

    // mix.scripts(
    //     // resource + plugins path
    //     [
    //         'plugins/pin.js',
    //     ],
    //     // save path
    //     'public/assets/js2/app.min.js',
    //     // resource path
    //     'resources/assets/js/'
    // );
    mix.version(['assets/css/laravel.css', 'assets/js/laravel.js', 'assets/js2/app.min.js']);
});
