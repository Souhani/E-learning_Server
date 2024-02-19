import { Model, Schema, model, Document } from "mongoose"

export interface IOrder extends Document {
    userId: string;
    userEmail:string;
    courseId: string;
    courseName: string;
    price: string;
    payment_info: object;
};

const orderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    payment_info: {
        type: Object,
        // required: true
    }
}, {timestamps: true});

const orderModel: Model<IOrder> = model('Order',orderSchema);

export default orderModel;