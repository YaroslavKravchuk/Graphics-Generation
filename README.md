# Graphics Generation


## Overview


This project generates a WebGL maze-game using an input of desired texture and a depth-map for landscape design. The program reads the depth-map and generates a mesh and boundaries for the maze. Shading was created with a multifacet design.


## Result


![Landscape Image](images/World-Generation.png)

## Framework Code
- camera.js: to be able to view the scene from different prespectives (player, no-clip)
- controls.js: implement player controls for navigation and viewing, along with other controls for gameplay
- objloader.js/objmesh.js: import and construct meshes for the scene
- scene.js: our scene datastructure that contains all of our objects
- shader.js: implement lighting

