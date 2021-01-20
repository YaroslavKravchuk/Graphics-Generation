import {ObjMesh} from './objmesh.js';
import * as vec3 from './gl-matrix/vec3.js';

export function makeFloor(data) {

  /*



  This method is taking in canvas data from an image,
  reading the values at each point, and making a grid
  of height values.

  Then, we make triangles from those height values by
  passing through each row twice, to get triangles in both directions.

  We calculate the normals for each point by the same method we used for PA2,
  by averaging the values of all triangles at a point for all triangles at that point.




  */
    let x = Math.round(Math.sqrt(data.length/4));
    let y = x;

    let positions = [];
    let uvarr = [];
    let prev1 = data[4]/10;
    let prev2 = data[0]/10;
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        positions.push([i-(x/2), j-(y/2), (data[(i*x + j)*4]/10 + prev1 + prev2)/2]);
        uvarr.push([j/x, -i/y]);
        prev2 = prev1;
        prev1 = data[(i*x + j)*4]/10;
      }
    }

    let vert = [];
    for (let i = 0; i < x*y-x; i++) {
      if ((i+1)%y === 0){
        continue;
      }
      vert.push({p: i, n: i, uv: i});
      vert.push({p: i + 1, n: i + 1, uv: i + 1});
      vert.push({p: i + y, n: i + y, uv: i + y});
    }
    for (let i = 1; i < x*y-x; i++) {
      if (i%x === 0) continue;
      vert.push({p: i, n: i, uv: i});
      vert.push({p: i + y, n: i + y, uv: i + y});
      vert.push({p: i + y - 1, n: i + y - 1, uv: i + y - 1});
    }

    let normal = [];
    for (let i = 0; i < positions.length; i++) {
      normal.push([0,0,0]);
    }

    for (let i = 0; i < vert.length; i+=3) {
      let ai = vert[i].p;
      let bi = vert[i+1].p;
      let ci = vert[i+2].p;

      let a = positions[ai];
      let b = positions[bi];
      let c = positions[ci];

      let u = [0,0,0];
      vec3.subtract(u, b, a);
      let v = [0,0,0];
      vec3.subtract(v, c, a);

      let x = (u[1] * v[2]) - (u[2] * v[1]);
      let y = (u[2] * v[0]) - (u[0] * v[2]);
      let z = (u[0] * v[1]) - (u[1] * v[0]);


      normal[ai] = vec3.add(normal[ai], normal[ai], vec3.fromValues(x,y,z));
      normal[bi] = vec3.add(normal[bi], normal[bi], vec3.fromValues(x,y,z));
      normal[ci] = vec3.add(normal[ci], normal[ci], vec3.fromValues(x,y,z));
    }

    for (let i = 0; i < normal.length; i++) {
      vec3.normalize(normal[i], normal[i]);
    }

    const objData = {
        points: positions,
        normals: normal,
        uvs: uvarr,
        verts: vert,
    };

    return new ObjMesh(objData);
}
