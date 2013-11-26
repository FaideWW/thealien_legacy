define(["../math", "../entity"], function(AlienMath, Entity) {
    /**
     * systems.RenderSystem
     *
     * properties
     * ~ draw_frequency : Number - period between draw updates, in ms
     * ~ time_since_last_draw : Number - time elapsed since last draw call, in ms
     * 
     * methods
     * ~ RenderSystem.draw ( canvas : HTMLElement, scene : Scene )
     *      - clears the rendering context and draws everything in scene.entities
     *
     * ~ RenderSystem.update( dt : Number, g : Game )
     *      - wrapper for RenderSystem.draw, for calling on the scheduled interval
     *
     * RenderSystem is the handler for drawing objects to the screen.  The renderer
     *  uses the HTML5 canvas, as opposed to WebGL (which will either be considered
     *  a future feature, or be implemented in the next version of alien).
     *
     * Most of the heavy lifting is done by the Entity's Renderable component; 
     *  RenderSystem just calls the Entity's draw() method and provides it with 
     *  the Entity's current position and the rendering context.  This way we can
     *  allow for multiple Renderables in a single Entity, different Renderable
     *  types (texture/sprite, polygon, particle), etc.  We delegate the 
     *  responsibility of actually drawing to the context to the Renderable in order
     *  to decrease modularity.
     *
     * RenderSystem attaches a draw() method to Entity.prototype with the
     *  following type signature:
     *  Entity.prototype.draw( props : Object )
     *      - loops through this.renderables and calls the draw method of each
     *        with props
     *
     * Entity.default_properties is given the following:
     *
     * - position : Math.Vector - the Entity's position in worldspace
     * - renderables : [components.renderable] 
     *         - All renderable components attached to the Entity
     *
     * todo
     * - transformation stack/tree (for complex renderable hierarchies)
     * 
     */

    var RenderSystem = (function () {
        'use strict';

        var draw_frequency = 1000 / 60,
            time_since_last_draw = 0;

        var RenderSystem = {
            draw: function (canvas, scene) {
                var c = canvas.getContext('2d'),
                i;
                c.clearRect(0, 0, canvas.width, canvas.height);

                for (i = 0; i < scene.entities.length; i += 1) {
                    //if the entity has a position, grab it; otherwise set to origin
                    //trigger a draw event with the position and context
                    scene.entities[i].draw({
                        position: scene.entities[i].getPosition(),
                        context: c
                    });
                }
            },
            update: function(dt, g) {
                time_since_last_draw += dt;
                if (time_since_last_draw >= draw_frequency) {
                    this.draw(g.canvas, g.scene);
                    time_since_last_draw = 0;
                }
            }
        };

        Entity.default_properties.position = new AlienMath.Vector();

        Entity.default_properties.renderables = [];

        Entity.prototype.draw = function(props) {
            for (var ren in this.renderables) {
                this.renderables[ren].draw(props);
            }
        };

        return RenderSystem;

    }());
    return RenderSystem;
});
