import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
      },
      userName: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 8,
      },
      bio: {
        type: String,
        default: "",
      },
      profilePic: {
        type: String,
        default: "",
      },
     location: {
        lat: Number,
        lng: Number,
      },
      isOnboarded: {
        type: Boolean,
        default: false,
      },
      resetPasswordToken: String,
      resetPasswordExpires: Date,
     
    },
    { timestamps: true }
  );
  
  //bcrypt uses for password encryption
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  // password is checked in terms of hashpassword
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  //bcrypt uses for password decryption
  userSchema.methods.matchPassword = async function (enteredPassword) {
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;
  };
  

  const User = mongoose.model("User", userSchema);

export default User;