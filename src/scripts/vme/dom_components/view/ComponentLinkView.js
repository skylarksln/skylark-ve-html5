define([
    "backbone",
    "./ComponentTextView"
], function(Backbone, ComponentView) {
    return ComponentView.extend({

        events: {
            'dblclick': 'enableEditing',
        },

        render(...args) {
            ComponentView.prototype.render.apply(this, args);

            // I need capturing instead of bubbling as bubbled clicks from other
            // children will execute the link event
            this.el.addEventListener('click', this.prevDef, true);

            return this;
        },

    });
});