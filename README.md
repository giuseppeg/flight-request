# flight-request

[![Build Status](https://secure.travis-ci.org/giuseppegurgone/flight-request.png)](http://travis-ci.org/giuseppegurgone/flight-request)

A [Flight](https://github.com/flightjs/flight) mixin for making XHR requests.

## Installation

```bash
bower install --save flight-request
```

## Example
```bash
define(function (require) {
	var defineComponent = require('flight/lib/component');
  	var withRequest = require('flight-request/lib/with_request');

	return defineComponent(dataComponent, withRequest);

	function dataComponent() {
		this.after('initialize', function () {
			this.get({
				url: 'http://b.ar/gimme-beer',
				success: function () {
					console.log('Skål!');
				}
			});
		});
	}
});
```

## Methods and Events
### Methods
flight-request exposes the following methods:

* `this.get`, `this.post`, `this.put`, `this.destroy` (you can also use `this.delete` if you are in a ES5 env) - return a jqXHR object [*].
* `this.abort` takes a jqXHR object as parameter and aborts the given request.
* `this.abortAllRequests` - to abort all the open xhr requests.

[*] by default the requests can be aborted either with this.abort or this.abortAllRequest. If you want to prevent this to happen you can set `noAbort` to true and pass it along with the ajax settings

#### callbacks context
From v1.0.0 the default callbacks context is the component one.
However you can change it by setting `context` in the ajax settings or using bind.

```javascript
// by default the callbacks context is the component one
this.get({
	url: 'http://b.ar/gimme-beer',
	success: function () {
		// this === component
		this.doSomething();
	}
});


// the context can be changed with bind or by setting the context property
this.get({
	url: 'http://b.ar/gimme-beer',
	context: 'foo',
	success: function () {
		// this === 'foo'
	},
	error: function () {
		// this === 'bar'
	}.bind('bar')
});
```

#### tunnelMethod - PUT and DELETE request tunnelling
<blockquote>HTML forms (up to HTML version 4 and XHTML 1) only support GET and POST as HTTP request methods. 
A workaround for this is to tunnel other methods (PUT and DELETE) through POST by using a hidden form field 
which is read by the server and the request dispatched accordingly.</blockquote>

[http://stackoverflow.com/a/166501/931594](http://stackoverflow.com/a/166501/931594)

Method tunnelling is enabled by default for PUT and DELETE requests.
In those cases the request data object contains a `_method` property with the original request type (verb).<br>
From v1.0.0 it is possible to disable the tunnelling by setting `tunnelMethod` to `false` in the ajax settings.<br>
It is also possible to change the tunnelling property name by setting `tunnelMethod` to a string of your choice (one time change)<br>
or via the component settings `this.attr.tunnelMethod`.


### Events
You can specify custom events names (instead of functions) to be triggered on `success` and/or `error`.
Thanks to Angus Croll for the [suggestion](https://github.com/giuseppeg/flight-request/issues/1).

```javascript
this.on('thereYouGo', function (event, responseData, textStatus, jqXHR) {
	console.log('Skål!');
});

this.get({
	url: 'http://b.ar/gimme-beer',
	success: 'thereYouGo'
});
```

All the requests are automatically aborted when the window is unloading its content and resources (window.onunload);
…

## Development

Development of this component requires [Bower](http://bower.io) to be globally
installed:

```bash
npm install -g bower
```

Then install the Node.js and client-side dependencies by running the following
commands in the repo's root directory.

```bash
npm install & bower install
```

To continuously run the tests in Chrome during development, just run:

```bash
npm run watch-test
```

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bugs)
* [Feature requests](CONTRIBUTING.md#features)
* [Pull requests](CONTRIBUTING.md#pull-requests)
