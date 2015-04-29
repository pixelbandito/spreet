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
        data = (typeof data == 'object') ? data : {};
        for (key in data) {
            if (typeof this[key] != 'undefined') {
                this[key] = data[key];
            }
        }
    }
});

var DatumText = Datum.extend({
    init: function(data) {
        this._super(data);
    }
});

var DatumNumber = Datum.extend({
    init: function(data) {
        var defaultData = {
            allowedType: 'number',
            max: 'none',
            label: 'Number',
            placeholder: 'Type a number here',
            help: 'Any number will do',
            fieldType: 'number',
            validator: 'minMax',
            value: 0
        }
        data = (typeof data == 'object') ? data : {};
        for (key in defaultData) {
            if (typeof data[key] == 'undefined') {
                data[key] = defaultData[key];
            }
        }
        this._super(data);
    }
});

var Church = Class.extend({
    init: function(data) {
        this.id = new DatumText({value: newUuid()}); // Auto
        this.name = new DatumText({label: 'Name', placeholder: 'Example: First Church', help: '', required: true}); // Create form
        this.description = new DatumText(); // Create form
        this.address = new DatumText(); // Create form
        this.city = new DatumText(); // Create form
        this.state = new DatumText(); // Create form
        this.zip = new DatumText(); // Create form
        this.size = new DatumNumber(); // Create form
        this.faith = new DatumText(); // Create form
        this.denomination = new DatumText(); // Create form
        this.worshpStyle = new DatumText(); // Create form
        this.messageStyle = new DatumText(); // Create form
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
            firstLabel: this.name.label,
            firstType: this.name.fieldType,
            firstPlaceholder: this.name.placeholder,
            firstHelp: this.name.firstHelp,
            firstMin: this.name.min,
            firstMax: typeof this.name.max == 'number' && this.name.max || null,
            firstValidator: this.name.validator
        };
        return form;
    }
});

// var sampleChurch = [
//   'id1': {
//       'id': 'id1', // Auto
//       'name': 'Shoreline Church', // Free text
//       'description': '', // Free text
//       'integrations': {
//         'google': { // Pulled from Google Maps integration
//             'place': '' // string
//         },
//         'yelp': {
//             // ?
//         },
//         'facebook': {
//             'page': '', // Free url
//             'events': '', // Facebook stuff?
//         }
//       },
//       'address': '2010 Burnet Rd', // Free text
//       'city': 'Austin', // Free text
//       'state': 'TX', // Free text
//       'zip': '78754', // Free text
//       'services': [], // Sub-form
//       'size': 0, // Free text
//       'worshipStyle': '', // ??
//       'messageStyle': '', // ??
//       'denomination': 'non-denominational', // ??
//       'amenities': [], // Multi-text
//       'tags': [], // Multi-text
//       'childcare': [], // Computed: "some service" / "all services" / "most services" / "none"
//       'phone': '', // Free tel
//       'website': '', // Free url
//       'averageRating': 0, // Computed
//       'testimonials': [], // Sub-form of testimonials,
//       'media': [], // Sub-form of image or video
//       'relatedChurches': [] // Reference to other church objects
//   }
// ];

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

    var inputChurch = new Church();
    var addChurchForm = inputChurch.getForm();
    console.log(addChurchForm);

    Template.addChurchForm.helpers(addChurchForm);

    // inputChurch = new Church();

    // console.log(inputChurch);

    // Template.addChurchForm.helpers(function() {
    //     return {
    //     firstLabel: inputChurch.name.label,
    //     firstFieldType: inputChurch.name.fieldType,
    //     firstPlaceholder: inputChurch.name.placeholder,
    //     firstHelp: inputChurch.name.firstHelp,
    //     firstMin: inputChurch.name.min,
    //     firstMax: typeof inputChurch.name.max == 'number' && inputChurch.name.max || null,
    //     firstValidator: inputChurch.name.validator
    //     };
    // });

    var firstChurch = new Church({name: 'First Church'});

    // console.log(firstChurch);

    Router.route('/admin', function () {
        Meta.setTitle("Admin");
        this.render('admin');
    });

    Router.route('/', function () {
        this.render('home');
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
    // code to run on server at startup
    });
}
