// this file defines what a 'User' looks like in our database

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // used to hash the passwords

// defining the structure (schema) for a User
const userSchema = mongoose.Schema(
  {
    // user's name
    name: {
      type: String,
      required: true
    },

    // user email (must be unique so no duplicates)
    email: {
      type: String,
      required: true,
      unique: true
    },

    // hashed password (never save plain password)
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // this adds createdAt and updatedAt for each user
  }
);

// this runs automatically before saving a user to the DB
userSchema.pre("save", async function (next) {
  // if password is not changed, skip hashing
  if (!this.isModified("password")) {
    next();
  }

  // else hash the password before saving
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// this is a helper function to check password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// creating the model and exporting it
const User = mongoose.model("User", userSchema);
module.exports = User;
