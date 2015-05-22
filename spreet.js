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
        this.typeahead = false;
        data = (typeof data == 'object') ? data : {};
        for (key in data) {
            if (typeof this[key] != 'undefined') {
                this[key] = data[key];
            }
        }
        this.id = this.label.replace(/\s/g,'');
    },
    getField: function() {
        var field = {
            label: this.label,
            type: this.fieldType,
            placeholder: this.placeholder,
            help: this.help,
            min: this.min,
            max: typeof this.max == 'number' && this.max || null,
            value: this.value,
            typeahead: this.typeahead,
            name: this.id
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
    },
    setValue: function(data) {
        this.value = data;
        console.log('set value of ', this.label, 'to',data);
    }
});

var Field = Class.extend({
    init: function(data) {
        data = (typeof data == 'object') ? data : {};
        var defaultData = {

        };
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
        delete this.typeahead;
    },
    getField: function() {
        var field = {
            label: this.label,
            type: this.fieldType,
            help: this.help,
            value: this.value,
            choices: this.choices,
            select: true,
            placeholder: this.placeholder,
            typeahead: this.typeahead,
            name: this.id
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
        delete this.typeahead;
    }
});

Churches = new Meteor.Collection('churches');

Faiths = new Meteor.Collection('faiths');

Denominations = new Meteor.Collection('denominations');

WorshipStyles = new Meteor.Collection('worshipStyles');

MessageStyles = new Meteor.Collection('messageStyles');

// TODO: Abstract out forms into their own Class.
// TODO: Add serialization before sticking into MongoDB
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
        this.denomination = new DatumText({label: 'Denomination', placeholder: '', help: '', required: true, typeahead: 'Denominations.name'}); // Create form
        this.worshipStyle = new DatumText({label: 'Worship Style', placeholder: '', help: '', required: false, typeahead: 'WorshipStyles.name'}); // Create form
        this.messageStyle = new DatumText({label: 'Message Style', placeholder: '', help: '', required: false, typeahead: 'MessageStyles.name'}); // Create form
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
        return form;
    },
    resetChurch: function() {
        this.init();
    },
    updateValues: function(data) {
        console.log('updatingValues', data);
        this.name.setValue(data.name);
        this.description.setValue(data.description);
        this.address.setValue(data.address);
        this.city.setValue(data.city);
        this.state.setValue(data.state);
        this.zip.setValue(data.zip);
        this.size.setValue(data.size);
        this.denomination.setValue(data.denomination);
        this.worshipStyle.setValue(data.worshipStyle);
        this.messageStyle.setValue(data.messageStyle);
    }
});

if (Meteor.isClient) {

    Meta.config({
      options: {
        title: "Spreet",
        suffix: "Spreet"
      }
    });

    // View - admin screen
    Template.admin.helpers({
        addChurchFormVisible: function() {
            return Session.get('addChurchFormVisible');
        }
    });
    Template.admin.events({
        'click button[data-click="showAddChurchForm"]': function() {
            Session.set('addChurchFormVisible', true);
        },
        'click button[data-click="hideAddChurchForm"]': function() {
            Session.set('addChurchFormVisible', false);
        }
    });

    // View - add church form
    var inputChurch = new Church();
    var addChurchForm = inputChurch.getForm();
    console.log(addChurchForm);
    Session.set('addChurchForm', addChurchForm);
    Template.addChurchForm.rendered = function() {
        Meteor.typeahead.inject();
    };
    Template.addChurchForm.helpers({
        addChurchForm: function() {
            return Session.get('addChurchForm');
        }
    });
    Template.addChurchForm.events({
        'submit form': function(event) {
            var form = event.target;
            writeChurch(form);
            return false;
        },
        'click button[data-click="clearForm"]': function() {
            clearChurchForm();
        }
    });

    function writeChurch(form) {
        var churchData = {};
        for (var i = 0; i < form.length; i++) {
            var field = form[i];
            console.log('setting field', field);
            if (['text','textarea','select-one'].indexOf(field.type) >= 0) {
                churchData.name = field.getAttribute('data-label');
                churchData.description = field.Description;
                churchData.address = field.Address;
                churchData.city = field.City;
                churchData.state = field.State;
                churchData.zip = field.Zip;
                churchData.size = field.Size;
                churchData.denomination = field.Denomination;
                churchData.worshipStyle = field.WorshipStyle;
                churchData.messageStyle = field.MessageStyle;
            }
        }
        // TODO: Make the datum keys match some element of the field dom
        inputChurch.updateValues(churchData);
        console.log(inputChurch);
    }

    function clearChurchForm() {
        inputChurch.resetChurch();
        Session.set('addChurchForm', addChurchForm);
    }

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
        Denominations.remove({
            name: '$exists'
        });
        for (var i = 0; i < denominations.length; i++) {
            Denominations.remove(denominations[i]);
            Denominations.insert(denominations[i]);
        }
        var worshipStyles = [
            {name: 'Contemporary'},
            {name: 'Traditional'},
            {name: 'Classical'},
            {name: 'Acoustic'},
            {name: 'Alternative'},
            {name: 'Acapella'},
            {name: 'Choral'},
            {name: 'Instrumental'}
        ];
        for (var i = 0; i < worshipStyles.length; i++) {
            WorshipStyles.remove(worshipStyles[i]);
            WorshipStyles.insert(worshipStyles[i]);
        }
        var messageStyles = [
            {name: 'Educational'},
            {name: 'Inspirational'},
            {name: 'Aspirational'},
            {name: 'Strategic'},
            {name: 'Metaphysical'},
            {name: 'Co-operative'}
        ];
        MessageStyles.remove({
            name: '$exists'
        });
        for (var i = 0; i < messageStyles.length; i++) {
            MessageStyles.remove(messageStyles[i]);
            MessageStyles.insert(messageStyles[i]);
        }
    });
}
