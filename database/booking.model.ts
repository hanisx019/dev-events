import { HydratedDocument, Model, Schema, Types, model, models } from "mongoose";
import { Event } from "./event.model";

export interface BookingDocument {
  eventId: Types.ObjectId;// Reference to the Event document
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type BookingModel = Model<BookingDocument>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: "Invalid email format.",
      },
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ eventId: 1 });

BookingSchema.pre("save", async function (this: HydratedDocument<BookingDocument>) {
  // Normalize and validate email to keep booking records consistent.
  this.email = this.email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(this.email)) {
    throw new Error("Invalid email format.");
  }

  // Ensure the referenced event exists before creating/updating a booking.
  if (this.isNew || this.isModified("eventId")) {
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      throw new Error("Referenced event does not exist.");
    }
  }
});

export const Booking = (models.Booking as BookingModel | undefined) ?? model<BookingDocument, BookingModel>("Booking", BookingSchema);
