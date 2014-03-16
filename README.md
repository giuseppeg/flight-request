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
		this.yay = function () { console.log('Skål! x2'); };
		this.burp = function () { 
			console.log(
				[
					'b', 
					(new Array(Math.floor(Math.random()*10) + 1).join("u")), 
					'rp!'
				].join('')
			); 
		};

		this.after('initialize', function () {
			this.get({
				url: 'http://b.ar/gimme-beer',
				success: function () {
					console.log('Skål!');
				}
			});

			this.on('request.success', this.yay);
			this.on('request.complete', this.burp);
		});
	}
});
```

## Methods and Events
### Methods
flight-request exposes the following methods:

* `this.get`, `this.post`, `this.put`, `this.delete` - return a jqXHR object [*].
* `this.abort` takes a jqXHR object as parameter and aborts the given request.
* `this.abortAllRequests` - to abort all the open xhr requests.

Keep in mind that
<blockquote>HTML forms (up to HTML version 4 and XHTML 1) only support GET and POST as HTTP request methods. 
A workaround for this is to tunnel other methods (PUT and DELETE) through POST by using a hidden form field 
which is read by the server and the request dispatched accordingly.</blockquote>

[http://stackoverflow.com/a/166501/931594](http://stackoverflow.com/a/166501/931594)

In those cases the request's data object contains a `_method` property with the original request type (verb).

[*] by default the requests can be aborted either with this.abort or this.abortAllRequest. If you want to prevent this to happen you can set `noAbort` to true and pass it along with the ajax settings
### Events
* `request.success` - triggered with the response payload 
* `request.error`  - triggered with `response.status`, `response.message`, JSON rapresentation of the jqXHR.responseText (when the response status is 0), `response.ìsAbort` when the request is aborted. (here `response` is the event payload obj)
* `request.complete` - triggered with the success or error data.

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
