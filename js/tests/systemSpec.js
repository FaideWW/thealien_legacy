/**
 * Created by faide on 14-09-18.
 */

define(['alien/alien', 'alien/components', 'alien/systems'], function (alien, c, r) {

    describe('global system functionality', function () {
        var game, systems, scene, entities;

        beforeEach(function () {
            var canvas = document.createElement('canvas'), i;
            game = new alien.Game({
                canvas: canvas
            });
            systems = r;
            game.addLoopphase(0, 'loopphase');
            _.each(systems, function (s) {
                game.addSystem(s, 'loopphase');
            });


            entities = [];
            for (i = 0; i < (Math.random() * 1000) | 0; i += 1) {
                entities.push(new alien.Entity());
            }

            scene = new alien.Scene({
                entities: entities
            });

            game.addScene(scene, 'scene');
            game.setActiveScene('scene');

        });

        it('should contain an init method', function () {
            _.each(systems, function (s) {
                expect(typeof s.init).toBe('function');
            });
        });

        it('should contain a step function', function () {
            _.each(systems, function (s) {
                expect(typeof s.step).toBe('function');
            })
        });
    });
});