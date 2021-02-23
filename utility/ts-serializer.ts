

/*
 * Copyright 2016 - Daniel Popescu <dpopescu@adobe.com>
 */
/**
 * Defines the [[Serialize]] decorator options.
 */
interface ClassOptions {
	/**
	 * Root path to use when mapping.
	 *
	 * ## Example
	 * ```JavaScript
	 *  @Serialize({
	 *      root: 'someObject'
	 *  })
	 *  class MyClass extends Serializable {
	 *      @SerializeProperty()
	 *      name:string;
	 *  }
	 * ```
	 * ### Deserialize
	 * ```JavaScript
	 *  let instance:MyClass = new MyClass();
	 *  instance.deserialize({
	 *      someObject: {
	 *          name: 'some value'
	 *      }
	 *  });
	 *
	 *  console.log(instance.name); // Will output 'some value'
	 * ```
	 * ### Serialize
	 * ```JavaScript
	 *  let instance:MyClass = new MyClass();
	 *  instance.name = 'value';
	 *
	 *  console.log(instance.serialize()); // Will output {someObject:{name:'value'}}
	 * ```
	 */
	root?: string;
}

/**
 * # Serialize decorators
 * >**Note:** Can only be used on a class.
 *
 * ## How it works
 * This annotation will add the implementation for [[Serializable.serialize]] and [[Serializable.deserialize]] methods on the class prototype.
 * The current implementation will use the [[Serializer.serialize]] and [[Serializer.deserialize]] methods.
 *
 * ## Example
 * ### Simple decorator
 * ```JavaScript
 *  @Serialize()
 *  class MyClass extends Serializable {}
 * ```
 * ### Decorator with options
 * ```JavaScript
 *  @Serialize({
 *      root: 'someRootObject'
 *  })
 *  class MyClass extends Serializable {}
 * ```
 * @param classOptions - A set of options to use when decorating the class.
 * @returns {ClassDecorator}
 */
export function Serialize(classOptions: ClassOptions): ClassDecorator {
	return function (target): void {
		target.prototype.deserialize = function (jsonObject: Object): void {
			Serializer.deserialize(target, this, jsonObject, classOptions);
		};
		target.prototype.serialize = function (): Object {
			return Serializer.serialize(target, this, classOptions);
		};
	}
}



/**
 * Helper class to represent serializable objects. The actual implementation of the [[Serializable.serialize]] and [[Serializable.deserialize]]
 * will be provided by the [[Serializer]]
 */
export abstract class Serializable {
	/**
	 * Serialize as JSON Object
	 */
	serialize(): any {
		throw new Error('This is an abstract method. It needs to be overridden.');
	}

	/**
	 * Deserialize from JSON Object
	 * @param jsonObject - The source object.
	 */
	deserialize(jsonObject:any): void {
		throw new Error('This is an abstract method. It needs to be overridden.');
	}

	/**
	 * Keeps track of all decorated properties.
	 * >**Note:** This property should only be used by the [[Serializer]] class
	 *
	 * @see [[SerializeProperty]]
	 */
	_serializeMap: { string: PropertyOptions };

	/**
	 * @hidden
	 */
	prototype: any;
}




/**
 * Defines [[SerializeProperty]] decorator options
 */
interface PropertyOptions extends ClassOptions {
	/**
	 * Used by the [[Serializer]] to locate properties in the `_serializeMap`. This property should only be set by the [[SerializeProperty]]
	 */
	name?: string;
	/**
	 * Used to map to a different property name in the json object.
	 *
	 * ## Example
	 * ```JavaScript
	 *  @Serialize()
	 *  class MyClass extends Serializable {
	 *      @SerializeProperty({
	 *          map: 'first_name'
	 *      })
	 *      firstName:string;
	 *  }
	 * ```
	 * ### Deserialize
	 * ```JavaScript
	 *  let instance:MyClass = new MyClass();
	 *  instance.deserialize({
	 *      first_name: 'some value'
	 *  });
	 *
	 *  console.log(instance.firstName); // Will output 'some value'
	 * ```
	 * ### Serialize
	 * ```JavaScript
	 *  let instance:MyClass = new MyClass();
	 *  instance.firstName = 'value'
	 *
	 *  console.log(instance.serialize()); // Will output {first_name:'value'}
	 * ```
	 */
	map?: string;
	/**
	 * Used to map a collection of elements.
	 *
	 * ## Example
	 * ```JavaScript
	 *  @Serialize()
	 *  class MyClass extends Serializable {
	 *      @SerializeProperty({
	 *          list: true
	 *      })
	 *      values:string[];
	 *  }
	 * ```
	 * ### Deserialize
	 * ```JavaScript
	 *  let instance:MyClass = new MyClass();
	 *  instance.deserialize({
	 *      values: ['a', 'b', 'c']
	 *  });
	 *
	 *  console.log(instance.values); // Will output ['a', 'b', 'c']
	 * ```
	 * ### Serialize
	 * ```JavaScript
	 *  let instance:MyClass = new MyClass();
	 *  instance.values = ['a', 'b', 'c'];
	 *
	 *  console.log(instance.serialize()); // Will output {values:['a','b','c']}
	 * ```
	 */
	list?: boolean;
	/**
	 * Specifies the type of the property.
	 *
	 * ## Example
	 * ```JavaScript
	 *  @Serialize()
	 *  class User extends Serializable {
	 *      @SerializeProperty()
	 *      firstName:string;
	 *      @SerializeProperty()
	 *      lastName:string;
	 *  }
	 *
	 *  @Serialize()
	 *  class Profile extends Serializable {
	 *      @SerializeProperty({
	 *          type: User
	 *      })
	 *      user:User;
	 *  }
	 * ```
	 * ### Deserialize
	 * ```JavaScript
	 *  let profile:Profile = new Profile();
	 *  profile.deserialize({
	 *      user: {
	 *          firstName: 'John',
	 *          lastName: 'Doe'
	 *      }
	 *  });
	 *
	 *  console.log(profile.user.firstName); // Will output 'John'
	 *  console.log(profile.user.lastName); // Will output 'Doe'
	 * ```
	 * ### Serialize
	 * ```JavaScript
	 *  let profile:Profile = new Profile();
	 *  profile.user = new User();
	 *  profile.user.firstName = 'John';
	 *  profile.user.lastName = 'Doe';
	 *
	 *  console.log(profile.serialize()); // Will output {user:{firstName:'John', lastName:'Doe'}}
	 * ```
	 */
	type?: any;
}


/**
 * # SerializeProperty decorator
 * >**Note:** Can only be used on class properties.
 *
 * ## How it works
 * This annotation creates a new `_serializeMap` property on the class prototype and adds all decorated properties to this map.
 * The [[Serializer]] will use this map to serialize and deserialize from/to json objects.
 *
 * ## Example
 * ### Simple decorator
 * ```JavaScript
 *  @Serialize()
 *  class MyClass extends Serializable {
 *      @SerializeProperty()
 *      simpleProperty:string;
 *  }
 * ```
 * ### Decorator with options
 * ```JavaScript
 *  @Serialize()
 *  class MyClass extends Serializable {
 *      @SerializeProperty({
 *          map: 'someMapping',
 *          root: 'someObject'
 *      })
 *      simpleProperty:string;
 *  }
 * ```
 * @param options - A set of options to use when decorating a property.
 * @returns {PropertyDecorator}
 */
export function SerializeProperty(options: PropertyOptions = {}): PropertyDecorator {
	return function (target: Object, name: string) {
		if (!target.constructor.prototype._serializeMap) {
			target.constructor.prototype._serializeMap = {};
		}
		options.name = name;
		target.constructor.prototype._serializeMap[name] = options;
	}
}

/**
 * Utility class to serialize and deserialize objects
 */
export class Serializer {
	/**
	 * Deserialize a property based on it's type.
	 * @see [[SerializeProperty]], [[PropertyOptions.type]]
	 * @param options - A set of options to use when deserializing this property.
	 * @param value - The object to deserialize.
	 * @returns {any} - The deserialized object.
	 */
	private static deserializeItem(options: PropertyOptions, value: Object) {
		if (options.type) {
			let item = new options.type();
			item.deserialize(value);
			return item;
		} else {
			return value;
		}
	}

	/**
	 * Serialize a property based on it's type.
	 * @see [[SerializeProperty]], [[PropertyOptions.type]]
	 * @param options - A set of options to use when serializing this property.
	 * @param value - The object to serialize.
	 * @returns {Object} - The serialized object.
	 */
	private static serializeItem(options: PropertyOptions, value: any): Object {
		if (options.type) {
			if ((value as Serializable).serialize) {
				return (value as Serializable).serialize();
			}
			return value;
		} else {
			return value;
		}
	}

	/**
	 * Serialize a class instance.
	 * @see [[Serialize]], [[ClassOptions]]
	 * @param target - Class type.
	 * @param context - Instance to serialize.
	 * @param classOptions - Class serialization options.
	 * @returns {Object} - The serialized object.
	 */
	public static serialize(target:any, context: any, classOptions: ClassOptions): Object {
		let result:any = {};

		for (let name in target.prototype._serializeMap) {
			let value = context[name];
			if (value === undefined||value === null) {
				continue;
			}
			let options = target.prototype._serializeMap[name];
			let rootPath = options.root || classOptions.root || null;
			let mapName = options.map || options.name;
			let dataTarget = result;

			if (rootPath && rootPath != '.') {
				if (!result[rootPath]) {
					result[rootPath] = {};
				}
				dataTarget = result[rootPath];
			}

			if (options.list) {
				dataTarget[mapName] = [];
				for (var i = 0; i < value.length; i++) {
					dataTarget[mapName].push(this.serializeItem(options, value[i]));
				}
			} else {
				dataTarget[mapName] = this.serializeItem(options, value);
			}
		}

		return result;
	}

	/**
	 * Deserialize a class instance.
	 * @see [[Serialize]], [[ClassOptions]]
	 * @param target - Class type.
	 * @param context - Instance to deserialize.
	 * @param jsonObject - Object to deserialize.
	 * @param classOptions - Class deserialization options.
	 */
	public static deserialize(target:any, context: any, jsonObject: any, classOptions: ClassOptions = {}) {
		for (let name in target.prototype._serializeMap) {
			let options: PropertyOptions = target.prototype._serializeMap[name];
			let rootPath: string = options.root || classOptions.root || null;
			let mapName: string = options.map || options.name;
			let value: any = jsonObject[mapName];

			if (rootPath && rootPath != '.') {
				value = jsonObject[rootPath][mapName];
			}

			if (options.list) {
				context[name] = [];
				for (let i = 0; i < value.length; i++) {
					context[name].push(this.deserializeItem(options, value[i]));
				}
			} else {
				context[name] = this.deserializeItem(options, value);
			}
		}
	}
}