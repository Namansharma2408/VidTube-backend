import mongoose,{ Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is subscriding
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId, // one to whom
        ref:"User"
    }
    

},{timestamps:true})

export const Subscriptions = mongoose.model("Subscriptions",subscriptionSchema)