/**
 * Model Index
 * 
 * Central export point for all Mongoose models.
 * Simplifies imports across the application.
 * 
 * @module models
 */

module.exports = {
  User: require("./User"),
  Post: require("./Post"),
  Event: require("./Event"),
  DiscussionThread: require("./DiscussionThread"),
  Comment: require("./Comment"),
};
