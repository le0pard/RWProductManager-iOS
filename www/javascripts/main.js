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
      "Accept": "application/json, text/javascript, application/javascript, text/html"
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
    
    /* vacations */
    $('#add_vacation_submit').tap(function(event){
      $('#add_vacation_errors').text('');
      $('#add_vacation_form').find("input, select").removeClass('error');
      
      RWManagerVacations.Vacations.create({
        description: $('#add_vacation_description').val(),
        reason: $('#add_vacation_reason').val(),
        from_date: $('#add_vacation_from_date').val(),
        to_date: $('#add_vacation_to_date').val()
      },
      {
        success: function(model, response){
          jQT.goBack();
          return true;
        }, 
        error: function(model, response){
          var data = JSON.parse(response.responseText);
          var error_text = [];
          for (key in data){
            $('#add_vacation_form').find("input[name='" + key + "']").addClass('error');
            $('#add_vacation_form').find("select[name='" + key + "']").addClass('error');
            error_text.push(data[key]);
          }
          $('#add_vacation_errors').text(error_text.join('; '));
          return false;
        }
      });
      
      return false;
    });
    
    /* update vacation */ 
    $('#update_vacation_button').tap(function(event){
      $('#vacation_errors').text('');
      $('#vacation_form').find("input, select").removeClass('error');
      
      if (RWManagerVacations.selectedModel != null){
        if ($('#vacation_id').val() == RWManagerVacations.selectedModel.get('id')){
           RWManagerVacations.selectedModel.save({
             reason: $('#vacation_reason').val(),
             description: $('#vacation_description').val(),
             from_date: $('#vacation_from_date').val(),
             to_date: $('#vacation_to_date').val()
           },
           {
             success: function(model, response){
               jQT.goBack();
               return true;
             },
             error: function(model, response){
               var data = JSON.parse(response.responseText);
               var error_text = [];
               for (key in data){
                 $('#vacation_form').find("input[name='" + key + "']").addClass('error');
                 $('#vacation_form').find("select[name='" + key + "']").addClass('error');
                 error_text.push(data[key]);
               }
               $('#vacation_errors').text(error_text.join('; '));
               return false;
             }
           });
        }
      }
      
      return false;
    });
    
    /* delete vacation */ 
    $('#delete_vacation_button').tap(function(event){
      $('#vacation_errors').text('');
      $('#vacation_form').find("input, select").removeClass('error');
      
      if (RWManagerVacations.selectedModel != null){
        if ($('#vacation_id').val() == RWManagerVacations.selectedModel.get('id')){
          if (confirm('Are you sure?')){
           RWManagerVacations.selectedModel.destroy(
           {
             success: function(model, response){
               jQT.goBack();
               return true;
             },
             error: function(model, response){
               var data = JSON.parse(response.responseText);
               var error_text = [];
               for (key in data){
                 $('#vacation_form').find("input[name='" + key + "']").addClass('error');
                 $('#vacation_form').find("select[name='" + key + "']").addClass('error');
                 error_text.push(data[key]);
               }
               $('#vacation_errors').text(error_text.join('; '));
               return false;
             }
           });
         }
        }
      }
      
      return false;
    });
    
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
        "Accept": "application/json, text/javascript, application/javascript, text/html"
      }
    });
    /* datepicker */
    var date = new Date();
    $('.datechoser').scroller({ 
      preset: 'date',
      dateFormat: 'yy-mm-dd',
      dateOrder: 'ddmmyy',
      startYear: date.getFullYear() - 1,
      endYear: date.getFullYear() + 2
    });
  },
  
  initPages: function(){
    $('#vacations').bind('pageAnimationEnd', function(event, info){
        if (info.direction == 'in') {
          RWManagerVacations.get_stats();
          RWManagerVacations.Vacations.fetch();
        } else {
          $('#vacations_list').html('');
        }
        $(this).data('referrer'); // return the link which triggered the animation, if possible
    });
    
    $('#vacation').bind('pageAnimationEnd', function(e,info){
      if (info.direction == 'in') {
        $('#vacation_errors').text('');
        $('#vacation_form').find("input, select").removeClass('error');
      }
      $(this).data('referrer');
    });
    $('#add_vacation').bind('pageAnimationEnd', function(e,info){
      if (info.direction == 'in') {
        $('#add_vacation_form').find('input').val('');
        $('#add_vacation_errors').text('');
        $('#add_vacation_form').find("input, select").removeClass('error');
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