define(function (require) {
  'use strict';

  var defineComponent = require('flight/lib/component');
  var withRequest = require('lib/with_request');

  describeComponent('lib/with_request', function () {

    var testUrl = '/test';
    var request;
    var testResponses = {
      success: {
        status: 200,
        statusText: 'success',
        responseText: '{"flight":"rocks"}'
      },
      error: {
        status: 400,
        statusText: 'error',
        responseText: '{"status":"400", "statuText": "error", "message":"horror"}'
      }
    };

    var component;    

    function withBaseComponent() { 
      this.testSuccessMethod = jasmine.createSpy('testSuccessMethod');
      this.testErrorMethod = jasmine.createSpy('testErrorMethod');

      this.mockRequest = function (method, settings) {
        this[method](settings);
        return jasmine.Ajax.requests.mostRecent();
      };
    }

    function makeComponent(component) {
      return (new (defineComponent(component, withBaseComponent, withRequest))).initialize(document);
    }

    describe('basic suite', function () {      
      beforeEach(function () {
        jasmine.Ajax.install();
        component = makeComponent(function () {          
          this.after('initialize', function () {
            this.get({
              url: testUrl,
              success: this.testSuccessMethod,
              error: this.testErrorMethod
            });
          });
        });

        request = jasmine.Ajax.requests.mostRecent();
      });

      afterEach(function () {
        jasmine.Ajax.uninstall();
        request = undefined;
        component && component.teardown();
        component = undefined;
      });

      it('should be mixed in', function () {
        [
          'get',
          'post',
          'put',
          'destroy',
          'delete',
          'abortAllRequests'
        ].forEach(function (method) {
          expect(typeof component[method]).toBe("function");
        }, null);
      });

      it('should call the success callback on success', function () {
        request.response(testResponses.success);
        expect(component.testSuccessMethod).toHaveBeenCalled();
      });

      it('should call the error callback on failure', function () {
        request.response(testResponses.error);
        expect(component.testErrorMethod).toHaveBeenCalled();
      });

      it('should abort requests', function () {        
        component.abortAllRequests();
        expect(request.readyState).toBe(0);
        expect(request.statusText).toBe('abort');
        expect(component.testErrorMethod.calls[0].args[0].isAbort).toBe(true);
      });

      it('should set the default callbacks context to component', function () {
        component.mockRequest('get', {
          url: testUrl,
          success: function (data) {
            expect(this).toBe(component);
          }
        }).response(testResponses.success);

        component.mockRequest('get', {
          url: testUrl,
          error: function (data) {
            expect(this).toBe(component);
          }
        }).response(testResponses.error);
      });

      it('should change the callbacks context when provided with the settings or set with bind', function () {
        component.mockRequest('get', {
          url: testUrl,
          context: 'test',
          success: function (data) {
            expect(this).toBe('test');
          }
        }).response(testResponses.success);

        // bind wins
        component.mockRequest('get', {
          url: testUrl,
          context: 'test',
          success: function (data) {
            expect(this).toBe('testBind');
          }.bind('testBind')
        }).response(testResponses.success);

        component.mockRequest('get', {
          url: testUrl,
          success: function (data) {
            expect(this).toBe('test');
          }.bind('test')
        }).response(testResponses.success);
      });

      it('should tunnel PUT and DELETE requests by default', function () {
        request = component.mockRequest('put', {});
        expect(request.method).toBe('POST');

        request = component.mockRequest('delete', {});
        expect(request.method).toBe('POST');
      });

      it('shouldn\'t tunnel PUT and DELETE requests when tunnelMethod is false', function () {
        request = component.mockRequest('put', {
          tunnelMethod: false
        });
        expect(request.method).toBe('PUT');

        request = component.mockRequest('delete', {
          tunnelMethod: false
        });
        expect(request.method).toBe('DELETE');
      });
    });

    describe('events:', function () {
      beforeEach(function () {
        jasmine.Ajax.install();
        component = makeComponent(function () {
          this.attributes({
            successEvent: 'requestSucceed',
            errorEvent: 'requestFailed'
          });

          this.after('initialize', function () {
            this.on(this.attr.successEvent, this.testSuccessMethod);
            this.on(this.attr.errorEvent, this.testErrorMethod);

            this.get({
              url: testUrl,
              success: this.attr.successEvent,
              error: this.attr.errorEvent
            });
          });
        });

        request = jasmine.Ajax.requests.mostRecent();
      });

      afterEach(function () {
        jasmine.Ajax.uninstall();
        request = undefined;
        component && component.teardown();
        component = undefined;
      });

      it('should fire successEvent on success', function () {
        request.response(testResponses.success);
        expect(component.testSuccessMethod).toHaveBeenCalled();
      });

      it('should fire errorEvent on failure', function () {
        request.response(testResponses.error);
        expect(component.testErrorMethod).toHaveBeenCalled();
      });
    });
  });
});
