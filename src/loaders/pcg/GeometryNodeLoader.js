import { nodeObject, float } from '../../nodes/tsl/TSLBase.js';

import { Loader } from '../Loader.js';
import { FileLoader } from '../FileLoader.js';

/**
 * A loader for loading node objects in the three.js JSON Object/Scene format.
 *
 * @augments Loader
 */
class GeometryNodeLoader extends Loader {

	/**
	 * Constructs a new node loader.
	 *
	 * @param {LoadingManager} [manager] - A reference to a loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Represents a dictionary of textures.
		 *
		 * @type {Object<string,Texture>}
		 */
		this.textures = {};

		/**
		 * Represents a dictionary of node types.
		 *
		 * @type {Object<string,GeometryNode.constructor>}
		 */
		this.nodes = {};

	}

	/**
	 * Loads the node definitions from the given URL.
	 *
	 * @param {string} url - The path/URL of the file to be loaded.
	 * @param {Function} onLoad - Will be called when load completes.
	 * @param {Function} onProgress - Will be called while load progresses.
	 * @param {Function} onError - Will be called when errors are thrown during the loading process.
	 */
	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, ( text ) => {

			try {

				onLoad( this.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				this.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parse the node dependencies for the loaded node.
	 *
	 * @param {Array<Object>} [json] - The JSON definition
	 * @return {Object<string,GeometryNode>} A dictionary with node dependencies.
	 */
	parseGeometryNodes( json ) {

		const nodes = {};

		if ( json !== undefined ) {

			for ( const nodeJSON of json ) {

				const { uuid, type } = nodeJSON;

				nodes[ uuid ] = this.createGeometryNodeFromType( type );
				nodes[ uuid ].uuid = uuid;

			}

			const meta = { nodes, textures: this.textures };

			for ( const nodeJSON of json ) {

				nodeJSON.meta = meta;

				const node = nodes[ nodeJSON.uuid ];
				node.deserialize( nodeJSON );

				delete nodeJSON.meta;

			}

		}

		return nodes;

	}

	/**
	 * Parses the node from the given JSON.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {string} json.type - The node type.
	 * @param {string} json.uuid - The node UUID.
	 * @param {Array<Object>} [json.nodes] - The node dependencies.
	 * @param {Object} [json.meta] - The meta data.
	 * @return {GeometryNode} The parsed node.
	 */
	parse( json ) {

		const node = this.createGeometryNodeFromType( json.type );
		node.uuid = json.uuid;

		const nodes = this.parseGeometryNodes( json.nodes );
		const meta = { nodes, textures: this.textures };

		json.meta = meta;

		node.deserialize( json );

		delete json.meta;

		return node;

	}

	/**
	 * Defines the dictionary of textures.
	 *
	 * @param {Object<string,Texture>} value - The texture library defines as `<uuid,texture>`.
	 * @return {GeometryNodeLoader} A reference to this loader.
	 */
	setTextures( value ) {

		this.textures = value;
		return this;

	}

	/**
	 * Defines the dictionary of node types.
	 *
	 * @param {Object<string,GeometryNode.constructor>} value - The node library defined as `<classname,class>`.
	 * @return {GeometryNodeLoader} A reference to this loader.
	 */
	setGeometryNodes( value ) {

		this.nodes = value;
		return this;

	}

	/**
	 * Creates a node object from the given type.
	 *
	 * @param {string} type - The node type.
	 * @return {GeometryNode} The created node instance.
	 */
	createGeometryNodeFromType( type ) {

		if ( this.nodes[ type ] === undefined ) {

			console.error( 'THREE.GeometryNodeLoader: GeometryNode type not found:', type );
			return float();

		}

		return nodeObject( new this.nodes[ type ]() );

	}

}

export default GeometryNodeLoader;
