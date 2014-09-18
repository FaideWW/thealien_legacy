/**
 * Created by faide on 14-09-18.
 */

define(['alien/alien', 'alien/components', 'alien/systems'], function (alien, c, r) {

    var setUpGame = function (system, components) {
        var mock_canvas = {
                getContext: function () {
                    return context;
                }
            },
            i,
            flag_obj = {},
            context = {
                canvas: {
                    width: 240,
                    height: 160,
                    addEventListener: function () {}
                },
                clearRect: jasmine.createSpy('clearRect'),
                translate: jasmine.createSpy('translate'),
                rotate:    jasmine.createSpy('rotate'),
                beginPath: jasmine.createSpy('beginPath'),
                rect:      jasmine.createSpy('rect'),
                fill:      jasmine.createSpy('fill'),
                stroke:    jasmine.createSpy('stroke'),
                save:      jasmine.createSpy('save'),
                restore:   jasmine.createSpy('restore')
            },
            game = new alien.Game({
                canvas: mock_canvas
            }),
            entities = [],
            scene;

        // set up game instance

        game.addLoopphase(0, "loopphase");
        game.addSystem(system, "loopphase");

        components = _.map(components, function (c) {
            // string-only syntactic sugar for components array:
            //  if a component has the same flag and name, it can
            //  be represented as a string instead of the full object;
            //  this finds those strings and expands them
            if (typeof c === 'string') {
                c = {
                    flag: c,
                    name: c
                };
            }
            return c;
        });

        for (i = 0; i < components.length; i += 1) {
            flag_obj[components[i].flag] = {};
            game.registerComponent(flag_obj[components[i].flag], components[i].flag);
        }

        _.times(100, function () {
            var e = new alien.Entity(), j;

            for (j = 0; j < components.length; j += 1) {
                e.addComponent(flag_obj[components[j].flag].flag, new c[components[j].name]());
            }

            entities.push(e);
        });

        scene = new alien.Scene({
            entities: entities
        });

        game.addScene(scene, "scene");
        game.setActiveScene("scene");

        return {
            game: game,
            system: system,
            scene: scene,
            entities: entities,
            context: context
        }

    };

    describe('render system operation', function () {
        var game, render, scene, entities, context;

        beforeEach(function () {
            var game_object = setUpGame(r.render_system, [
                {
                    flag: 'renderable',
                    name: 'square_renderable'
                },
                'position'
            ]);

            // unpack setup object

            game = game_object.game;
            render = game_object.system;
            scene = game_object.scene;
            entities = game_object.entities;
            context = game_object.context;
        });

        afterEach(function () {
            game.stop();
        });

        it('should save and restore an equal number of times per step', function () {
            game.step(1);
            expect(context.save.calls.count()).toEqual(context.save.calls.count());
        });

        it('should perform a draw once per renderable component', function () {
            game.step(1);
            expect(context.stroke.calls.count()).toEqual(entities.length);
        })
    });

    describe('orbit system operation', function () {
        var game, orbit, scene, entities, context;

        beforeEach(function () {
            var game_object = setUpGame(r.orbit_system, ['translation', 'rotation', 'orbital']);

            game = game_object.game;
            orbit = game_object.system;
            scene = game_object.scene;
            entities = game_object.entities;
            context = game_object.context;
        });


    });
});