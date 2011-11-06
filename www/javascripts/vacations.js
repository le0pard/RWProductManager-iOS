// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Vacation Model
  // ----------
  window.Vacation = Backbone.Model.extend({
    name: "vacation"
  });

  // Vacation Collection
  // ---------------
  window.VacationList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Vacation,
    url: function(){
     return 'http://' + RWProductManager.openIdHost + '/api/mobile/vacations'; 
    }

  });

  // Create our global collection of **Vacations**.
  window.Vacations = new VacationList;

  // Vacation Item View
  // --------------

  // The DOM element for a vacation item...
  window.VacationView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#vacation-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .vacation_item_edit"               : "edit",
      "click .vacation_item_cancel"             : "cancel"
    },

    // The TodoView listens for changes to its model, re-rendering.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setValues();
      return this;
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the todo item.
    setValues: function() {
      this.$('.vacation_item_reason').text(this.model.get('reason') + ' (from ' + this.model.get('from_date') + ' to ' + this.model.get('to_date') + ')');
      /*
      this.input = this.$('.todo-input');
      this.input.bind('blur', _.bind(this.close, this)).val(text);
      */
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      /*this.input.focus();*/
    },
    
    cancel: function() {
      $(this.el).removeClass("editing");
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  window.AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#vacationapp"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
      Vacations.bind('add',   this.addOne, this);
      Vacations.bind('reset', this.addAll, this);
      Vacations.bind('all',   this.render, this);

      Vacations.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      return this;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(vacation) {
      var view = new VacationView({model: vacation});
      this.$("#vacations_list_view").append(view.render().el);
      /* jquery mobile */
      this.$("#vacations_list_view").listview('refresh');
      this.$('a[data-role="button"]').button();
      this.$('a[data-role="button"]').button('refresh');
      this.$('select').selectmenu();
      this.$('select').selectmenu('refresh');
      this.$('input').textinput();
      this.$('div[data-role="fieldcontain"]').fieldcontain();
      this.$('fieldset[data-role="controlgroup"]').controlgroup();
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      Vacations.each(this.addOne);
    }

  });

  // Finally, we kick things off by creating the **App**.
  window.App = new AppView;

});