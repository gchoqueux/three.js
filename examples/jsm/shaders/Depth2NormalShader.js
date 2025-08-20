import {
	Vector2,
	Matrix4
} from 'three';

/**
 * @module Depth2NormalShader
 * @three_import import { Depth2NormalShader } from 'three/addons/shaders/Depth2NormalShader.js';
 */

/**
 * Full-screen copy shader pass.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const Depth2NormalShader = {

	name: 'Depth2NormalShader',

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
		'screenSize': { value: new Vector2() },
		'pMatrixInverse': { value: new Matrix4() },
		'MatrixWorld': { value: new Matrix4() },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		uniform vec2 screenSize;

		// uniform mat3 normalMatrix;
		// uniform mat4 modelViewMatrix;
		// uniform mat4 modelViewMatrixInv;
		uniform mat4 pMatrixInverse;

		uniform mat4 MatrixWorld;


		// vec2 screenSize = vec2(100.0, 100.);

		float time = 0.;


		varying vec2 vUv;

		void camera( out vec3 ro, out vec3 rd, in float time, in vec2 p)
		{
		    // screen split
		    // p.x -= sign(p.x)*1.77777*0.5;

		    // camera position and target
		    ro = vec3(0.5, 0.3, 0.5 );
		    vec3 ta = ro + vec3( -1.0, 0.0, -1.0 );

		    // contruct ray
		    vec3 cw = normalize( ta-ro );
		    vec3 cp = vec3( 0.0, 1.0, 0.0 );
		    vec3 cu = normalize( cross(cw,cp) );
		    vec3 cv = normalize( cross(cu,cw) );
		    rd = normalize( p.x*cu + p.y*cv + 1.8*cw );
		}

		// compute the world space position of a pixel with coordinates
		// fragCoord and distance "depth" to camera. This will need to
		// change depending on wether your depth buffer stores "depth"
		// "z", "reverse z", etc
		vec3 getPos( in ivec2 fragCoord, in float depth )
		{
		    vec2 p = (2.0*vec2(fragCoord)-screenSize.xy)/screenSize.y;
		    // vec2 p = (2.0*vec2(fragCoord))/screenSize.y;
		    vec3 ro, rd;
		    camera( ro, rd, time, p );

			float z = depth * 2.0 - 1.0;

			vec4 clip = vec4(p, z, 1.0);

			vec4 view = pMatrixInverse * clip;
    		view /= view.w;


			return view.xyz;

		    // return depth*rd;
		}

		// naive way of computing the normal
		vec3 computeNormalNaive( const sampler2D depth, in ivec2 p )
		{
		    vec3 l1 = getPos(p-ivec2(1,0),texelFetch(depth,p-ivec2(1,0),0).r);
		    vec3 r1 = getPos(p+ivec2(1,0),texelFetch(depth,p+ivec2(1,0),0).r);
		    vec3 t1 = getPos(p+ivec2(0,1),texelFetch(depth,p+ivec2(0,1),0).r);
		    vec3 b1 = getPos(p-ivec2(0,1),texelFetch(depth,p-ivec2(0,1),0).r);
		    vec3 dpdx = r1-l1;
		    vec3 dpdy = t1-b1;
		    return normalize(cross(dpdx,dpdy));
		}


		// computes the normal at pixel "p" based on the deph buffer "depth"
		vec3 computeNormalImproved( const sampler2D depth, in ivec2 p )
		{
		    float c0 = texelFetch(depth,p           ,0).r;
		    float l2 = texelFetch(depth,p-ivec2(2,0),0).r;
		    float l1 = texelFetch(depth,p-ivec2(1,0),0).r;
		    float r1 = texelFetch(depth,p+ivec2(1,0),0).r;
		    float r2 = texelFetch(depth,p+ivec2(2,0),0).r;
		    float b2 = texelFetch(depth,p-ivec2(0,2),0).r;
		    float b1 = texelFetch(depth,p-ivec2(0,1),0).r;
		    float t1 = texelFetch(depth,p+ivec2(0,1),0).r;
		    float t2 = texelFetch(depth,p+ivec2(0,2),0).r;

		    float dl = abs(l1*l2/(2.0*l2-l1)-c0);
		    float dr = abs(r1*r2/(2.0*r2-r1)-c0);
		    float db = abs(b1*b2/(2.0*b2-b1)-c0);
		    float dt = abs(t1*t2/(2.0*t2-t1)-c0);

		    vec3 ce = getPos(p,c0);

		    vec3 dpdx = (dl<dr) ?  ce-getPos(p-ivec2(1,0),l1) :
		                          -ce+getPos(p+ivec2(1,0),r1) ;
		    vec3 dpdy = (db<dt) ?  ce-getPos(p-ivec2(0,1),b1) :
		                          -ce+getPos(p+ivec2(0,1),t1) ;

		    return normalize(cross(dpdx,dpdy));
		}

		void main() {

			vec2 screenCoordinate = vec2( vUv.x * screenSize.x, (vUv.y) * screenSize.y );

		    vec3 fragCoord = vec3( screenCoordinate.x, screenSize.y - screenCoordinate.y, 0 );

			ivec2 p = ivec2(screenCoordinate);

			// vec4 texel = texture2D( tDiffuse, p );
			vec3 vNormalView = computeNormalImproved( tDiffuse, p );

			// vec3 nWorld = normalize(mat3(MatrixWorld) * vNormalView);

			gl_FragColor = opacity * vec4( vNormalView , 1.0);



		}`

};

export { Depth2NormalShader };
