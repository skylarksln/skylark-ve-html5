define([
    'exports',
    'module',
    './config/config',
    './model/ParserCss',
    './model/ParserHtml'
], function(exports, module, defaults, parserCss, parserHtml) {
    'use strict';

    module.exports = function() {
        var c = {};
        var pHtml, pCss;

        return {
            compTypes: '',

            /**
             * Name of the module
             * @type {String}
             * @private
             */
            name: 'Parser',

            /**
             * Initialize module. Automatically called with a new instance of the editor
             * @param {Object} config Configurations
             * @param {Array<Object>} [config.blocks=[]] Default blocks
             * @return {this}
             * @example
             * ...
             * {
             *     blocks: [
             *      {id:'h1-block' label: 'Heading', content:'<h1>...</h1>'},
             *      ...
             *    ],
             * }
             * ...
             */
            init: function init(config) {
                c = config || {};
                for (var name in defaults) {
                    if (!(name in c)) c[name] = defaults[name];
                }
                pHtml = new parserHtml(c);
                pCss = new parserCss(c);
                return this;
            },

            /**
             * Parse HTML string and return valid model
             * @param  {string} str HTML string
             * @return {Object}
             */
            parseHtml: function parseHtml(str) {
                pHtml.compTypes = this.compTypes;
                return pHtml.parse(str, pCss);
            },

            parseCss: function parseCss(str) {
                return pCss.parse(str);
            }
        };
    };
});