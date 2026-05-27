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
  DiscussionReply: require("./DiscussionReply"),
  Notification: require("./Notification"),
  Comment: require("./Comment"),
};
