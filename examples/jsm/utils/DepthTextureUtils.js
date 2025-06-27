import { Vector2, Vector3 } from 'three';

const NDC = new Vector3();
const cursorNDC = new Vector2();
const z_Axis = new Vector3( 0, 0, - 1 );
/**
 * Converts depth to view position.
 * @param {Vector2} cursorNDC - Normalized device coordinates of the cursor.
 * @param {number} depth - Depth value.
 * @param {Camera} camera - Camera object.
 * @returns {Vector3} - View position.
 */
function depthToViewPosition( cursorNDC, depth, camera ) {

	// depth to Z NDC
	const zNDC = 2.0 * depth - 1.0;

	NDC.set( cursorNDC.x, cursorNDC.y, zNDC );

	const viewPosition = NDC.applyMatrix4( camera.projectionMatrixInverse );

	return viewPosition;

}

/**
 * Converts logarithmic depth to view position.
 * @param {Vector2} cursorNDC - Normalized device coordinates of the cursor.
 * @param {number} logDepth - Logarithmic depth value.
 * @param {Camera} camera - Camera object.
 * @returns {Vector3} - View position.
 */
function logDepthToViewPosition( cursorNDC, logDepth, camera ) {

	const w = ( camera.far + 1.0 ) ** logDepth - 1;

	NDC.set( cursorNDC.x, cursorNDC.y, - 1 );
	const viewPosition = NDC.applyMatrix4( camera.projectionMatrixInverse );

	const angle = viewPosition.angleTo( z_Axis );
	viewPosition.setLength( w / Math.cos( angle ) );

	return viewPosition;

}

const buffer = new Float32Array( 4 );

const pickWorldPosition = ( mouse, renderer, renderTarget, camera, target ) => {

	const canvasRect = renderer.domElement.getBoundingClientRect();

	const left = mouse.x - canvasRect.left;
	const bottom = canvasRect.bottom - mouse.y;

	renderer.readRenderTargetPixels( renderTarget, left, bottom, 1, 1, buffer );

	const depth = buffer[ 0 ];

	cursorNDC.setX( ( left / canvasRect.width ) * 2 - 1 );
	cursorNDC.setY( ( bottom / canvasRect.height ) * 2 - 1 );

	if ( renderer.capabilities.logarithmicDepthBuffer && camera.isPerspectiveCamera ) {

		target.copy( logDepthToViewPosition( cursorNDC, depth, camera ) );

	} else {

		target.copy( depthToViewPosition( cursorNDC, depth, camera ) );

	}

	target.applyMatrix4( camera.matrixWorld );

	return target;

};

export { pickWorldPosition };
