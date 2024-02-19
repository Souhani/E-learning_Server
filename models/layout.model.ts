import { Document, Model, Schema, model } from "mongoose";

interface FaqItem extends Document {
    question: string;
    answer: string;
};

interface Categoty extends Document {
    title: string;
};

interface BannerImage extends Document {
    public_id: string;
    url: string;
};

interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: Categoty[];
    banner: {
        image: BannerImage;
        title: string;
        subTitle: string;
    };
};

const faqSchema = new Schema<FaqItem>({
    question: String,
    answer: String
});

const categorySchema = new Schema<Categoty>({
    title: String
});

const bannerImageSchema = new Schema<BannerImage>({
  public_id: String,
  url: String
});

const layoutSchema = new Schema<Layout>({
    type: {
        type: String,
        required: true
    },
    faq: {
        type: [faqSchema]
    },
    categories: {
        type: [categorySchema]
    },
    banner: {
        type: {
            image: bannerImageSchema,
            title: String,
            subTitle: String
        }
    }
});

const layoutModel: Model<Layout> = model("Layout", layoutSchema);

export default layoutModel;