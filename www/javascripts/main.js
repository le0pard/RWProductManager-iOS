RWProductManager = {
  childBrowser: null,
  openIDHost: "railsware.com",
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
    RWProductManager.openChildBrowser('https://www.google.com/accounts/o8/id?hd=' + RWProductManager.openIDHost);
  },
  childBrowserLocationChange: function(loc){
    alert("In index.html new loc = " + loc);
  },
  childBrowseronClose: function(){
    alert("In index.html child browser closed");
  },
  childBrowseronOpen: function(){
    alert("In index.html onOpenExternal");
  }
};

$(function() {
  RWProductManager.init();
});