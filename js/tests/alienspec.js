/**
 * Created by faide on 14-09-15.
 */
define(['alien/alien', 'core/input', 'lodash'], function (alien, InputManager, _) {
    describe('alien infrastructure', function () {
        it('should contain a Game constructor', function () {
            expect(typeof alien.Game).toBe('function')
        });

        it('should contain an Entity constructor', function () {
            expect(typeof alien.Entity).toBe('function');
        });

        it('should contain a Scene constructor', function () {
            expect(typeof alien.Scene).toBe('function');
        });
    });

    describe('new alien.Game()', function () {
        var canvas, game;


        beforeEach(function () {
            spyOn(InputManager, 'init');

            canvas = document.createElement('canvas');

            game   = new alien.Game({
                canvas: canvas
            });
        });

        it('should construct a new Game instance', function () {
            expect(game instanceof alien.Game).toBeTruthy();
        })

        it('should expect a canvas property', function () {
            expect(function () {
                var null_game = new alien.Game();
            }).toThrow(new Error('No canvas specified'));
        });



        it('should accept a canvas as a DOM element', function () {
            expect(game).toBeDefined();
            expect(game.ctx).toBeDefined();
            expect(game.ctx.canvas).toBe(canvas);
        });

        it('should accept a canvas as an ID string', function () {
            canvas.id = "game_canvas";
            document.children[0].appendChild(canvas);
            var game2 = new alien.Game({
                canvas: "game_canvas"
            });
            expect(game2).toBeDefined();
            expect(game.ctx).toBeDefined();
            expect(game.ctx.canvas).toBe(canvas);


        });

        it('should initialize a component registry', function () {
            expect(game._currentComponentBit).toEqual(1);
            expect(game._componentFlags).toEqual({});
            expect(typeof game.registerComponent).toBe('function');
        });

        it('should initialize a loopphase list', function () {
            expect(game._loopphases).toEqual([]);
            expect(typeof game.addLoopphase).toBe('function');
        });

        it('should initialize a systems queue', function () {
            expect(game.systems).toEqual({});
            expect(game.__uninitialized_systems).toBeDefined();
            expect(typeof game.addSystem).toBe('function');
            expect(typeof game.initializeNewSystems).toBe('function');
        });

        it('should initialize a scene dictionary', function () {
            expect(game.scenes).toEqual({});
            expect(game.activeScene).toBeDefined();
            expect(typeof game.addScene).toBe('function');
            expect(typeof game.setActiveScene).toBe('function');
        });

        it('should accept a pre-defined list of loopphases', function () {
            var loopphases = ['foo', 'bar', 'baz'],
                preset_game = new alien.Game({
                    canvas:     canvas,
                    loopphases: loopphases
                });
            expect(preset_game).toBeDefined();
            expect(preset_game._loopphases).toBe(loopphases);
        });


        it('should initialize the InputManager', function () {
            expect(InputManager.init).toHaveBeenCalled();
        });

        it('should initialize its state manager', function () {
            expect(game.__running).toBeDefined();
            expect(typeof game.run).toBe('function');
            expect(typeof game.stop).toBe('function');
            expect(typeof game.step).toBe('function');
        })
    });

    describe('new alien.Entity()', function () {
        var entity;

        beforeEach(function () {
            entity = new alien.Entity();
        });

        it('should construct an Entity instance', function () {
            expect(entity instanceof alien.Entity).toBeTruthy();
        });

        it('should assign a unique ID', function () {
            var i,
                entities = [],
                unique_entities;
            for (i = 0; i < 1000; i += 1) {
                entities.push(new alien.Entity());
            }
            unique_entities = _.unique(entities, function (entity) {
                return entity.id;
            });
            expect(entities.length).toEqual(unique_entities.length);
        });

        it('should initialize a bitmask key', function () {
            expect(entity.key).toEqual(0);
        });

        it('should initialize a component dictionary', function () {
            expect(entity.components).toEqual([]);
            expect(typeof entity.addComponent).toBe('function');
            expect(typeof entity.removeComponent).toBe('function');
        });
    });

    describe('new alien.Scene()', function () {
        var scene;

        beforeEach(function () {
            scene = new alien.Scene();
        });

        it('should construct a Scene instance', function () {
            expect(scene instanceof alien.Scene).toBeTruthy();
        });

        it('should initialize null references to global game objects', function () {
            expect(scene.msg).toBeNull();
            expect(scene.input).toBeNull();
            expect(scene.renderTarget).toBeNull();
        });

        it('should initialize an entity list', function () {
            expect(scene.entities).toEqual([]);
        });

        it('should initialize a tilemap reference', function () {
            expect(scene.tilemap).toBeNull();
        });

        it('should accept an optional entity list', function () {
            var entities = ['foo','bar','baz'],
                scene_with_entities = new alien.Scene({
                    entities: entities
                });
            expect(scene_with_entities.entities).toBe(entities);
        });

        it('should accept an optional tilemap', function () {
            var tilemap = {
                    foo: 'bar'
                },
                scene_with_map = new alien.Scene({
                    tilemap: tilemap
                });
            expect(scene_with_map.tilemap).toBe(tilemap);
        });

        it('should contain methods for iterating through entities/entity pairs', function () {
            expect(typeof scene.each).toBe('function');
            expect(typeof scene.pairs).toBe('function');
        });
    });

    describe('alien.Game operation', function () {
        var game, canvas;

        beforeEach(function () {
            canvas = document.createElement('canvas');
            game = new alien.Game({
                canvas: canvas
            });
        });

        afterEach(function () {
            game.stop();
        })

        it('should register components correctly', function () {
            var component1 = {
                    foo: 'bar1'
                },
                component2 = {
                    foo: 'bar2'
                };

            expect(component1.flag).toBeUndefined();
            game.registerComponent(component1, "flag1");
            expect(component1.flag).toBeDefined();

            expect(component2.flag).toBeUndefined();
            game.registerComponent(component2, "flag2");
            expect(component2.flag).toBeDefined();

            expect(component1.flag !== component2.flag).toBeTruthy();
        });

        it('should support adding new loopphases', function () {
            expect(game._loopphases).toEqual([]);
            game.addLoopphase(0, "loopphase2");
            game.addLoopphase(1, "loopphase3");
            game.addLoopphase(0, "loopphase1");
            expect(game._loopphases).toEqual(["loopphase1", "loopphase2", "loopphase3"]);
        });

        it('should create corresponding system queues for each added loopphase', function () {
            expect(game.systems.loopphase2).toBeUndefined();
            game.addLoopphase(0, "loopphase2");
            expect(game.systems.loopphase2).toEqual([]);
        });

        it('should support adding new systems', function () {
            var system = {
                foo: 'bar'
            };

            game.addLoopphase(0, "loopphase");
            expect(game.systems.loopphase).toEqual([]);
            game.addSystem(system, "loopphase");
            expect(game.systems.loopphase.length).toBe(1);
            expect(game.systems.loopphase[0]).toBe(system);
        });

        it('should throw an error if adding a system to a nonexistent loopphase', function () {
            var system = {
                foo: 'bar'
            };
            expect(function () {
                game.addSystem(system, "loopphase");
            }).toThrow(new Error("Loopphase does not exist"));

        });

        it('should flag newly added systems as uninitialized', function () {
            expect(game.__uninitialized_systems).toBeTruthy();
            var system = {
                foo: 'bar'
            };
            game.addLoopphase(0, "loopphase");
            game.addSystem(system, "loopphase");
            expect(system.__initialized).toBeFalsy();
        });

        it('should unflag uninitialized systems after initialization', function () {
            var system = {
                init: function () {}
            };
            game.addLoopphase(0, "loopphase");
            game.addSystem(system, "loopphase");

            expect(game.__uninitialized_systems).toBeTruthy();
            expect(system.__initialized).toBeFalsy();

            game.initializeNewSystems();

            expect(game.__uninitialized_systems).toBeFalsy();
            expect(system.__initialized).toBeTruthy();
        });

        it('should support adding new scenes', function () {
            var scene = new alien.Scene();
            expect(game.scenes.scene1).toBeUndefined();
            game.addScene(scene, "scene1");
            expect(game.scenes.scene1).toBeDefined();
        });

        it('should not allow scenes with no name', function () {
            var scene = new alien.Scene();
            expect(function () {
                game.addScene(scene);
            }).toThrow(new Error('Scene must have a name'));
        });

        it('should not allow duplicate scene names', function () {
            var scene1 = new alien.Scene(),
                scene2 = new alien.Scene();

            expect(function () {
                game.addScene(scene1, "scene");
                game.addScene(scene2, "scene");
            }).toThrow(new Error('Scene with that name already exists'));
        });

        it('should bind references to global game systems to new scenes', function () {
            var scene = new alien.Scene();
            game.addScene(scene, "scene1");
            expect(scene.input).not.toBeNull();
            expect(scene.msg).not.toBeNull();
            expect(scene.renderTarget).not.toBeNull();
        });

        it('should support setting an active scene', function () {
            var scene = new alien.Scene();
        });

        it('should change state when run() is called', function () {
            expect(game.__running).toBeFalsy();
            game.run();
            expect(game.__running).toBeTruthy();
        });

        it('should change state when stop() is called after run()', function () {
            game.run();
            expect(game.__running).toBeTruthy();
            game.stop();
            expect(game.__running).toBeFalsy();
        })
    });

    xdescribe('alien.Entity operation', function () {
        var entity;

        beforeEach(function () {
            entity = new alien.Entity();
        });

        it('should support adding components', function () {
        })
    })
});