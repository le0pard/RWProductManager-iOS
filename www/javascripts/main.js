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
  },
  initElements: function(){
    this.initStates();
    $('#login_button_settings').click(function(event){
      if (RWProductManager.getOpenidIdentifier()){
        RWProductManager.deleteOpenidIdentifier();
      } else {
        RWProductManager.openOauthUrl();
      }
      RWProductManager.initStates();
      return false;
    });
    
    if ($('#pivotal_list_view').length > 0){
      RWProductManager.getPivotalStories();
    }
  },
  initStates: function(){
    $.mobile.ajaxEnabled = false;
    $(document).ajaxStart(function() {
      $.mobile.showPageLoadingMsg();
    });
    $(document).ajaxStop(function() {
      $.mobile.hidePageLoadingMsg();
    });
    $.ajaxSetup({
      timeout: 3000,
      crossDomain: true,
      dataType: 'json',
      headers:{
        "X-OPENID-IDENTIFIER": unescape(RWProductManager.getOpenidIdentifier()),
        "Accept": "application/json,text/javascript,application/javascript,text/html"
      }
    });
    if (RWProductManager.getOpenidIdentifier()){
      $('#login_button_settings .ui-btn-text').text('Revoke access from system');
      $('#login_button_settings .ui-icon').removeClass('ui-icon-info').addClass('ui-icon-delete');
    } else {
      $('#login_button_settings .ui-btn-text').text('Login to system');
      $('#login_button_settings .ui-icon').removeClass('ui-icon-delete').addClass('ui-icon-info');
    }
  },
  getPivotalStories: function(){
    $('#pivotal_list_view').html('');
    $.ajax({
      url: "http://" + RWProductManager.openIdHost + "/api/mobile/pivotal_stories",
      dataType: 'json',
      success: function(data) {
        var list_data = '';
        $.each(data, function(index, value) { 
          if (value.title != null){
            list_data += '<div data-role="collapsible">';
            list_data += '<h3>' + value.title + '</h3>';
            list_data += '<p>';
            if (value.url){
              list_data += '<p><strong>Title:</strong> <a href="' + value.url + '" target="_blank">';
              list_data += value.title;
              list_data += '</a></p>';
            } else {
              list_data += '<p><strong>Title:</strong> ' + value.title + '</p>';
            }
            list_data += '<p><strong>Status:</strong> ' + value.status + '</p>';
            if (value.story_type){
              list_data += '<p><strong>Type:</strong> ' + value.story_type + '</p>';
            }
            if (value.description){
              list_data += '<p><strong>Descr:</strong> ' + value.description + '</p>';
            }
            list_data += '</p>';
            list_data += '</div>';
          }
        });
        
        $('#pivotal_list_view').html(list_data).attr("data-role", "collapsible-set").addClass('ui-collapsible-set');
        $('#pivotal_list_view div[data-role="collapsible"]').collapsible();
      }
    });
  },
  
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
          RWProductManager.initStates();
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

$(function() {
  RWProductManager.init();
});