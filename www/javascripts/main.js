var jQT = new $.jQTouch({
    icon: 'jqtouch.png',
    addGlossToIcon: false,
    startupScreen: '../images/jqt_startup.png',
    statusBar: 'black',
    preloadImages: [
        '../stylesheets/vendors/img/back_button.png',
        '../stylesheets/vendors/img/back_button_clicked.png',
        '../stylesheets/vendors/img/button_clicked.png',
        '../stylesheets/vendors/img/grayButton.png',
        '../stylesheets/vendors/img/whiteButton.png',
        '../stylesheets/vendors/img/loading.gif'
    ]
});

RWProductManager = {
  childBrowser: null,
  openIdHost: "localhost:3000",
  
  openIDLink: function(){
    return "http://" + RWProductManager.openIdHost + "/api/mobile/user_sessions/new"; 
  },
  openIDLinkRegex: function(){
   return "http:\\/\\/" + RWProductManager.openIdHost + "\\/api\\/mobile\\/user_sessions\\?openid_identifier=(.*)";
  },
  defaultHeaders: function(){
    return {
      "X-OPENID-IDENTIFIER": unescape(RWProductManager.getOpenidIdentifier()),
      "Accept": "application/json,text/javascript,application/javascript,text/html"
    };
  },
  init: function(){
    document.addEventListener("deviceready", this.onDeviceReady, false);
    this.initElements();
    this.initPages();
    
    RWManagerVacations.init();
  },
  initElements: function(){
    this.initStates();
    
    /* settings */
    $('#login_button_settings').tap(function(event){
      if (RWProductManager.getOpenidIdentifier()){
        RWProductManager.deleteOpenidIdentifier();
        $('#login_button_settings').text('Login to system');
      } else {
        RWProductManager.openOauthUrl();
      }
      return false;
    });
  },
  initStates: function(){
    $.ajaxSetup({
      timeout: 3000,
      crossDomain: true,
      dataType: 'json',
      headers: {
        "X-OPENID-IDENTIFIER": unescape(RWProductManager.getOpenidIdentifier()),
        "Accept": "application/json,text/javascript,application/javascript,text/html"
      }
    });
  },
  
  initPages: function(){
    $('#vacations').bind('pageAnimationEnd', function(event, info){
        if (info.direction == 'in') {
          RWManagerVacations.Vacations.fetch();
        } else {
          $('#vacations_list').html('');
        }
        $(this).data('referrer'); // return the link which triggered the animation, if possible
    });
    
    $('#vacation').bind('pageAnimationEnd', function(e,info){
      if (info.direction == 'in') {
        //do something
      }
      $(this).data('referrer');
    });
    
    $('#settings').bind('pageAnimationEnd', function(event, info){
      if (info.direction == 'in') {     
        RWProductManager.initSettings();
      }
    });
  },
  
  initSettings: function(){    
    if (RWProductManager.getOpenidIdentifier()){
      $('#login_button_settings').text('Revoke access from system');
    } else {
      $('#login_button_settings').text('Login to system');
    }
  },
  
  /* child browser */
  onDeviceReady: function(){
    if (!RWProductManager.childBrowser){
      if ((typeof window.plugins !== "undefined" && window.plugins !== null)) {
        RWProductManager.childBrowser = window.plugins.childBrowser;
      } else {
        RWProductManager.childBrowser = ChildBrowser.install();
      }
    }
    if (RWProductManager.childBrowser){
      RWProductManager.childBrowser.onLocationChange = function(loc){ RWProductManager.childBrowserLocationChange(loc); };
      RWProductManager.childBrowser.onClose = function(){root.childBrowseronClose()};
      RWProductManager.childBrowser.onOpenExternal = function(){root.childBrowseronOpen();};
    }
  },
  
  openChildBrowser: function(url){
    try {
      RWProductManager.childBrowser.showWebPage(url);
    } catch (err) {
      alert(err);
    }
  },
  
  getOpenidIdentifier: function(){
    return window.localStorage.getItem("openid_identifier");
  },
  setOpenidIdentifier: function(openid_identifier){
    window.localStorage.setItem("openid_identifier", openid_identifier);
  },
  deleteOpenidIdentifier: function(){
    window.localStorage.removeItem("openid_identifier");
  },
  
  openOauthUrl: function(){
    RWProductManager.openChildBrowser(RWProductManager.openIDLink());
  },
  childBrowserLocationChange: function(loc){
    if (loc){
      var link = new RegExp(RWProductManager.openIDLinkRegex(), "i");
      var link_results = loc.match(link);
      if (null !== link_results){
        if (link_results[1]){
          RWProductManager.setOpenidIdentifier(link_results[1]);
          RWProductManager.childBrowser.close();
          RWProductManager.initSettings();
        }
      }
    }
  },
  childBrowseronClose: function(){
    /*alert("In index.html child browser closed");*/
  },
  childBrowseronOpen: function(){
    /*alert("In index.html onOpenExternal");*/
  }
};

$(function() {
  RWProductManager.init();
});