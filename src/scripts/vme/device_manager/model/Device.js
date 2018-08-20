define([
    'exports', 
    'module',
    'backbone'
], function(exports, module, backbone) {
    'use strict';

    module.exports = backbone.Model.extend({
        idAttribute: 'name',

        defaults: {
            name: '',

            // Width to set for the editor iframe
            width: '',

            // Height to set for the editor iframe
            height: '',

            // The width which will be used in media queries,
            // If empty the width will be used
            widthMedia: null
        },

        initialize: function initialize() {
            if (this.get('widthMedia') == null) {
                this.set('widthMedia', this.get('width'));
            }
        }
    });
});