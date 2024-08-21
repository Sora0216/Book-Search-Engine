const { AuthenticationError } = require("apollo-server-express");
const { User, Thought } = require("../models");
const { singToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user.id }).populate("thoughts");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    users: async () => {
      return User.find().populate("thoughts");
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate("thoughts");
    },
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },
    thoughts: async (parent, { thoughtId }) => {
      return Thought.findOne({ _id: thoughtId });
    },
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const user = await User.create9({ username, email, password });
      const token = singToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await user.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password");
      }

      const token = singToken(user);
      return { token, user };
    },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { saveBooks: book } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    deleteBook: async (parent, { bookId }, contexy) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
