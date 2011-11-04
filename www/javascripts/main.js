RWProductManager = {
  childBrowser: null,
  openIdHost: "10.0.1.171:3000",
  openIDLink: function(){
    return "http://" + RWProductManager.openIdHost + "/api/mobile/user_sessions/new"; 
  },
  openIDLinkRegex: function(){
   return "http:\\/\\/" + RWProductManager.openIdHost + "\\/api\\/mobile\\/user_sessions\\?openid_identifier=(.*)";
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
    if (RWProductManager.getOpenidIdentifier()){
      $('#login_button_settings .ui-btn-text').text('Revoke access from system');
      $('#login_button_settings .ui-icon').removeClass('ui-icon-info').addClass('ui-icon-delete');
    } else {
      $('#login_button_settings .ui-btn-text').text('Login to system');
      $('#login_button_settings .ui-icon').removeClass('ui-icon-delete').addClass('ui-icon-info');
    }
  },
  getPivotalStories: function(){
    $.ajax({
      url: "http://" + RWProductManager.openIdHost + "/api/mobile/pivotal_stories.json?openid_identifier=" + RWProductManager.getOpenidIdentifier(),
      dataType: 'json',
      success: function(data) {
        $('#pivotal_list_view').html('');
        var list_data = '';
        $.each(data, function(index, value) { 
          if (value.title != null){
            list_data += '<li>';
            list_data += '<a href="#">';
            list_data += value.title;
            list_data += '</a>';
            list_data += '</li>';
          }
        });
        $('#pivotal_list_view').html(list_data).attr("data-role", "listview").listview();
        $('#pivotal_list_view').listview('refresh');
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

$(document).bind("pageload", function(){
  RWProductManager.init();
});
$(function() {
  RWProductManager.init();
  document.addEventListener("deviceready", RWProductManager.onDeviceReady, false);
});