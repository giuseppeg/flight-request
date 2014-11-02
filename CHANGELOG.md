## v1.0.0 (11/2/2014)

### Fixes 
* #5 set default callbacks context to the component one
* #6 use this.attributes 
* #7 possibility to disable the method tunneling for PUT and DELETE requests
* add tests

### Features
* can set the callbacks context in the request settings


## v0.0.2 (3/22/2014)

### Fixes 
* abortAllRequests should loop through the requests array
* HTTP request tunneling workaround breaks setting request type in options/settings object

### Features
* trigger custom events on success/error