(function(){
  // I wonder how much we actually need to expose to the outside world...
  var Searchpath = {};

  var findScriptTag = function(search) {
    var tags = document.getElementsByTagName('script');
    for (var i = tags.length - 1; i >= 0; i--) {
      if ( tags[i].src.indexOf(search) >= 0 ) {
        return tags[i]
      }
    };
  };

  var SearchpathV2 = function(searchString){
    SearchpathV2.addInstance(this);

    if(searchString == null){ searchString = "searchpath.io/v2/"; }

    this.scriptTag = findScriptTag(searchString);
    this.scriptURL = this.scriptTag ? this.scriptTag.src : null;

    this._handlers = {};
    this.triggeredEvents = {};

    // just bail here
    if(!this.scriptURL || this.scriptURL === ''){ return; }

    // 1) replace the script tag with the form tag
    // 2) setup the form's submit handler
    this.insertCSS();
    this.renderForm();

    // 3) load jQuery and set the proper callbacks
  };

  SearchpathV2.prototype.getScriptURL = function() {
    return this.scriptURL;
  };

  SearchpathV2.prototype.getScriptTag = function(searchString) {
    return this.scriptTag;
  }

  SearchpathV2.prototype.getParam = function(inName, defaultValue) {
    if(typeof defaultValue === 'undefined'){ defaultValue = ""; }
    var s = this.getScriptURL().split("?")[1];
    if (s !== undefined) {
      var params = s.split("&");
      for (var i = 0; i < params.length; i++) {
        var param = params[i]
          , name  = param.split("=")[0]
          , val   = param.split("=")[1];

        if (name == inName) {
          return decodeURIComponent(val);
        }
      }
    }

    return defaultValue;
  };

  SearchpathV2.prototype.getFieldId = function() {
    this.fieldId = this.fieldId || this.getParam('id', 'searchpath_q');
    return this.fieldId;
  };

  SearchpathV2.prototype.getTheme = function() {
    this.theme = this.theme || this.getParam('theme', 'default');
    return this.theme;
  };

  SearchpathV2.prototype.getThemeURL = function() {
    return this.getThemeBaseURL() + this.getTheme() + "/main.css";
  };

  SearchpathV2.prototype.getThemeBaseURL = function() {
    return "http://js.searchpath.io/themes/";
  };

  SearchpathV2.prototype.getSite = function() {
    if(this.site){ return this.site; }
    this.site = document.location.hostname;

    var scriptURL = this.getScriptURL();
    if (scriptURL !== "") {
      var s      = scriptURL.split("?")[0]
        , pieces = s.split("/");
      this.site = pieces[pieces.length-1];
    }

    return this.site;
  };

  SearchpathV2.prototype.insertCSS = function(){
    // var href   = "http://js.searchpath.io/themes/" + this.getTheme() + "/main.css"
    var href = this.getThemeURL()
      , styles = document.getElementsByTagName('link');

    for (var i = styles.length - 1; i >= 0; i--) {
      if(styles[i].href == href){ return; }
    }

    var CSS = document.createElement('link');
    CSS.rel  = 'stylesheet';
    CSS.type = 'text/css';
    CSS.href = href;

    document.getElementsByTagName('head')[0].appendChild(CSS);
  };

  SearchpathV2.prototype.renderForm = function(){
    // replace the script tag with the form
    if( !this.getParam('id', null) ) {
      var form = document.createElement('form')
        , input= document.createElement('input');

      var inputAttrs = {
        type        : 'search',
        name        : 'q',
        id          : this.getFieldId(),
        class       : 'input-medium search-query',
        placeholder : this.getParam('placeholder', 'Search')
      };

      for(key in inputAttrs){
        input.setAttribute(key, inputAttrs[key]);
      }

      form.appendChild(input);
      form.className = 'form-search';

      var scriptTag = this.getScriptTag()
        , parent    = scriptTag.parentNode;

      parent.insertBefore(form, scriptTag);
      parent.removeChild(scriptTag);
      this.form = form;
    }else{
      this.form = document.getElementById(this.getParam('id'));
    }

    this.setupSubmitHandler();
  };

  SearchpathV2.prototype.setupSubmitHandler = function(form){
    form = form || this.form;
    var self = this;
    form.onsubmit = function(){
      // first, we should show 'Loading...' (or something similar);
      // do things this way so we only try to load everything if jQuery is around
      self.render("Loading...");
      self.once('jquery:load', function($){
        // time to call and search!
        self.callAndRender(form);
      });
      return false;
    }
  };

  SearchpathV2.prototype.close = function() {
    for (key in this.nodes){
      this.nodes[key].className = ''
    }
  };

  SearchpathV2.prototype.render = function(html) {
    if( !document.getElementById('searchpath_pane') ) {
      var els    = ['arrow', 'pane', 'backdrop'];

      this.nodes  = {};
      for(var i=0; i<els.length; i++) {
        this.nodes[els[i]] = document.createElement('div');
        this.nodes[els[i]].setAttribute('id', 'searchpath_'+els[i]);
        document.body.appendChild(this.nodes[els[i]]);
      }
    }
    this.nodes['pane'].innerHTML = html;

    var self = this;
    setTimeout(function(){
      for(key in self.nodes) {
        self.nodes[key].className = 'visible';
      }
    }, 0);
    // 1) calculate size and positioning

    // 2) set the classnames so opacity can be set by the theme

  };

  SearchpathV2.prototype.callAndRender = function(form){
    form = form || this.form;
    var $     = SearchpathV2.$
      , input = $('#searchpath_q')
      , q     = input.val()
      , x
      , y;

    if(q.length === 0){
      this.close();
      return;
    }

    var columnWidth = $(document).width() / 5
      , positionMid = input.offset().left + (input.width() / 2)
      , direction;

    $(this.nodes.backdrop).css({
      height: $(document).height() + "px",
      width:  $(document).width() + "px"
    });

    if ((positionMid > (columnWidth*2)) && (positionMid < (columnWidth * 3))) {

    }
  };

  SearchpathV2.prototype.getHandlers = function(event){
    return this._handlers[event] || [];
  };

  SearchpathV2.prototype.on = function(event, callback, deleteAfterFire){
    if(deleteAfterFire == null){ deleteAfterFire = false; }
    this._handlers[event] = this._handlers[event] || [];

    var triggeredThisRound = [];

    // need to call handlers for events that have already been triggered
    for(key in this.triggeredEvents) {
      if(key === event) {
        callback.call(this, this.triggeredEvents[key]);
        triggeredThisRound.push(key);
      }
    }

    for(classKey in SearchpathV2.triggeredEvents) {
      if(classKey == event) {
        if(triggeredThisRound.indexOf(classKey) === -1){
          callback.call(this, SearchpathV2.triggeredEvents[classKey]);
        }
      }
    }

    // only push it if we didn't fire it OR we don't want to delete it after firing once
    if(!deleteAfterFire || (triggeredThisRound.indexOf(event) === -1)){
      this._handlers[event].push({callback:callback, deleteAfterFire: deleteAfterFire});
    }
  };

  SearchpathV2.prototype.once = function(event, callback){
    this.on(event, callback, true);
  };

  SearchpathV2.prototype.trigger = function(event, data){
    var handlers = this.getHandlers(event);
    var toDelete = [];
    for (var i = handlers.length - 1; i >= 0; i--) {
      handlers[i].callback.call(this, data);
      if(handlers[i].deleteAfterFire){
        toDelete.push(i);
      }
    };

    // we pushed these in reverse order, so we can safely remove them here
    for(var i=0; i<toDelete.length; i++){
      handlers.splice(toDelete[i]);
    }

    this.triggeredEvents[event] = data;
  };

  // "class" methods
  SearchpathV2.isMobile = function(ua) {
    if(ua == null){ ua = navigator.userAgent; }
    return (/iPhone/i).test(ua);
  };


  var allInstances = [];
  SearchpathV2.addInstance = function(inst) {
    allInstances.push(inst);
  };

  SearchpathV2.each = function(callback){
    // eventually, we'll loop through all instantiated objects
    // and pass each object to the callback
    if(!callback){ return; }
    for (var i = allInstances.length - 1; i >= 0; i--) {
      callback(allInstances[i]);
    };
  };

  SearchpathV2.triggeredEvents = {};
  SearchpathV2.trigger = function(event, data) {
    this.each(function(i){
      i.trigger(event, data);
    });
    SearchpathV2.triggeredEvents[event] = data;
  };


  // this is just so we can avoid a race condition if the script is included twice
  if(!SearchpathV2.$){
    SearchpathV2.$ = true;
    var script = document.createElement("script");
    script.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
    script.type = "text/javascript";
    script.onload = function() {
      // really, what we should do here, is call everything to initialize all the Searchpath stuff,
      // because none of this will work anyway until jQuery is loaded...
      SearchpathV2.$ = jQuery.noConflict(true);
      SearchpathV2.trigger('jquery:load', SearchpathV2.$);
    };
    document.getElementsByTagName('head')[0].appendChild(script);
  }


  this.SearchpathV2 = SearchpathV2;
  this.SPInstance   = new SearchpathV2();
}).call(window);