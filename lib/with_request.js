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

    this.attributes({
      requestDefaultErrorMessage: 'Unknown Error',
      tunnelMethod: '_method'
    });

    this.request = function (settings, method) {
      var type = (method || settings.type || 'get').toUpperCase(),
      data = settings.data || {},
      dataType = settings.dataType || 'JSON',
      tunnelMethod = this.attr.tunnelMethod,
      request;

      if (!settings.hasOwnProperty('context')) {
        settings.context = this;
      }

      /*
        "HTML forms (up to HTML version 4 and XHTML 1) only support GET and POST as HTTP request methods. 
        A workaround for this is to tunnel other methods through POST by using a hidden form field 
        which is read by the server and the request dispatched accordingly."

        http://stackoverflow.com/a/166501/931594
      */
      if (settings.tunnelMethod !== false && type !== 'GET' && type !== 'POST') {
        if (typeof settings.tunnelMethod == 'string') {
          tunnelMethod = settings.tunnelMethod
        }

        settings[tunnelMethod] = type;

        type = 'POST';
      }

      if (settings.success) {
        settings.success = this.__requestSuccess__(settings.success, settings.context);
      }

      if (settings.error) {
        settings.error = this.__requestError__(settings.error, settings.context);
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

    this.__requestSuccess__ = function (action, context) {
      return function (data, textStatus, jqXHR) {
        this.__requestComplete__(jqXHR, data, action, context);
      }.bind(this);
    };

    this.__requestError__ = function (action, context) {      
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

        this.__requestComplete__(jqXHR, data, action, context);
      }.bind(this);
    };

    this.__requestComplete__ = function (request, responseData, action, context) {
      removeRequest(request);

      if (typeof action == 'function') {
        action.call(context, responseData);
        return;
      }

      this.trigger(action, responseData);
    };

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