RWManagerTimes = {
  Time: null,
  TimeList: null,
  Times: null,
  TimeView: null,
  AppView: null,
  App: null,
  selectedModel: null,
  
  projectsList: null,
  
  init: function(){
  
    RWManagerTimes.Time = Backbone.Model.extend({
      name: "time"
    });
    
    RWManagerTimes.TimeList = Backbone.Collection.extend({

      // Reference to this collection's model.
      model: RWManagerTimes.Time,
      url: function(){
       return 'http://' + RWProductManager.openIdHost + '/api/mobile/time_entries'; 
      }

    });
    
    RWManagerTimes.Times = new RWManagerTimes.TimeList;
    
    RWManagerTimes.TimeView = Backbone.View.extend({
      tagName:  "li",
      template: _.template($('#time-template').html()),

      events: {
        'tap a' : 'selectedTime'
      },

      initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
      },

      render: function() {
        $(this.el).html(this.template(this.model.toJSON())).addClass('arrow');
        return this;
      },
      
      selectedTime: function(){
        RWManagerTimes.selectedModel = this.model;
        RWManagerTimes.get_edit_form_data(this.model);
      }

    });
    
    RWManagerTimes.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#times_box"),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function() {
          RWManagerTimes.Times.bind('add',   this.addOne, this);
          RWManagerTimes.Times.bind('reset', this.addAll, this);
          RWManagerTimes.Times.bind('all',   this.render, this);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
          return this;
        },

        // Add a single todo item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(time_model) {
          var view = new RWManagerTimes.TimeView({model: time_model});
          this.$("#times_list").append(view.render().el);
        },

        // Add all items in the **Todos** collection at once.
        addAll: function() {
          RWManagerTimes.Times.each(this.addOne);
        }

      });
      
      RWManagerTimes.App = new RWManagerTimes.AppView;
    
  },
  
  get_add_form_data: function() {
    $.ajax({
      url: 'http://' + RWProductManager.openIdHost + '/api/mobile/time_entries/get_accounts_and_categories',
      success: function(data){
        $('#add_time_accounts').empty();
        if (data['accounts']){
          var account_options = "";
          $.each(data['accounts'], function(key, value) { 
            account_options += '<option value="' + value['id'] + '">' + value['name'] + '</option>';
          });
          $('#add_time_accounts').html(account_options);
        }
        
        RWManagerTimes.projectsList = data['projects'];
        
        $('#add_time_categories').empty();
        if (data['categories']){
          var categories_options = "";
          $.each(data['categories'], function(key, value) { 
            categories_options += '<option value="' + value['id'] + '">' + value['name'] + '</option>';
          });
          $('#add_time_categories').html(categories_options);
        }
        
        RWManagerTimes.update_projects_by_account($('#add_time_accounts').val());
      }
    });
  },
  
  get_edit_form_data: function(model) {
    $.ajax({
      url: 'http://' + RWProductManager.openIdHost + '/api/mobile/time_entries/get_accounts_and_categories',
      success: function(data){
        $('#time_accounts').empty();
        if (data['accounts']){
          var account_options = "";
          $.each(data['accounts'], function(key, value) { 
            account_options += '<option value="' + value['id'] + '">' + value['name'] + '</option>';
          });
          $('#time_accounts').html(account_options);
        }
        
        RWManagerTimes.projectsList = data['projects'];
        
        $('#time_categories').empty();
        if (data['categories']){
          var categories_options = "";
          $.each(data['categories'], function(key, value) { 
            categories_options += '<option value="' + value['id'] + '">' + value['name'] + '</option>';
          });
          $('#time_categories').html(categories_options);
        }
        
        $('#time_id').val(model.get('id'));
        $('#time_accounts').val(model.get('project')['account_id']);
        $('#time_projects').val(model.get('project_id'));
        $('#time_categories').val(model.get('category_id'));
        $('#time_hours').val(model.get('hours'));
        $('#time_description').val(model.get('description'));
        $('#time_date').val(model.get('date'));
        
        RWManagerTimes.update_projects_by_account($('#time_accounts').val());
      }
    });
  },
  
  update_projects_by_account: function(account_id){
    $('select.time_projects_list').empty();
    if (account_id && RWManagerTimes.projectsList[account_id]){
      var projects_options = "";
      $.each(RWManagerTimes.projectsList[account_id], function(key, value) { 
        projects_options += '<option value="' + value['id'] + '">' + value['title'] + '</option>';
      });
      $('select.time_projects_list').html(projects_options);
    }
  }
  
};