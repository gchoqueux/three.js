import {
	WebGLRenderTarget,
	FloatType
} from 'three';

import { SavePass } from 'three/addons/postprocessing/SavePass.js';
import { Depth2NormalShader } from '../shaders/Depth2NormalShader.js';


/**
* A pass that saves the depth contents of the current read  buffer in a render target.
*
* ```js
* const depthSavePass = new DepthSavePass( customRenderTarget );
* composer.addPass( depthSavePass );
* ```
*
* @augments SavePass
* @three_import import { SavePass } from 'three/addons/postprocessing/SavePass.js';
*/

// WARNING Doesn't work with log depth

class Depth2NormalPass extends SavePass {

	constructor( renderTarget, texture, camera ) {

		if ( renderTarget === undefined ) {

			renderTarget = new WebGLRenderTarget( 1, 1, { type: FloatType } ); // will be resized later
			renderTarget.texture.name = 'Depth2NormalPass.rt';

		}

		super( renderTarget );

		this.texture = texture;

		this.material.vertexShader = Depth2NormalShader.vertexShader;
		this.material.fragmentShader = Depth2NormalShader.fragmentShader;

		this.material.uniforms.screenSize = Depth2NormalShader.uniforms.screenSize;

		this.material.uniforms.pMatrixInverse = Depth2NormalShader.uniforms.pMatrixInverse;
		this.material.uniforms.MatrixWorld = Depth2NormalShader.uniforms.MatrixWorld;

		this.material.uniforms.pMatrixInverse.value.copy( camera.projectionMatrixInverse );

	}

	setSize( width, height ) {

		this.renderTarget.setSize( width, height );

		this.material.uniforms.screenSize.value.set( width, height );

	}

	/**
	 * Performs the depth save pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */

	render( renderer, writeBuffer, readBuffer, /* deltaTime , maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = this.texture;

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		this._fsQuad.render( renderer );

	}

}

export { Depth2NormalPass };
