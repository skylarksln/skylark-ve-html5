define([
    'exports',
    'module',
    './config/config',
    './model/Assets',
    './view/AssetsView',
    './view/FileUploader'
], function(exports, module, defaults, Assets, AssetsView, FileUpload) {
    /**
     * * [add](#add)
     * * [get](#get)
     * * [getAll](#getall)
     * * [getAllVisible](#getallvisible)
     * * [remove](#remove)
     * * [getContainer](#getcontainer)
     * * [getAssetsEl](#getassetsel)
     * * [addType](#addtype)
     * * [getType](#gettype)
     * * [getTypes](#gettypes)
     * * [store](#store)
     * * [load](#load)
     *
     * Before using this methods you should get first the module from the editor instance, in this way:
     *
     * ```js
     * var assetManager = editor.AssetManager;
     * ```
     *
     * @module AssetManager
     * @param {Object} config Configurations
     * @param {Array<Object>} [config.assets=[]] Default assets
     * @param {String} [config.uploadText='Drop files here or click to upload'] Upload text
     * @param {String} [config.addBtnText='Add image'] Text for the add button
     * @param {String} [config.upload=''] Where to send upload data. Expects as return a JSON with asset/s object
     * as: {data: [{src:'...'}, {src:'...'}]}
     * @return {this}
     * @example
     * ...
     * {
     * 	assets: [
     *  	{src:'path/to/image.png'},
     *     ...
     *  ],
     *  upload: 'http://dropbox/path', // Set to false to disable it
     *  uploadText: 'Drop files here or click to upload',
     * }
     */

    'use strict';

    module.exports = function() {
        var c = {};

        var assets = undefined,
            am = undefined,
            fu = undefined;

        return {
            /**
             * Name of the module
             * @type {String}
             * @private
             */
            name: 'AssetManager',

            /**
             * Mandatory for the storage manager
             * @type {String}
             * @private
             */
            storageKey: 'assets',

            getConfig: function getConfig() {
                return c;
            },

            /**
             * Initialize module
             * @param {Object} config Configurations
             * @private
             */
            init: function init(config) {
                var _this = this;

                c = config || {};

                for (var _name in defaults) {
                    if (!(_name in c)) c[_name] = defaults[_name];
                }

                var ppfx = c.pStylePrefix;
                var em = c.em;

                if (ppfx) {
                    c.stylePrefix = ppfx + c.stylePrefix;
                }

                // Global assets collection
                assets = new Assets([]);
                var obj = {
                    // Collection visible in asset manager
                    collection: new Assets([]),
                    globalCollection: assets,
                    config: c
                };
                fu = new FileUpload(obj);
                obj.fu = fu;
                am = new AssetsView(obj);

                // Setup the sync between the global and public collections
                assets.listenTo(assets, 'add', function(model) {
                    _this.getAllVisible().add(model);
                    em && em.trigger('asset:add', model);
                });

                assets.listenTo(assets, 'remove', function(model) {
                    _this.getAllVisible().remove(model);
                    em && em.trigger('asset:remove', model);
                });

                return this;
            },

            /**
             * Add new asset/s to the collection. URLs are supposed to be unique
             * @param {string|Object|Array<string>|Array<Object>} asset URL strings or an objects representing the resource.
             * @param {Object} [opts] Options
             * @return {Model}
             * @example
             * // In case of strings, would be interpreted as images
             * assetManager.add('http://img.jpg');
             * assetManager.add(['http://img.jpg', './path/to/img.png']);
             *
             * // Using objects you could indicate the type and other meta informations
             * assetManager.add({
             * 	src: 'http://img.jpg',
             * 	//type: 'image',	//image is default
             * 	height: 300,
             *	width: 200,
             * });
             * assetManager.add([{
             * 	src: 'http://img.jpg',
             * },{
             * 	src: './path/to/img.png',
             * }]);
             */
            add: function add(asset) {
                var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                // Put the model at the beginning
                if (typeof opts.at == 'undefined') {
                    opts.at = 0;
                }

                return assets.add(asset, opts);
            },

            /**
             * Returns the asset by URL
             * @param  {string} src URL of the asset
             * @return {Object} Object representing the asset
             * @example
             * var asset = assetManager.get('http://img.jpg');
             */
            get: function get(src) {
                return assets.where({ src: src })[0];
            },

            /**
             * Return the global collection, containing all the assets
             * @return {Collection}
             */
            getAll: function getAll() {
                return assets;
            },

            /**
             * Return the visible collection, which containes assets actually rendered
             * @return {Collection}
             */
            getAllVisible: function getAllVisible() {
                return am.collection;
            },

            /**
             * Remove the asset by its URL
             * @param  {string} src URL of the asset
             * @return {this}
             * @example
             * assetManager.remove('http://img.jpg');
             */
            remove: function remove(src) {
                var asset = this.get(src);
                this.getAll().remove(asset);
                return this;
            },

            /**
             * Store assets data to the selected storage
             * @param {Boolean} noStore If true, won't store
             * @return {Object} Data to store
             * @example
             * var assets = assetManager.store();
             */
            store: function store(noStore) {
                var obj = {};
                var assets = JSON.stringify(this.getAll().toJSON());
                obj[this.storageKey] = assets;
                if (!noStore && c.stm) c.stm.store(obj);
                return obj;
            },

            /**
             * Load data from the passed object.
             * The fetched data will be added to the collection.
             * @param {Object} data Object of data to load
             * @return {Object} Loaded assets
             * @example
             * var assets = assetManager.load({
             * 	assets: [...]
             * })
             *
             */
            load: function load() {
                var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var name = this.storageKey;
                var assets = data[name] || [];

                if (typeof assets == 'string') {
                    try {
                        assets = JSON.parse(data[name]);
                    } catch (err) {}
                }

                if (assets && assets.length) {
                    this.getAll().reset(assets);
                }

                return assets;
            },

            /**
             * Return the Asset Manager Container
             * @return {HTMLElement}
             */
            getContainer: function getContainer() {
                return am.el;
            },

            /**
             *  Get assets element container
             * @return {HTMLElement}
             */
            getAssetsEl: function getAssetsEl() {
                return am.el.querySelector('[data-el=assets]');
            },

            /**
             * Render assets
             * @param  {array} assets Assets to render, without the argument will render
             *                        all global assets
             * @return {HTMLElement}
             * @example
             * // Render all assets
             * assetManager.render();
             *
             * // Render some of the assets
             * const assets = assetManager.getAll();
             * assetManager.render(assets.filter(
             *  asset => asset.get('category') == 'cats'
             * ));
             */
            render: function render(assets) {
                var toRender = assets || this.getAll().models;

                if (!am.rendered) {
                    am.render();
                }

                am.collection.reset(toRender);
                return this.getContainer();
            },

            /**
             * Add new type
             * @param {string} id Type ID
             * @param {Object} definition Definition of the type. Each definition contains
             *                            `model` (business logic), `view` (presentation logic)
             *                            and `isType` function which recognize the type of the
             *                            passed entity
             * addType('my-type', {
             *  model: {},
             *  view: {},
             *  isType: (value) => {},
             * })
             */
            addType: function addType(id, definition) {
                this.getAll().addType(id, definition);
            },

            /**
             * Get type
             * @param {string} id Type ID
             * @return {Object} Type definition
             */
            getType: function getType(id) {
                return this.getAll().getType(id);
            },

            /**
             * Get types
             * @return {Array}
             */
            getTypes: function getTypes() {
                return this.getAll().getTypes();
            },

            //-------

            AssetsView: function AssetsView() {
                return am;
            },

            FileUploader: function FileUploader() {
                return fu;
            },

            onLoad: function onLoad() {
                this.getAll().reset(c.assets);
            },

            postRender: function postRender(editorView) {
                c.dropzone && fu.initDropzone(editorView);
            },

            /**
             * Set new target
             * @param	{Object}	m Model
             * @private
             * */
            setTarget: function setTarget(m) {
                am.collection.target = m;
            },

            /**
             * Set callback after asset was selected
             * @param	{Object}	f Callback function
             * @private
             * */
            onSelect: function onSelect(f) {
                am.collection.onSelect = f;
            },

            /**
             * Set callback to fire when the asset is clicked
             * @param {function} func
             * @private
             */
            onClick: function onClick(func) {
                c.onClick = func;
            },

            /**
             * Set callback to fire when the asset is double clicked
             * @param {function} func
             * @private
             */
            onDblClick: function onDblClick(func) {
                c.onDblClick = func;
            }
        };
    };
});