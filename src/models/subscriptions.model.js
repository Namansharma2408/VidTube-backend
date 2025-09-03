import mongoose,{ model, Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who is subscriding
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId, // one to whom
        ref:"User"
    }
    

})

export const Subscriptions = mongoose.model("Subscriptions",subscriptionSchema)