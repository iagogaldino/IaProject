import mongoose, { Document } from 'mongoose';
export interface IMessage extends Document {
    fromAgentId: string;
    toAgentId: string;
    content: string;
    createdAt: Date;
}
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Message.d.ts.map