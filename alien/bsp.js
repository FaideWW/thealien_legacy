/**
 * BSP tree implementation for entity storage in scenes
 *
 * requirements
 * - tree must be able to be built/rebuilt in between timesteps and without 
 *   interfering with other subsystems
 * - tree must be able to balance itself when entities are added or removed
 * - tree must be able to recalculate an entity's position in the tree after
 *   a position change in worldspace
 * - tree must be able to, given an entity as input, produce a reduced set of
 *   candidate entities for collision detection
 * 
 * notes/observations
 * - building a tree: - pick an entity and a face on that entity
 *                      (the axis we choose is arbitrary but we choose one 
 *                      parallel to the entity so that we have to do less splitting)
 *                    - the 'front' node contains all entities on the same side
 *                      of the face as the rest of the entity's polygon
 *                    - the 'back' node contains everything on the other side
 *                    - entities that are on both sides are split into two 
 *                      polygons, one on either side
 *                    - repeat for non-empty front and back nodes
 *
 * - searching a tree - given an entity and the root, find out what side of the 
 *                      tree the entity lies on
 *                    - if the entity is on the front side, repeat for node->front
 *                    - if the entity is on the back side, repeat for node->back
 *                    - if the entity straddles the line, return node and test
 *                      for collision on that entity
 *
 * - moving objects   - build the tree with static objects first and freeze
 *                    - on every timestep, insert dynamic objects at their new 
 *                      positions
 *                    - since dynamic objects do not intersect static ones in a 
 *                      significant way, they can be represented by their positions 
 *                      only (point insertion is cheap)
 *                    - dynamic objects can be children of static or other dynamic
 *                      objects, but static objects can never be children of 
 *                      dynamic ones.
 *
 * - timestep outline - physics update
 *                    - add dynamic objects into bsp tree
 *                    - collision detection
 *                    - collision resolution
 *                    - re-add collided objects into tree
 *                    - render
 *                    - drop dynamic objects
 */