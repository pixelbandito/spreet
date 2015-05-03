/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();

/* TODO:
    Create classes for relevant data types
    * Church
    * Service
    * Testimonial
    * Image
    * Video
    * Dimension
    * Review
    * Childcare
    * Tag
    * Amenity
*/
// TODO: Create user roles for admins and users
// TODO: Create form for adding churches (user)
// TODO: CRUD for churches (admins)
// TODO: Create display for viewing churches
// TODO: Create display for finding churches locally
// TODO: Create filters for finding churches
// TODO: Create form for matching user with churches
// TODO: Create form for user rating churches

function newUuid() {
     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var Datum = Class.extend({
    init: function(data) {
        this.allowedType = 'string';
        this.max = 120;
        this.min = 0;
        this.required = false;
        this.value = '';
        this.label = 'Text';
        this.placeholder = 'Type text here';
        this.help = 'Any text will do';
        this.fieldType = 'text';
        this.validator = new RegExp();
        this.choices = [];
        data = (typeof data == 'object') ? data : {};
        for (key in data) {
            if (typeof this[key] != 'undefined') {
                this[key] = data[key];
            }
        }
    },
    getField: function() {
        var field = {
            label: this.label,
            type: this.fieldType,
            placeholder: this.placeholder,
            help: this.help,
            min: this.min,
            max: typeof this.max == 'number' && this.max || null,
            value: this.value
        }
        switch(this.fieldType) {
            case 'text':
                field.input = true;
                break;
            case 'number':
                field.input = true;
                break;
            case 'textarea':
                field.textarea = true;
                break;
        }
        return field;
    }
});

var DatumChoice = Datum.extend({
    init: function(data) {
        data = (typeof data == 'object') ? data : {};
        var defaultData = {
            allowedType: 'string',
            label: 'Choice',
            help: 'Pick an item from the list',
            fieldType: 'select',
            placeholder: 'Choose one',
            choices: [
                {
                    key: 'a',
                    value: 'A'
                },
                {
                    key: 'b',
                    value: 'B'
                },
                {
                    key: 'c',
                    value: 'C'
                },
                {
                    key: 'd',
                    value: 'D'
                },
                {
                    key: 'e',
                    value: 'All of the above'
                }
            ],
            allowOther: false
        };
        for (key in defaultData) {
            if (typeof data[key] == 'undefined') {
                data[key] = defaultData[key];
            }
        }
        this._super(data);
        delete this.max;
        delete this.min;
        delete this.validator;
    },
    getField: function() {
        var field = {
            label: this.label,
            type: this.fieldType,
            help: this.help,
            value: this.value,
            choices: this.choices,
            select: true,
            placeholder: this.placeholder
        };
        return field;
    }
});

var DatumText = Datum.extend({
    init: function(data) {
        this._super(data);
    }
});

var DatumNumber = Datum.extend({
    init: function(data) {
        data = (typeof data == 'object') ? data : {};
        var defaultData = {
            allowedType: 'number',
            max: 'none',
            label: 'Number',
            placeholder: '0',
            help: 'Any number will do',
            fieldType: 'number',
            validator: 'minMax',
            value: 0
        };
        for (key in defaultData) {
            if (typeof data[key] == 'undefined') {
                data[key] = defaultData[key];
            }
        }
        this._super(data);
    }
});

Churches = new Meteor.Collection('churches');

Faiths = new Meteor.Collection('faiths');

Denominations = new Meteor.Collection('denominations');

WorshipStyles = new Meteor.Collection('worshipStyles');

MessageStyles = new Meteor.Collection('messageStyles');

var Church = Class.extend({
    init: function(data) {
        this.id = new DatumText({value: newUuid()}); // Auto
        this.name = new DatumText({label: 'Name', placeholder: 'Example: First Church', help: '', required: true}); // Create form
        this.description = new DatumText({label: 'Description', placeholder: 'Example: Quiet, older church building with a yound congregation.', help: '', required: true, fieldType: 'textarea'}); // Create form
        this.address = new DatumText({label: 'Address', placeholder: '123 Main St.', help: '', required: true}); // Create form
        this.city = new DatumText({label: 'City', placeholder: 'New York', help: '', required: true}); // Create form
        this.state = new DatumText({label: 'State', placeholder: 'NY', help: '', required: true, min: 2, max: 2}); // Create form
        this.zip = new DatumText({label: 'ZIP', placeholder: '000000', help: '', required: true, min: 5}); // Create form
        this.size = new DatumChoice({label: 'Size', help: 'How many members attend in a typical weekend?',
            choices: [
                {
                    key: 'xxs',
                    value: '0 - 49 people'
                },
                {
                    key: 'xs',
                    value: '50 - 199 people'
                },
                {
                    key: 'sm',
                    value: '200 - 499 people'
                },
                {
                    key: 'md',
                    value: '500 - 999 people'
                },
                {
                    key: 'lg',
                    value: '1,000 - 4,999 people'
                },
                {
                    key: 'xl',
                    value: '5,000+ people'
                }
            ]
        }); // Create form
        this.faith = new DatumText({label: 'Faith', placeholder: 'Christian', help: '', required: true, value: 'Christian'}); // Create form
        this.denomination = new DatumText({label: 'Denomination', placeholder: 'Methodist', help: '', required: true}); // Create form
        this.worshipStyle = new DatumText({label: 'Worship style', placeholder: 'Contemporary', help: '', required: false}); // Create form
        this.messageStyle = new DatumText({label: 'Message style', placeholder: 'Instructional', help: '', required: false}); // Create form
        this.relatedChurches = []; // Create form
        this.integrations = {}; // Sub-form
        this.services = {}; // Sub-form
        this.amenities = []; // Sub-form
        this.tags = []; // Sub-form
        this.childcare = ''; // Computed
        this.phone = ''; // Create form
        this.website = ''; // Create form
        this.averageRating = 0; // Computed
        this.testimonials = []; // Collected later
        this.media = []; // Collected later
        this.adminFields = [
            this.name,
            this.description,
            this.address,
            this.city,
            this.state,
            this.zip,
            this.size,
            this.denomination,
            this.worshipStyle,
            this.messageStyle
        ];
        data = (typeof data == 'object') ? data : {};
        for (key in data) {
            if (typeof this[key] != 'undefined') {
                if (typeof data[key] == this[key].allowedType) {
                    this[key].value = data[key];
                }
            }
        }
    },
    getForm: function() {
        var form = {
                forms: [
                {
                    type: 'fieldset',
                    legend: 'Add a church',
                    fields: []
                }
            ]
        };
        for (var i = 0; i < this.adminFields.length; i++) {
            form.forms[0].fields.push(this.adminFields[i].getField());
        }
        console.log(form);
        return form;
    }
});

if (Meteor.isClient) {

    Meta.config({
      options: {
        title: "Spreet",
        suffix: "Spreet"
      }
    });

    // counter starts at 0
    Session.setDefault('counter', 0);

    Template.hello.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });

    Template.hello.events({
        'click button': function () {
            // increment the counter when button is clicked
            Session.set('counter', Session.get('counter') + 1);
        }
    });

    // View - admin screen
    Template.admin.helpers({
        addChurchFormVisible: function() {
            return Session.get('addChurchFormVisible')
        }
    });
    Template.admin.events({
        'click button[data-click="showAddChurchForm"]': function() {
            Session.set('addChurchFormVisible', true);
        },
        'click button[data-click="hideAddChurchForm"]': function() {
            Session.set('addChurchFormVisible', false);
        },
        'click button[data-click="clearChurchFormVisible"]': function() {

        }
    });

    // View - add church form
    var inputChurch = new Church();
    var addChurchForm = inputChurch.getForm();
    Template.addChurchForm.helpers({
        denominations: function() {
            return Denominations.find().fetch().map(function(it) {return it.name});
        }
    });

    Template.addChurchForm.helpers(addChurchForm);
    // Template.addChurchForm.events(addChurchForm);

    // Sample church
    var firstChurch = new Church({name: 'First Church'});

    Router.route('/admin', function () {
        Meta.setTitle("Admin");
        this.render('admin');
    });

    Router.route('/', function () {
        this.render('home');
    });

    function show(target) {
        target.visible = true;
    }
    function hide(target) {
        target.visible = false;
    }
    function toggle(target) {
        target.visible = !target.visible;
    }
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup

        // Lists from which to autocomplete
        // Denominations = new Meteor.Collection('denominations');
        var denominations = [
            {name: 'Catholic - Latin Catholic'},
            {name: 'Catholic - Eastern Catholic'},
            {name: 'Catholic - Other Catholic'},
            {name: 'Baptist'},
            {name: 'Lutheran'},
            {name: 'Presbyterian'},
            {name: 'Methodist'},
            {name: 'Pentecostal'},
            {name: 'Seventh-day Adventist'},
            {name: 'New Apostolic'},
            {name: 'Russian Orthodox'},
            {name: 'Romanian Orthodox'},
            {name: 'Church of Greece'},
            {name: 'Episcopal'},
            {name: 'Mormon'},
            {name: 'Jehovah\'s Witness'},
            {name: 'Unitarian'},
            {name: 'Non-denominational'},
        ];
        for (var i = 0; i < denominations.length; i++) {
            Denominations.insert(denominations[i]);
        }
    });
}
