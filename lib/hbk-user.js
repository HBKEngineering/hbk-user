var _ = require('underscore');

module.exports = function(data){
	this.coreUser = data;
};

module.exports.prototype = {
	/**
	 * Gets a value indicating whether or not this user is considered to be an administrative user.
	 * @param {Function} [cb] Pass a callback to load fresh permission data to determine the status. Second argument will be equivalent to the return value of this function.
	 * @return {Boolean} True if administrative, otherwise false.
	 */
	isAdmin: function(cb){
		var roles = ['super', 'admin'];

		if(cb){
			return this.isInAnyRole(roles, cb);
		} else {
			return this.hasAnyGroup(roles);
		}
	},

	/**
	 * Gets a value indicating whether or not this user is considered to be a "super user".
	 * @param {Function} [cb] Pass a callback to load fresh permission data to determine the status. Second argument will be equivalent to the return value of this function.
	 * @return {Boolean} True if super, otherwise false.
	 */
	isSuper: function(cb){
		var roles = 'super';

		if(cb){
			return this.isInRole(roles, cb);
		} else {
			return this.hasGroup(roles);
		}
	},

	/**
	 * Determines whether a user is in a specified role (group). 
	 * @param  {string|Array}   role The role or roles in question.
	 * @param  {Function} cb   Function expecting two arguments. The first is an error, if any, and the second is true if the user is in all specified roles or false otherwise.
	 */
	isInRole: function(role, cb){
		function execute(user){ //perform the core operation in this function
			var groups = user.groups;
			var result = true;

			if(!_.isArray(role)){
				role = [role];
			}

			if(role.length === 0){
				_.each(role, function(roleName){
					result = result && (_.contains(groups, roleName) || _.contains(groups, 'super'));
				});
			} else {
				result = _.contains(groups, 'super');
			}

			return result;
		}

		//make sure we have an acceptable user object here
		cb(null, execute(this.coreUser));
	},

	/**
	 * Determines whether a user is in a specified role (group).
	 * @param  {string|Array}   role The role or roles in question.
	 * @param  {Function} cb   Function expecting two arguments. The first is an error, if any, and the second is true if the user is in any specified role or false otherwise.
	 * @return {Boolean}       [description]
	 */
	isInAnyRole: function(role, cb){
		function execute(user){ //perform the core operation in this function
			var groups = user.groups;
			var result = false;

			if(!_.isArray(role)){
				role = [role];
			}

			_.each(role, function(roleName){
				result = result || (_.contains(groups, roleName) || _.contains(groups, 'super'));
			});

			return result;
		}

		//make sure we have an acceptable user object here
		cb(null, execute(this.coreUser));
	},

	/**
	 * Gets the list of groups the user is in.
	 * @param {Function} cb   Function expecting two arguments. The first is an error, if any, and the second is the array of names of the groups the user is in.
	 */
	getRoles: function(cb){
		cb(null, this.coreUser.allRoles);
	},

	/**
     * Determines whether a user is in a specified group. This is effectively a synchronous version of `isInRole`.
     * @param  {string|Array}  groupName The group name or names in question.
     * @return {Boolean}           True if the user is in all provided groups, otherwise false.
     */
	hasGroup: function(groupName){
		if(!_.isArray(groupName)){
			groupName = [groupName];
		}

		var groups = this.coreUser.groups;

		return _.every(groupName, function(name){
			return _.contains(groups, name);
		});
	},

	/**
     * Determines whether a user is in a specified group. This is effectively a synchronous version of `isInAnyRole`.
     * @param  {string|Array}  groupName The group name or names in question.
     * @return {Boolean}           True if the user is in any provided groups, otherwise false.
     */
	hasAnyGroup: function(groupName){
		if(!_.isArray(groupName)){
			groupName = [groupName];
		}

		var groups = this.coreUser.groups;

		return _.some(groupName, function(name){
			return _.contains(groups, name);
		});
	},
};