RWManagerVacations = {
  Vacation: null,
  VacationList: null,
  Vacations: null,
  VacationView: null,
  AppView: null,
  App: null,
  selectedModel: null,
  
  init: function(){
  
    RWManagerVacations.Vacation = Backbone.Model.extend({
      name: "vacation"
    });
    
    RWManagerVacations.VacationList = Backbone.Collection.extend({

      // Reference to this collection's model.
      model: RWManagerVacations.Vacation,
      url: function(){
       return 'http://' + RWProductManager.openIdHost + '/api/mobile/vacations'; 
      }

    });
    
    RWManagerVacations.Vacations = new RWManagerVacations.VacationList;
    
    RWManagerVacations.VacationView = Backbone.View.extend({
      tagName:  "li",
      template: _.template($('#vacation-template').html()),

      events: {
        'tap a' : 'selectedVacation'
      },

      initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);
      },

      render: function() {
        $(this.el).html(this.template(this.model.toJSON())).addClass('arrow');
        return this;
      },
      
      selectedVacation: function(){
        RWManagerVacations.selectedModel = this.model;
        $('#vacation_id').val(this.model.get('id'));
        $('#vacation_reason').val(this.model.get('reason'));
        $('#vacation_description').val(this.model.get('description'));
        $('#vacation_from_date').val(this.model.get('from_date'));
        $('#vacation_to_date').val(this.model.get('to_date'));
      }

    });
    
    RWManagerVacations.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#vacations_box"),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function() {
          RWManagerVacations.Vacations.bind('add',   this.addOne, this);
          RWManagerVacations.Vacations.bind('reset', this.addAll, this);
          RWManagerVacations.Vacations.bind('all',   this.render, this);
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
          return this;
        },

        // Add a single todo item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(vacation) {
          var view = new RWManagerVacations.VacationView({model: vacation});
          this.$("#vacations_list").append(view.render().el);
        },

        // Add all items in the **Todos** collection at once.
        addAll: function() {
          RWManagerVacations.Vacations.each(this.addOne);
        }

      });
      
      RWManagerVacations.App = new RWManagerVacations.AppView;
    
  },
  
  get_stats: function(){
    var url = 'http://' + RWProductManager.openIdHost + '/api/mobile/vacations/stats';
    $.getJSON(url, function(data) {
      $.each(data, function(key, val) {
        $('#' + key + '_data').text(val);
      });
    });
  }
  
};