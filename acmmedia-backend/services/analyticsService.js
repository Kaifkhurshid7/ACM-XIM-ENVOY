const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const getAnalytics = async () => {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();
        const commentCount = await Comment.countDocuments();

        // Calculate total likes efficiently
        const result = await Post.aggregate([
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } }
                }
            }
        ]);

        const totalLikes = result.length > 0 ? result[0].totalLikes : 0;

        return {
            users: userCount,
            posts: postCount,
            comments: commentCount,
            likes: totalLikes
        };
    } catch (err) {
        console.error("Error fetching analytics:", err);
        return null;
    }
};

module.exports = { getAnalytics };
