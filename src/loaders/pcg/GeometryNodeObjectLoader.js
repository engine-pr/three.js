import GeometryNodeLoader from './GeometryNodeLoader.js';
import GeometryNodeMaterialLoader from './GeometryNodeMaterialLoader.js';

import { ObjectLoader } from '../ObjectLoader.js';

/**
 * A special type of object loader for loading 3D objects using
 * geometry node.
 *
 * @augments ObjectLoader
 */
class GeometryNodeObjectLoader extends ObjectLoader {

	/**
	 * Constructs a new node object loader.
	 *
	 * @param {LoadingManager} [manager] - A reference to a loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Represents a dictionary of node types.
		 *
		 * @type {Object<string,GeometryNode.constructor>}
		 */
		this.nodes = {};

		/**
		 * Represents a dictionary of node material types.
		 *
		 * @type {Object<string,GeometryNodeMaterial.constructor>}
		 */
		this.nodeMaterials = {};

		/**
		 * A reference to hold the `nodes` JSON property.
		 *
		 * @private
		 * @type {?Object[]}
		 */
		this._nodesJSON = null;

	}

	/**
	 * Defines the dictionary of node types.
	 *
	 * @param {Object<string,GeometryNode.constructor>} value - The node library defined as `<classname,class>`.
	 * @return {GeometryNodeObjectLoader} A reference to this loader.
	 */
	setGeometryNodes( value ) {

		this.nodes = value;
		return this;

	}

	/**
	 * Defines the dictionary of node material types.
	 *
	 * @param {Object<string,GeometryNodeMaterial.constructor>} value - The node material library defined as `<classname,class>`.
	 * @return {GeometryNodeObjectLoader} A reference to this loader.
	 */
	setGeometryNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	/**
	 * Parses the node objects from the given JSON.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {Function} onLoad - The onLoad callback function.
	 * @return {Object3D}. The parsed 3D object.
	 */
	parse( json, onLoad ) {

		this._nodesJSON = json.nodes;

		const data = super.parse( json, onLoad );

		this._nodesJSON = null; // dispose

		return data;

	}

	/**
	 * Parses the node objects from the given JSON and textures.
	 *
	 * @param {Object[]} json - The JSON definition
	 * @param {Object<string,Texture>} textures - The texture library.
	 * @return {Object<string,GeometryNode>}. The parsed nodes.
	 */
	parseGeometryNodes( json, textures ) {

		if ( json !== undefined ) {

			const loader = new GeometryNodeLoader();
			loader.setGeometryNodes( this.nodes );
			loader.setTextures( textures );

			return loader.parseGeometryNodes( json );

		}

		return {};

	}

	/**
	 * Parses the node objects from the given JSON and textures.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {Object<string,Texture>} textures - The texture library.
	 * @return {Object<string,GeometryNodeMaterial>}. The parsed materials.
	 */
	parseMaterials( json, textures ) {

		const materials = {};

		if ( json !== undefined ) {

			const nodes = this.parseGeometryNodes( this._nodesJSON, textures );

			const loader = new GeometryNodeMaterialLoader();
			loader.setTextures( textures );
			loader.setGeometryNodes( nodes );
			loader.setGeometryNodeMaterials( this.nodeMaterials );

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const data = json[ i ];

				materials[ data.uuid ] = loader.parse( data );

			}

		}

		return materials;

	}

}

export default GeometryNodeObjectLoader;
