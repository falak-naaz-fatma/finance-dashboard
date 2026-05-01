import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password?: string; // Make password optional for OAuth users
    name?: string;
    provider?: string; // e.g., 'google'
    providerId?: string; // Google's user ID
    image?: string; // User profile image URL from Google
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: false, // Make password optional
    },
    name: {
        type: String,
        trim: true,
    },
    provider: {
        type: String,
        required: false,
    },
    providerId: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
