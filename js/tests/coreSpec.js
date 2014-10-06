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
            }).toThrowError('No canvas specified');
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
            spyOn(game, 'step').and.callThrough();
            spyOn(InputManager, 'processInput');
        });

        afterEach(function () {
            game.stop();
        });

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

        it('should not allow more than the maximum number of components', function () {
            var i;
            for (i = 0; i < 31; i += 1) {
                game.registerComponent({}, "component" + i);
            }

            expect(function () {
                game.registerComponent({}, "tooMany");
            }).toThrowError('Maximum components registered');
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
            }).toThrowError("Loopphase does not exist");

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
            }).toThrowError('Scene must have a name');
        });

        it('should not allow duplicate scene names', function () {
            var scene1 = new alien.Scene(),
                scene2 = new alien.Scene();

            expect(function () {
                game.addScene(scene1, "scene");
                game.addScene(scene2, "scene");
            }).toThrowError('Scene with that name already exists');
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
            game.addScene(scene, "scene");
            game.setActiveScene("scene");
            expect(game.activeScene).toBe(scene);
        });

        it('should not accept activating a nonexistent scene', function () {
            expect(function () {
                game.setActiveScene("scene");
            }).toThrowError('Scene does not exist');
        });

        it('should change state when run() is called', function () {
            expect(game.__running).toBeFalsy();
            game.run();
            expect(game.__running).toBeTruthy();
        });

        it('should call step when the state is changed', function () {
            game.run();
            expect(game.step).toHaveBeenCalled();
        });

        it('should change state when stop() is called after run()', function () {
            game.run();
            expect(game.__running).toBeTruthy();
            game.stop();
            expect(game.__running).toBeFalsy();
        });

        it('should call step multiple times per second', function (done) {
            game.run();
            setTimeout(function () {
                game.stop();
                expect(game.step.calls.count()).toBeGreaterThan(1);
                done();
            }, 1000);
        });

        it('should process input once per game step', function () {
            game.step(100);
            expect(InputManager.processInput).toHaveBeenCalled();
        });

        it('should not process input if the delta-time does not constitute a full game step', function () {
            game.step(0);
            expect(InputManager.processInput).not.toHaveBeenCalled();
        });

        it('should initialize new systems during a game step', function () {
            var system = {
                init: function () {},
                step: function () {}
            };
            spyOn(system, 'init');

            game.addLoopphase(0, "loopphase");
            game.addSystem(system, "loopphase");

            expect(game.__uninitialized_systems).toBeTruthy();
            game.step(100);
            expect(game.__uninitialized_systems).toBeFalsy();
            expect(system.init).toHaveBeenCalled();
        });

        it('should call system.step() on each system in the order provided', function () {
            var system1, system2, foo;
            game.addLoopphase(0,"loopphase1");
            game.addLoopphase(1,"loopphase2");

            // system1 sets `foo` to true, system2 sets `foo` to false
            // if called in the correct order, `foo` should be false at the end of the step

            system1 = {
                init: function () {},
                step: function () { foo = true; }
            };
            system2 = {
                init: function () {},
                step: function () { foo = false; }
            };

            spyOn(system1, 'step').and.callThrough();
            spyOn(system2, 'step').and.callThrough();

            foo = false;

            game.addSystem(system1, "loopphase1");
            game.addSystem(system2, "loopphase1");

            game.step(100);

            expect(foo).toBeFalsy();
        });

    });

    describe('alien.Entity operation', function () {
        var entity, game, component1, component2;

        beforeEach(function () {
            var canvas = document.createElement('canvas');
            game = new alien.Game({
                canvas: canvas
            });
            entity = new alien.Entity();

            component1 = {
                foo: 'bar1'
            };
            component2 = {
                foo: 'bar2'
            };

            game.registerComponent(component1, "component1");
            game.registerComponent(component2, "component2");
        });

        it('should support adding components', function () {

            entity.addComponent(component1.flag, component1);
            entity.addComponent(component2.flag, component2);
            expect(entity.key).toEqual(component1.flag | component2.flag);
            expect(entity.components[component1.flag]).toBeDefined();
            expect(entity.components[component2.flag]).toBeDefined();
        });

        it('should support removing components', function () {
            entity.addComponent(component1.flag, component1);
            entity.addComponent(component2.flag, component2);

            entity.removeComponent(component1.flag);
            expect(entity.key).toEqual(component2.flag);
            expect(entity.components[component1.flag]).toBeUndefined();
        });
    });

    describe('alien.Scene operation', function () {
        var scene, game, entities;
        beforeEach(function () {
            var canvas, i;

            canvas = document.createElement('canvas');

            entities = [];

            for (i = 0; i < ((Math.random() * 1000) | 0); i += 1) {
                entities.push(new alien.Entity());
            }

            scene = new alien.Scene({
                entities: entities
            });
            game = new alien.Game({
                canvas: canvas
            });
            game.addScene(scene, "scene");
        });

        it('should iterate through all entities when each() is called', function () {
            var caller = jasmine.createSpy("caller");
            scene.each(caller, 0);
            expect(caller.calls.count()).toEqual(entities.length);
        });

        it('should generate all unique pairs of entities when pairs() is called', function () {
            var expected_num, caller;

            // the expected number of unique pairs via the handshake problem:
            // sum of sequence from 1 to n, n being the number of entities
            expected_num = (entities.length * (entities.length - 1)) / 2;

            caller = jasmine.createSpy("caller");

            scene.pairs(caller, 0);

            expect(caller.calls.count()).toEqual(expected_num);
        });
    });

    describe('alien.Math operation', function () {
        it('should create a 2D vector', function () {
            var vec        = alien.Math.vec2(5, 4),
                empty_vec  = alien.Math.vec2(),
                object_vec = alien.Math.vec2({
                    x: 3,
                    y: 2
                });

            expect(vec.x).toBe(5);
            expect(vec.y).toBe(4);
            expect(empty_vec.x).toBe(0);
            expect(empty_vec.y).toBe(0);
            expect(object_vec.x).toBe(3);
            expect(object_vec.y).toBe(2);
        });

        it('should create a 3D vector', function () {
            var vec        = alien.Math.vec3(3,1,2),
                empty_vec  = alien.Math.vec3(),
                object_vec = alien.Math.vec3({
                    x: 4,
                    y: 6,
                    z: 5
                });

            expect(vec.x).toBe(3);
            expect(vec.y).toBe(1);
            expect(vec.z).toBe(2);
            expect(empty_vec.x).toBe(0);
            expect(empty_vec.y).toBe(0);
            expect(empty_vec.z).toBe(0);
            expect(object_vec.x).toBe(4);
            expect(object_vec.y).toBe(6);
            expect(object_vec.z).toBe(5);
        });

        it('should complain if the parameters are wrong', function () {
            expect(function () {
                var vec = alien.Math.vec2('x', 'y');
            }).toThrowError('Invalid parameters');

            expect(function () {
                var vec = alien.Math.vec3('x', 'y', 'z');
            }).toThrowError('Invalid parameters');
        });

        it('should identify 2D vectors', function () {
            var vec = alien.Math.vec2(5,5),
                no_vec = 9;
            expect(alien.Math.isVec2(vec)).toBeTruthy();
            expect(alien.Math.isVec2(no_vec)).toBeFalsy();
        });

        it('should identify 3D vectors', function () {
            var vec = alien.Math.vec3(5,5,5),
                no_vec = 9;
            expect(alien.Math.isVec3(vec)).toBeTruthy();
            expect(alien.Math.isVec3(no_vec)).toBeFalsy();
        });

        it('should equate equivalent vectors', function () {
            var v1 = alien.Math.vec2(2,3),
                v2 = alien.Math.vec2(2,3),
                v3 = alien.Math.vec3(1,2,3),
                v4 = alien.Math.vec3(1,2,3);

            expect(alien.Math.equal(v1, v2)).toBeTruthy();
            expect(alien.Math.equal(v1, v3)).toBeFalsy();
            expect(alien.Math.equal(v3, v4)).toBeTruthy();
            expect(alien.Math.equal(v2, v4)).toBeFalsy();
        });

        it('should add vectors', function () {
            var v1       = alien.Math.vec2(1,2),
                v2       = alien.Math.vec2(3,4),
                result2d = alien.Math.vec2(4,6),

                v3       = alien.Math.vec3(1,2,3),
                v4       = alien.Math.vec3(4,5,6),
                result3d = alien.Math.vec3(5,7,9);

            expect(alien.Math.equal(alien.Math.add(v1, v2), result2d)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.add(v3, v4), result3d)).toBeTruthy();
        });

        it('should subtract vectors', function () {
            var v1       = alien.Math.vec2(1,2),
                v2       = alien.Math.vec2(3,4),
                result2d = alien.Math.vec2(2,2),

                v3       = alien.Math.vec3(1,2,3),
                v4       = alien.Math.vec3(4,5,6),
                result3d = alien.Math.vec3(3,3,3);

            expect(alien.Math.equal(alien.Math.sub(v2, v1), result2d)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.sub(v4, v3), result3d)).toBeTruthy();
        });

        it('should multiply vectors and scalars', function () {
            var v1       = alien.Math.vec2(3,4),
                s1       = 3,
                result2d = alien.Math.vec2(9,12),

                v2       = alien.Math.vec3(3,4,5),
                s2       = 4,
                result3d = alien.Math.vec3(12, 16, 20);

            expect(alien.Math.equal(alien.Math.mul(v1, s1), result2d)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.mul(v2, s2), result3d)).toBeTruthy();
        });

        it('should divide scalars into vectors', function () {
            var v1       = alien.Math.vec2(8,4),
                s1       = 2,
                result2d = alien.Math.vec2(4,2),

                v2       = alien.Math.vec2(8,4,2),
                s2       = 2,
                result3d = alien.Math.vec2(4,2,1);

            expect(alien.Math.equal(alien.Math.div(v1, s1), result2d)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.div(v2, s2), result3d)).toBeTruthy();
        });

        it('should produce dot products', function () {
            var v1 = alien.Math.vec2(3,4),
                v2 = alien.Math.vec2(-3,-4);

            expect(alien.Math.dot(v1, v2)).toEqual(-25);
        });

        it('should rotate vectors', function () {
            var v1        = alien.Math.vec2(3, 4),
                angle1    = Math.PI / 2,
                rotated2d = alien.Math.vec2(-4, 3),

                v2        = alien.Math.vec3(3, 4, 5),
                angle2    = Math.PI / 2,
                axis1      = alien.Math.vec3(1,0,0),
                rotated3d = alien.Math.vec3(3,-5,4),

                v3          = alien.Math.vec3(3, 4, 0),
                angle3      = Math.PI / 2,
                axis2       = alien.Math.vec3(0,0,1),
                rotated3d_2 = alien.Math.vec3(-4, 3, 0);

            expect(alien.Math.equal(alien.Math.rotate(v1, angle1), rotated2d)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.rotate(v2, angle2, axis1), rotated3d)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.rotate(v3, angle3, axis2), rotated3d_2)).toBeTruthy();
        });

        it('should calculate squared magnitude', function () {
            var v1 = alien.Math.vec2(3,4),
                m1 = 25,

                v2 = alien.Math.vec3(3,4,5),
                m2 = 50;

            expect(alien.Math.magSquared(v1)).toEqual(m1);
            expect(alien.Math.magSquared(v2)).toEqual(m2);
        });

        it('should calculate actual magnitude', function () {
            var v1 = alien.Math.vec2(3,4),
                m1 = 5,

                v2 = alien.Math.vec3(3,4,5),
                m2 = Math.sqrt(50);

            expect(alien.Math.mag(v1)).toEqual(m1);
            expect(alien.Math.mag(v2)).toEqual(m2);
        });

        it('should unitize non-unit vectors', function () {
            var v1      = alien.Math.vec2(5, 0),
                result1 = alien.Math.vec2(1, 0),

                v2      = alien.Math.vec3(0, 4, 0),
                result2 = alien.Math.vec3(0, 1, 0);

            expect(alien.Math.equal(alien.Math.unt(v1), result1)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.unt(v2), result2)).toBeTruthy();
        });

        it('should compute a cross product', function () {
            var v1      = alien.Math.vec2(3, 4),
                v2      = alien.Math.vec2(2, 3),
                result1 = 1,

                v3      = alien.Math.vec3(3, 4, 0),
                v4      = alien.Math.vec3(2, 3, 0),
                result2 = alien.Math.vec3(0, 0, 1);

            expect(alien.Math.cross(v1, v2)).toEqual(result1);
            expect(alien.Math.equal(alien.Math.cross(v3, v4), result2)).toBeTruthy();
        });

        it('should produce a scalar projection of one vector onto another', function () {
            var v1 = alien.Math.vec2(3, 3),
                v2 = alien.Math.vec2(0, 5),

                v3 = alien.Math.vec3(3, 4, 3),
                v4 = alien.Math.vec3(0, 0, 5);

            expect(alien.Math.scalarProject(v1, v2)).toEqual(3);
            expect(alien.Math.scalarProject(v3, v4)).toEqual(3);
        });

        it('should produce a vector projection of one vector onto another', function () {
            var v1      = alien.Math.vec2(3, 4),
                v2      = alien.Math.vec2(0, 5),
                result1 = alien.Math.vec2(0, 4),

                v3      = alien.Math.vec3(3, 4, 5),
                v4      = alien.Math.vec3(0, 0, 5),
                result2 = alien.Math.vec3(0, 0, 5);

            expect(alien.Math.equal(alien.Math.vectorProject(v1, v2), result1)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.vectorProject(v3, v4), result2)).toBeTruthy();
        });

        it('should produce a corresponding vector rejection', function () {
            var v1      = alien.Math.vec2(3, 4),
                v2      = alien.Math.vec2(0, 5),
                result1 = alien.Math.vec2(3, 0),

                v3      = alien.Math.vec3(3, 4, 5),
                v4      = alien.Math.vec3(0, 0, 5),
                result2 = alien.Math.vec3(3, 4, 0);

            expect(alien.Math.equal(alien.Math.vectorReject(v1, v2), result1)).toBeTruthy();
            expect(alien.Math.equal(alien.Math.vectorReject(v3, v4), result2)).toBeTruthy();
        });
    });
});