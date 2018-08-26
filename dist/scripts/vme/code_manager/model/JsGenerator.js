define([
    'exports', 
    'module',
    'skylark-langx/langx',
    'backbone'
], function(exports, module, langx, backbone) {

    'use strict';

    module.exports = backbone.Model.extend({
        mapModel: function mapModel(model) {
            var code = '';
            var script = model.get('script');
            var type = model.get('type');
            var comps = model.get('components');
            var id = model.getId();

            if (script) {
                // If the component has scripts we need to expose his ID
                var attr = model.get('attributes');
                attr = langx.mixin({}, attr, { id: id });
                model.set('attributes', attr);
                var scrStr = model.getScriptString();

                // If the script was updated, I'll put its code in a separate container
                if (model.get('scriptUpdated')) {
                    this.mapJs[type + '-' + id] = { ids: [id], code: scrStr };
                } else {
                    var mapType = this.mapJs[type];

                    if (mapType) {
                        mapType.ids.push(id);
                    } else {
                        this.mapJs[type] = { ids: [id], code: scrStr };
                    }
                }
            }

            comps.each(function(model) {
                code += this.mapModel(model);
            }, this);

            return code;
        },

        build: function build(model) {
            this.mapJs = {};
            this.mapModel(model);

            var code = '';

            for (var type in this.mapJs) {
                var mapType = this.mapJs[type];
                var ids = '#' + mapType.ids.join(', #');
                code += '\n        var items = document.querySelectorAll(\'' + ids + '\');\n        for (var i = 0, len = items.length; i < len; i++) {\n          (function(){' + mapType.code + '}.bind(items[i]))();\n        }';
            }

            return code;
        }
    });
});