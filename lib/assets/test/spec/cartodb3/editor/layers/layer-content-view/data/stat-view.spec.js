var Backbone = require('backbone');
var ConfigModel = require('../../../../../../../javascripts/cartodb3/data/config-model');
var StatView = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/data/stat-view');
var TableStats = require('../../../../../../../javascripts/cartodb3/components/modals/add-widgets/tablestats');

describe('editor/layers/layers-content-view/data/stat-view', function () {
  var view;
  var widgetDefinitionsCollection;

  beforeEach(function () {
    var configModel = new ConfigModel({
      base_url: '/u/pepe',
      user_name: 'cdb',
      api_key: 'foo'
    });

    var layerDefinitionModel = new Backbone.Model();
    var analysisDefinitionModel = new Backbone.Model({
      id: 'a0'
    });

    var tuples = [{
      columnModel: new Backbone.Model(),
      analysisDefinitionModel: analysisDefinitionModel,
      layerDefinitionModel: layerDefinitionModel
    }];

    var ts = new TableStats({
      configModel: configModel
    });

    var statModel = new Backbone.Model({
      type: 'formula',
      column: 'number',
      name: 'location',
      layer_index: 0,
      table: 'marias',
      selected: false,
      tuples: tuples
    });

    widgetDefinitionsCollection = new Backbone.Collection([
      {
        type: 'category',
        source: 'a0',
        column: 'location'
      }
    ]);

    var moreStatsModel = new Backbone.Model({
      total: 0,
      shown: 0,
      limit: 5,
      visible: false
    });

    this.stackLayoutModel = jasmine.createSpyObj('stackLayoutModel', ['goToStep']);

    view = new StatView({
      configModel: configModel,
      stackLayoutModel: this.stackLayoutModel,
      moreStatsModel: moreStatsModel,
      statModel: statModel,
      tableStats: ts,
      widgetDefinitionsCollection: widgetDefinitionsCollection
    });

    spyOn(view, 'clean');

    var Graph = {
      stats: {
        avg: 937,
        nulls: 0
      },
      getNullsPercentage: function () {
        return 0;
      },
      getAverage: function () {
        return 937;
      }
    };

    spyOn(TableStats.prototype, 'graphFor').and.callFake(function () {
      view.model.set({graph: Graph});
    });

    view.render();
    view.$el.appendTo(document.body);
  });

  afterEach(function () {
    view.remove();
  });

  it('should render properly', function () {
    expect(view.$('.js-checkbox').length).toBe(1);
    expect(view.$('.js-stat').length).toBe(1);
    expect(view.$('.StatsList-details h2').text()).toBe('location');
    expect(view.$('.StatsList-tag').text()).toBe('number');
    expect(view.$('.js-formula-stat').text()).toContain('937');
  });

  it('should select/unselect the widget properly', function () {
    view.$('.js-checkbox').trigger('click');
    expect(view._statModel.get('selected')).toBe(true);
    expect(view.$('.js-style').hasClass('is-hidden')).toBe(false);
    view.$('.js-checkbox').trigger('click');
    expect(view._statModel.get('selected')).toBe(false);
    expect(view.$('.js-style').hasClass('is-hidden')).toBe(true);
  });

  it('should be selected when widget is added', function () {
    widgetDefinitionsCollection.at(0).set({type: 'formula'});
    view._locateWidget();
    expect(view._statModel.get('selected')).toBe(true);
  });

  it('should go to style widget when clicked on style link', function () {
    view.$('.js-checkbox').trigger('click');
    expect(view.$('.js-style').hasClass('is-hidden')).toBe(false);
    view.$('.js-style').trigger('click');
    expect(this.stackLayoutModel.goToStep).toHaveBeenCalled();
  });

  it('should not have any leaks', function () {
    expect(view).toHaveNoLeaks();
  });
});