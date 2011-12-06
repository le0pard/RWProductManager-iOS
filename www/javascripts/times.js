RWManagerTimes = {
  Time: null,
  TimeList: null,
  Times: null,
  TimeView: null,
  AppView: null,
  App: null,
  selectedModel: null,
  
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
        $('#time_id').val(this.model.get('id'));
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
    
  }
  
};