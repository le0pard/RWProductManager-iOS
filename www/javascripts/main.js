RWProductManager = {
  childBrowser: null,
  openIdHost: "localhost:3000",
  openIDLink: function(){
    return "http://" + RWProductManager.openIdHost + "/api/mobile/user_sessions/new"; 
  },
  openIDLinkRegex: function(){
   return "http:\\/\\/" + RWProductManager.openIdHost + "\\/api\\/mobile\\/user_sessions\\?openid_identifier=(.*)";
  },
  init: function(){
    document.addEventListener("deviceready", this.onDeviceReady, false);
    this.init_elements();
  },
  init_elements: function(){
    this.init_states();
    $('#login_button_settings').click(function(event){
      if (RWProductManager.getOpenidIdentifier()){
        RWProductManager.deleteOpenidIdentifier();
      } else {
        RWProductManager.openOauthUrl();
      }
      RWProductManager.init_states();
      return false;
    });
  },
  init_states: function(){
    if (RWProductManager.getOpenidIdentifier()){
      $('#login_button_settings .ui-btn-text').text('Revoke access from system');
      $('#login_button_settings .ui-icon').removeClass('ui-icon-info').addClass('ui-icon-delete');
    } else {
      $('#login_button_settings .ui-btn-text').text('Login to system');
      $('#login_button_settings .ui-icon').removeClass('ui-icon-delete').addClass('ui-icon-info');
    }
  },
  onDeviceReady: function(){
    if (RWProductManager.childBrowser == null){
      RWProductManager.childBrowser = ChildBrowser.install();
    }
    if (RWProductManager.childBrowser != null){
      RWProductManager.childBrowser.onLocationChange = function(loc){ RWProductManager.childBrowserLocationChange(loc); };
      RWProductManager.childBrowser.onClose = function(){root.childBrowseronClose()};
      RWProductManager.childBrowser.onOpenExternal = function(){root.childBrowseronOpen();};
    }
  },
  openChildBrowser: function(url)
  {
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
          RWProductManager.init_states();
          RWProductManager.childBrowser.close();
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

$(document).bind("pageload", function(){
  RWProductManager.init();
});
$(function() {
  document.addEventListener("deviceready", RWProductManager.onDeviceReady, false);
});