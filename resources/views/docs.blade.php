@extends('app')

@section('content')
<nav id="slide-menu" class="slide-menu" role="navigation">

	<div class="brand">
		<a href="/">
			<img src="/assets/img/laravel-logo-white.png" height="50">
		</a>
	</div>

	<ul class="slide-main-nav">
		<li><a href="/">Home</a></li>
		@include('partials.main-nav')
	</ul>

	<div class="slide-docs-nav">
		<h2>Documentation</h2>
		{!! $index !!}
	</div>

</nav>

<div class="docs-wrapper container">

	<section class="sidebar">
<<<<<<< HEAD
=======
		{{-- ad div --}}
		<!-- <script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=laravelcom" id="_carbonads_js"></script> -->
>>>>>>> 2d90988c5eed85a2567429d937ba183e6062e28f
		{!! $index !!}
	</section>

	<article>
		{!! $content !!}
	</article>
</div>
@endsection
