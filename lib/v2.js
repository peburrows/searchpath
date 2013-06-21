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

  var isWebKit = function() {
    return (/WebKit/i).test(navigator.userAgent);
  };

  var preventScroll = function() {
    if ( isWebKit() ) {
      document.body.style.overflow = 'hidden';
    }
  };

  var restoreScroll = function() {
    if ( isWebKit() ) {
      document.body.style.overflow = 'scroll';
    }
  };

  var calculatePanePosition = function(sp) {
    $ = SearchpathV2.$;

    var input       = $(sp.input)
      , inputPos    = input.offset()
      , positionMid = inputPos.left + (input.width() / 2)
      , columnWidth = $(document).width() / 5
      , pane        = $(sp.nodes.pane)
      , arrow       = $(sp.nodes.arrow)
      , direction   = 'left'
      , x           = 0
      , y           = 0
      , arrowTop    = 0
      , arrowLeft   = 0;

    if ( positionMid > columnWidth*2 && positionMid < columnWidth*3 ) {
      x = inputPos.left + (input.width() / 2) - pane.width() / 2;
      if ( inputPos.top < 500 ) {
        direction = 'up';
        y = inputPos.top + input.height() + 20;
      } else {
        direction = 'down';
        y = inputPos.top - pane.height() - 20;
      }
    } else if ( inputPos.left > pane.width()+20 ) {
      direction = 'right';
      x = inputPos.left - pane.width() - 20;
      y = inputPos.top - (pane.height() / 2) + parseInt(input.css('padding-top'), 10);
    } else {
      direction = 'left';
      x = inputPos.left + input.width() + parseInt(input.css('padding-left'), 10) + parseInt(input.css('padding-right'), 10) + 20;
      y = inputPos.top - (pane.height() / 2) + parseInt(input.css('padding-top'), 10);
    }

    var scrollY     = $(document).scrollTop()
      , scrollBottom= scrollY + $(document).height();

    if ( y - scrollY < 10 ) {
      y = scrollY + 10;
    } else if ( y + pane.height() > scrollBottom ) {
      y = scrollBottom - pane.height() - 10;
    }

    return { 'x': x , 'y': y, 'direction': direction };
  };

  var calculateArrowPosition = function(sp, direction) {
    var $         = SearchpathV2.$
      , arrow     = $(sp.nodes.arrow)
      , pane      = $(sp.nodes.pane)
      , input     = $(sp.input)
      , inputPos  = input.offset()
      , y         = pane.offset().top
      , x         = pane.offset().left
      , top       = 0
      , left      = 0;

    switch(direction){
      case 'up':
        top  = y - arrow.height() - 1;
        left = inputPos.left + (input.width() / 2) - 10;
        break;
      case 'down':
        top  = y + pane.height() + 1;
        left = inputPos.left + (input.width() / 2) - 10;
        break;
      case 'right':
        top  = inputPos.top + (input.height() / 2) - (arrow.height() / 2);
        left = x + pane.width() + 1;
        break;
      case 'left':
        top  = inputPos.top + (input.height() / 2) - (arrow.height() / 2);
        left = x - arrow.width() - 1;
    }

    console.log("top and left: ", top, left, direction);
    return { 'left': left, 'top': top };
  }

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
      this.input = input;
    }else{
      this.input = document.getElementById(this.getParam('id'));
      this.form  = this.input.form;
    }

    this.setupSubmitHandler();
  };

  SearchpathV2.prototype.setupSubmitHandler = function(form){
    form = form || this.form;
    var self = this;
    form.onsubmit = function(){
      // first, we should show 'Loading...' (or something similar);
      // do things this way so we only try to load everything if jQuery is around
      self.beginLoading();
      self.once('jquery:load', function($){
        // time to call and search!
        self.callAndRender(form);
      });
      return false;
    }
  };

  SearchpathV2.prototype.close = function() {
    for (key in this.nodes){
      this.nodes[key].className = this.nodes[key].className.replace('visible', '');
    }
    restoreScroll();
  };

  SearchpathV2.prototype.beginLoading = function() {
    // tell the user we're loading...
    console.log("Loading...");
  };

  SearchpathV2.prototype.finishLoading = function() {
    console.log("Finished loading...");
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
        self.nodes[key].className += ' visible';
      }
    }, 0);

    // do two different things, depending on whether jQuery is loaded
    // show something like a little loading spinner, then render if we're ready
    this.once('jquery:load', function(){
      preventScroll();
      this.renderWithJQuery(html);
    });
  };

  SearchpathV2.prototype.renderWithJQuery = function(html, form) {
    form = form || this.form;

    // 1) calculate size and positioning
    var $           = SearchpathV2.$
      , input       = $(this.input)
      , backdrop    = $(this.nodes.backdrop)
      , self        = this;

    backdrop.css({
      height: $(document).height() + "px",
      width:  $(document).width() + "px"
    }).one('click', function(e){
      e.preventDefault();
      self.close();
    });

    var results = calculatePanePosition(this);
    $(this.nodes.pane).css({
      top:       results.y + 'px',
      left:      results.x + 'px',
      boxShadow: '1px 1px 2px gray' // remove this soon
    }).addClass(results.direction);

    $(this.nodes.arrow).addClass(results.direction);

    var arrowPos = calculateArrowPosition(this, results.direction);
    $(this.nodes.arrow).css({
      top:  arrowPos.top + 'px',
      left: arrowPos.left+ 'px'
    });
    // now just
  };

  SearchpathV2.prototype.callAndRender = function(form) {
    form = form || this.form;
    var $     = SearchpathV2.$
      , input = $(this.input)
      , q     = input.val()
      , x
      , y;

    if(q.length === 0){
      this.close();
      return;
    }
    this.render('Loading...');
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

  SearchpathV2.close = function() {
    this.each(function(s){
      s.close();
    });
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

  var handleKeyDown = function(key) {
    if (key.keyCode == 27) {
      SearchpathV2.close();
    }
  };

  // watch for an ESC for close
  if (document.attachEvent) {
    document.attachEvent('keydown', handleKeyDown);
  } else {
    document.addEventListener('keydown', handleKeyDown);
  }


  this.SearchpathV2 = SearchpathV2;
  this.SPInstance   = new SearchpathV2();
}).call(window);