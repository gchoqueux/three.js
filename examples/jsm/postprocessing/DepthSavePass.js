import { /*BasicDepthPacking,*/ UniformsUtils, ShaderMaterial, NoBlending, WebGLRenderTarget, FloatType } from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';

class DepthSavePass extends Pass {

	constructor( renderTarget /*depthPacking = BasicDepthPacking*/ ) {

		super( 'DepthSavePass' );

		this.textureID = 'tDiffuse';

		this.uniforms = UniformsUtils.clone( CopyShader.uniforms );

		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending

		} );

		this.renderTarget = renderTarget;

		if ( this.renderTarget === undefined ) {

			this.renderTarget = new WebGLRenderTarget( 1, 1, { type: FloatType } ); // will be resized later
			this.renderTarget.texture.name = 'SavePass.rt';

		}

		this.needsSwap = false;

		this.fsQuad = new FullScreenQuad( this.material );

		this.depthTexture = null;

	}

	render( renderer, writeBuffer, readBuffer, /* deltaTime , maskActive */ ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = this.depthTexture || readBuffer.depthTexture;

		}

		renderer.setRenderTarget( this.renderTarget );

		if ( this.clear )
			renderer.clear();
		this.fsQuad.render( renderer );

	}

	setSize( width, height ) {

		this.renderTarget.setSize( width, height );

	}

	dispose() {

		this.renderTarget.dispose();

		this.material.dispose();

		this.fsQuad.dispose();

	}

}

export { DepthSavePass };
