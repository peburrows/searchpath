(function(){
  // I wonder how much we actually need to expose to the outside world...
  var Searchpath = {};

  var findScriptURL = function(search){
    var tags = document.getElementsByTagName('script');
    for (var i = tags.length - 1; i >= 0; i--) {
      if (tags[i].src.indexOf(search) >= 0) {
        return tags[i].src
      }
    };
  };

  var SearchpathV2 = function(searchString){
    if(searchString == null){ searchString = "searchpath.io/v2/"; }

    this.scriptURL = findScriptURL(searchString);

    // 1) replace the script tag with the form tag
    // 2) setup the form's submit handler
    // 3) load jQuery
  };

  SearchpathV2.prototype.getScriptURL = function() {
    return this.scriptURL;
  };

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

  // "class" methods
  SearchpathV2.isMobile = function(ua) {
    if(ua == null){ ua = navigator.userAgent; }
    return (/iPhone/i).test(ua);
  };

  Searchpath.getScriptURL = function()
  {
    var js_url = "";
    var tags = document.getElementsByTagName("script");
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      if (t.src.indexOf("searchpath.io/v2/") !== -1) {
        js_url = t.src;
      }
    }

    return js_url;
  };

  Searchpath.getParam = function (inName, defaultValue)
  {
    if(typeof defaultValue === 'undefined') defaultValue = "";

    var js_url = Searchpath.getScriptURL();
    var s = js_url.split("?")[1];
    if (s !== undefined) {
      var params = s.split("&");
      for (var i = 0; i < params.length; i++) {
        var param = params[i];
        var name = param.split("=")[0];
        var val = param.split("=")[1];
        if (name == inName) {
          return decodeURIComponent(val);
        }
      }
    }

    return defaultValue;
  };

  Searchpath.getFieldId = function ()
  {
    return Searchpath.getParam('id', 'searchpath_q');
  };

  Searchpath.getTheme = function ()
  {
    return Searchpath.getParam('theme', 'default');
  };

  Searchpath.getSite = function ()
  {
    var site = document.location.hostname;
    var js_url = Searchpath.getScriptURL();
    if (js_url !== "") {
      var s = js_url.split("?")[0];
      var pieces = s.split("/");
      site = pieces[pieces.length-1];
    }
    return site;
  };

  Searchpath.isMobile = function()
  {
    return (/iPhone/i).test(navigator.userAgent);
  };

  // pass in the jQuery we want to use
  var initSearchpath = Searchpath.init = function($){
    if($==null){ $ = Searchpath.$; }
    Searchpath.go = function ()
    {
      if ($("#searchpath_pane").length === 0) {
        $("<div>").attr("id", "searchpath_arrow").appendTo("body");
        $("<div>").attr("id", "searchpath_pane").appendTo("body");
        $("<div>").attr("id", "searchpath_backdrop").appendTo("body");

        $(document).keyup(function(e) {
          if (e.which == 27) {
            Searchpath.close();
            restoreScroll();
            return false;
          }
        });
      }

      var search_box = document.getElementById(Searchpath.getFieldId());
      var q = search_box.value;
      var link = $(search_box);
      var copy_pane = $('#searchpath_pane');
      var copy_arrow = $('#searchpath_arrow');
      var backdrop = $('#searchpath_backdrop');
      var x, y;

      if (q.length === 0) {
        Searchpath.close();
        restoreScroll();
        return false;
      }

      var page_column_size = $(document).width() / 5;
      var position_mid = link.offset().left + (link.width() / 2);
      var direction;
      if ((position_mid > (page_column_size * 2)) && (position_mid < (page_column_size * 3))) {
        x = (page_column_size * 2) + (page_column_size / 2) - (copy_pane.width() / 2);
        if (link.offset().top < 500) {
          direction = "up";
          y = link.offset().top + link.height() + 20;
        }
        else {
          direction = "down";
          y = link.offset().top - copy_pane.height() - 20;
        }
      }
      else if (link.offset().left > 400) {
        x = link.offset().left - copy_pane.width() - 20;
        y = link.offset().top - (copy_pane.height() / 2) + parseInt(link.css("padding-top"),10);
        direction = "right";
      }
      else {
        x = link.offset().left + link.width() + parseInt(link.css("padding-left"),10) + parseInt(link.css("padding-right"),10) + 20;
        y = link.offset().top - (copy_pane.height() / 2) + parseInt(link.css("padding-top"),10);
        direction = "left";
      }

      var scroll_y = $(document).scrollTop();
      if ((y - scroll_y) < 10) {
        y = scroll_y + 10;
      }
      else {
        var scroll_bottom = scroll_y + $(window).height();
        if ((y + copy_pane.height()) > scroll_bottom) {
          y = scroll_bottom - copy_pane.height() - 10;
        }
      }

      copy_pane.css({
        top: y + "px",
        left: x + "px",
        "box-shadow": "1px 1px 2px gray"
      });

      backdrop.css({
        width: $(document).width() + "px",
        height: $(document).height() + "px"
      });

      showWithOpacity(backdrop, 0.7);
      showWithOpacity(copy_pane, 1.0);

      if (copy_pane.scrollTop() > 0) {
        copy_pane.animate({scrollTop:0});
      }

      if (direction == "up") {
        copy_arrow.css("background-image", "url(http://js.searchpath.io/themes/" + Searchpath.getTheme() + "/popover_arrow_up.png)");
        copy_arrow.css({
          width: "30px",
          height: "16px",
          top: y - 15 + "px",
          left: link.offset().left + (link.width() / 2) - 10 + "px"
        });
      }
      else if (direction == "down") {
        copy_arrow.css("background-image", "url(http://js.searchpath.io/themes/" + Searchpath.getTheme() + "/popover_arrow_down.png)");
        copy_arrow.css({
          width: "30px",
          height: "16px",
          top: y + copy_pane.height() + "px",
          left: link.offset().left + (link.width() / 2) - 10 + "px"
        });
      }
      else if (direction == "right") {
        copy_arrow.css("background-image", "url(http://js.searchpath.io/themes/" + Searchpath.getTheme() + "/popover_arrow_right.png)");
        copy_arrow.css({
          top: link.offset().top - 4 + "px",
          left: copy_pane.offset().left + copy_pane.width() + 1 + "px"
        });
      }
      else if (direction == "left") {
        copy_arrow.css({
          top: link.offset().top - 4 + "px",
          left: copy_pane.offset().left - copy_arrow.width() + 1 + "px"
        });
      }

      showWithOpacity(copy_arrow, 1.0);

      backdrop.unbind("click");
      backdrop.click(function() {
        Searchpath.close();
        restoreScroll();
        return false;
      });

      preventScroll();
      $.get('http://js.searchpath.io/html?site=' + encodeURIComponent(Searchpath.getSite()) + '&q=' + encodeURIComponent(q), function(response_data) {
        copy_pane.html(response_data);
      });

      return false;
    }

    function searchpath_mobile()
    {
      var search_box = document.getElementById(Searchpath.getFieldId());
      var q = search_box.value;
      var body_tag = $('body');

      $.get('http://js.searchpath.io/html?site=' + encodeURIComponent(Searchpath.getSite()) + '&q=' + encodeURIComponent(q), function(response_data) {
        body_tag.html(response_data);
        body_tag.append('<input type="hidden" id="' + Searchpath.getFieldId() + '" value="' + encodeURIComponent(q) + '" />');

        if (body_tag.scrollTop() > 0) {
          body_tag.animate({scrollTop:0});
        }
      });

      return false;
    }

    Searchpath.showMore = function()
    {
      var search_box = document.getElementById(Searchpath.getFieldId());
      var q = search_box.value;
      $.get('http://js.searchpath.io/html?site=' + encodeURIComponent(Searchpath.getSite()) + '&q=' + encodeURIComponent(q) + '&from=10&size=50', function(response_data) {
        $("#searchpath_more").html(response_data);
      });
    }

    Searchpath.close = function()
    {
      if (Searchpath.isMobile()) {
        window.location.reload();
      }
      else {
        hideWithOpacity($("#searchpath_pane"));
        hideWithOpacity($("#searchpath_arrow"));
        hideWithOpacity($("#searchpath_backdrop"));

        setTimeout(function() {
          $("#searchpath_pane").hide();
          $("#searchpath_arrow").hide();
          $("#searchpath_backdrop").hide();
        }, 1000);
      }
    };

    var preventScroll = function()
    {
      if (navigator.userAgent.match(/WebKit/i) !== null) {
        $("body").css("overflow", "hidden");
      }
    };

    var restoreScroll = function()
    {
      if (navigator.userAgent.match(/WebKit/i) !== null) {
        $("body").css("overflow", "scroll");
      }
    };

    var showWithOpacity = function(inElement, inOpacity)
    {
      inElement.show();
      inElement.css("opacity", inOpacity);
    };

    var hideWithOpacity = function(inElement)
    {
      inElement.css("opacity", 0);
    };

    $(document).trigger('searchpath:init');
  }; // initSearchpath()

  var script = document.createElement("script");
  script.src = "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js";
  script.type = "text/javascript";
  script.onload = function() {
    // really, what we should do here, is call everything to initialize all the Searchpath stuff,
    // because none of this will work anyway until jQuery is loaded...
    Searchpath.$ = jQuery.noConflict(true);
    initSearchpath.call(window, Searchpath.$);
  };

  var css_link = document.createElement("link");
  css_link.rel = "stylesheet";
  css_link.href = "http://js.searchpath.io/themes/" + Searchpath.getTheme() + "/main.css";
  css_link.type = "text/css";

  document.getElementsByTagName('head')[0].appendChild(script);
  document.getElementsByTagName('head')[0].appendChild(css_link);

  if (Searchpath.getParam("id") === "") {
    document.write('<form class="form-search"><input type="search" name="q" id="searchpath_q" class="input-medium search-query" placeholder="' + Searchpath.getParam("placeholder") + '" /></form>');
  }


  // we should change these handlers to check to see if Searchpath is fully loaded
  // if it *is* fully loaded, we call the handler
  // if not, we show "loading..." and call the handler once it's finished
  if (Searchpath.isMobile()) {
    document.getElementById(Searchpath.getFieldId()).form.onsubmit = searchpath_mobile;
  }
  else {
    document.getElementById(Searchpath.getFieldId()).form.onsubmit = Searchpath.go;
  }

  this.Searchpath   = Searchpath;
  this.SearchpathV2 = SearchpathV2;
  this.SPInstance   = new SearchpathV2();
}).call(window);