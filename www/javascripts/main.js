RWProductManager = {
  childBrowser: null,
  openIdHost: "localhost:3000",
  openIDLink: function(){
    return "http://" + RWProductManager.openIdHost + "/api/mobile/user_sessions/new"; 
  },
  openIDLinkRegex: function(){
   return "http:\\/\\/" + RWProductManager.openIdHost + "\\/api\\/mobile\\/user_sessions\\?openid_identifier=(.*)";
  },
/*  
  oAuthRequestUrl: 'https://www.google.com/accounts/OAuthGetRequestToken',
  oAuthAuthorizeUrl: 'https://www.google.com/accounts/OAuthAuthorizeToken',
  oAuthAccessUrl: 'https://www.google.com/accounts/OAuthGetAccessToken',
  oAuthConsumerKey: "115230319812-s6o70odjfqviatd7c88nhgah6701kupm.apps.googleusercontent.com",
  oAuthConsumer_secret: 'dp2NJzyPMUVEw2JZC69W4deJ',
  oAuthScope: null,
  oAuthCAppName: 'Railsware Product Manager'
*/  
  init: function(){
    document.addEventListener("deviceready", this.onDeviceReady, false);
  },
  onDeviceReady: function(){
    /*navigator.notification.alert("PhoneGap is working");*/
    RWProductManager.childBrowser = ChildBrowser.install();
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
  openOauthUrl: function(){
    RWProductManager.openChildBrowser(RWProductManager.openIDLink());
  },
  childBrowserLocationChange: function(loc){
    if (loc){
      var link = new RegExp(RWProductManager.openIDLinkRegex(), "i");
      var link_results = loc.match(link);
      if (null !== link_results){
        if (link_results[1]){
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