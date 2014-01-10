//Compile all modules together
define([
	"./components/behavior",
	"./components/collidable",
	"./components/controller",
	"./components/movement",
	"./components/renderable",
	"./systems/behavior",
	"./systems/collision",
	"./systems/event",
	"./systems/physics",
	"./systems/render",
	"./bsp",
	"./entity",
	"./game",
	"./global",
	"./math",
	"./promise",
	"./scene",
	], 
	function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q) {
		return {
			components: {
				behavior: a,
				collidable: b,
				Controller: c,
				movement: d,
				renderable: e
			},
			systems: {
				BehaviorSystem: f,
				CollisionSystem: g,
				EventSystem: h,
				PhysicsSystem: i,
				RenderSystem: j
			},
			BSP: k,
			Entity: l,
			Game: m,
			Global: n,
			Math: o,
			Promise: p,
			Scene: q
		};
});