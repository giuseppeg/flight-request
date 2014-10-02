define(function (require) {

  'use strict';

  /**
   * Module exports
   */

  return withRequest;

  /**
   * Module function
   */

  function withRequest() {
    var requests = [];

    this.defaultAttrs({
      requestDefaultErrorMessage: 'Unknown Error'
    });

    this.request = function(settings, method) {
      var type = (method || settings.type || 'get').toUpperCase(),
      data = settings.data || {},
      dataType = settings.dataType || 'JSON',
      request;

      /*
        "HTML forms (up to HTML version 4 and XHTML 1) only support GET and POST as HTTP request methods. 
        A workaround for this is to tunnel other methods through POST by using a hidden form field 
        which is read by the server and the request dispatched accordingly."

        http://stackoverflow.com/a/166501/931594
      */
      if (type !== 'GET' && type !== 'POST') {
        settings._method = type;

        type = 'POST';
      }

      if (settings.success) {
        settings.success = done.call(this, settings.success);
      }

      if (settings.error) {
        settings.error = fail.call(this, settings.error);
      }

      request = $.ajax($.extend(settings, {
        url: settings.url,
        type: type,
        dataType: dataType,
        data: data
      }));

      if (request && !settings.noAbort) {
        requests.push(request);
      }

      return request; 
    }

    function done(action) {
      return function (responseData, textStatus, jqXHR) {
        complete.call(this, jqXHR, action, responseData);
      }.bind(this);
    }

    function fail(action) {
      return function (jqXHR, textStatus) {
        var data = {};

        try {
          if (jqXHR.status !== 0) {
            data = JSON.parse(jqXHR.responseText);
          }
        } catch (e) { }

        data.status = data.status || jqXHR.status || 0;
        data.message = data.statusText || jqXHR.statusText || textStatus;


        // when a ajax request is aborted it is treated as an error
        if (data.status == 0 && jqXHR.statusText === 'abort') {
          data.isAbort = true;
        }

        if (!data.message) {
          data.message = this.attr.requestDefaultErrorMessage;
        }

        complete.call(this, jqXHR, action, data);
      }.bind(this);
    }

    function complete(request, action, responseData) {
      removeRequest(request);

      if (typeof action == 'function') {
        action(responseData);
        return;
      }

      this.trigger(action, responseData);
    }

    function removeRequest(request) {
      requests.splice(requests.indexOf(request), 1);
    }

    // mixin methods

    this.get = function (settings) {
      return this.request(settings, "GET");
    };

    this.post = function (settings) {
      return this.request(settings, "POST");
    };

    this.put = function (settings) {
      return this.request(settings, "PUT");
    };

    this.destroy = this['delete'] = function (settings) {
      return this.request(settings, "DELETE");
    };

    this.abort = function (request) {
      if (request && typeof request.abort == 'function') {
        removeRequest(request);
        request.abort();
      }
    };

    this.abortAllRequests = function () {
      requests.forEach(this.abort, null);
    };

    this.after('initialize', function () {
      this.on(window, 'unload', this.abortAllRequests);
    });
  }  
});