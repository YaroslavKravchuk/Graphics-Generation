export const VERT_CODE= `#version 300 es
layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;
layout(location=3) in vec2 vBary;

out vec2 fUv;
out vec3 fNormal;
out vec3 fPosition;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;


void main() {
    mat4 mv = uView * uModel;

    fPosition = (mv * vPosition).xyz;

    fNormal = normalize( mat3(mv) * vNormal );

    fUv = vUv;

    gl_Position = uProj * vec4(fPosition, 1.0);
}`;

export const FRAG_CODE=`#version 300 es
precision highp float;

in vec2 fUv;
in vec3 fNormal;
in vec3 fPosition;

uniform sampler2D colorTexture;

out vec4 fragColor;

void main() {

    fragColor = texture(colorTexture, fUv);

}`;
