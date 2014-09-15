/**
 * Created by faide on 14-09-15.
 */
define(['alien/alien'], function (alien) {
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

    describe('Game creation', function () {
        it('should expect a canvas object', function () {
            expect(function () {
                var null_game = new alien.Game();
            }).toThrow(new Error('No canvas specified'));
        });

        it('should accept a canvas')
    })
});