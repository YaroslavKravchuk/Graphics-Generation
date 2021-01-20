import {ObjMesh} from './objmesh.js';

/**
 * Returns an ObjMesh object that is centered at the origin with given side length.
 *
 * @param {Number} sideLength the length of a side of the square
 * @returns {ObjMesh} the mesh
 */
export function makeTop( sideLength = 1.0 ) {
    const sl2 = sideLength / 2.0;

    const objData = {
        points: [
            [-sl2, -sl2, 0], [sl2, -sl2, 0], [sl2, sl2, 0], [-sl2, sl2, 0]
        ],
        normals: [
            [0, 0, -1]
        ],
        uvs: [
            [0, 0], [1, 0], [1, 1], [0, 1],
        ],

        verts: [
            // Only face
            {p: 0, n: 0, uv: 0}, {p: 1, n: 0, uv: 1}, {p: 2, n: 0, uv: 2},
            {p: 0, n: 0, uv: 0}, {p: 2, n: 0, uv: 2}, {p: 3, n: 0, uv: 3},
        ],
    };

    return new ObjMesh(objData);
}
