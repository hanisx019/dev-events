import { HydratedDocument, Model, Schema, model, models } from "mongoose";

// Define the TypeScript interface for the Event document.
export interface EventDocument {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Model will help us for creating method like create, find, etc. on the Event collection.
type EventModel = Model<EventDocument>;

// check for non-empty strings and arrays at the application level since Mongoose's "required" only checks for presence, not emptiness (if(!title)...)
const REQUIRED_STRING_FIELDS: ReadonlyArray<keyof Pick<
EventDocument,
  | "title"
  | "description"
  | "overview"
  | "image"
  | "venue"
  | "location"
  | "date"
  | "time"
  | "mode"
  | "audience"
  | "organizer"
>> = [
  "title",
  "description",
  "overview",
  "image",
  "venue",
  "location",
  "date",
  "time",
  "mode",
  "audience",
  "organizer",
];


const slugifyTitle = (title: string): string => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!slug) {
    throw new Error("Unable to generate slug from title.");
  }

  return slug;
};

// Normalize date inputs to a consistent ISO-8601 format for storage.
const normalizeDateToIso = (rawDate: string): string => {
  const parsedDate = new Date(rawDate.trim());

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format.");
  }

  // Store dates in canonical ISO-8601 format.
  return parsedDate.toISOString();
};

// Normalize time inputs to a consistent 24-hour HH:mm format for storage.
const normalizeTime = (rawTime: string): string => {
  const value = rawTime.trim();

  const match24Hour = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24Hour) {
    const hours = Number(match24Hour[1]);
    const minutes = Number(match24Hour[2]);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  const match12Hour = value.match(/^(\d{1,2}):([0-5]\d)\s*([aApP][mM])$/);
  if (match12Hour) {
    const rawHours = Number(match12Hour[1]);
    const minutes = Number(match12Hour[2]);
    const period = match12Hour[3].toLowerCase();

    if (rawHours < 1 || rawHours > 12) {
      throw new Error("Invalid time format.");
    }

    const hours24 = period === "pm" ? (rawHours % 12) + 12 : rawHours % 12;

    // Store times as 24-hour HH:mm for consistency.
    return `${hours24.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  throw new Error("Invalid time format.");
};



// The Event Schema
//EventDocument is the Shape of the document, EventModel is the type of the model (with static methods like create, find, etc.).
const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true,
      validate: {
        validator: (items: string[]): boolean => items.length > 0,
        message: "Agenda must contain at least one item.",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true,
      validate: {
        validator: (items: string[]): boolean => items.length > 0,
        message: "Tags must contain at least one item.",
      },
    },
  },
  {
    timestamps: true,
  }
);


// Create a unique index on the slug field to enforce uniqueness at the database level.
EventSchema.index({ slug: 1 }, { unique: true });

// Ensure slug exists before validation, since required validation runs in pre('validate').
EventSchema.pre("validate", function (this: HydratedDocument<EventDocument>) {
  if (
    (this.isNew || this.isModified("title") || !this.slug) &&
    typeof this.title === "string" &&
    this.title.trim() !== ""
  ) {
    this.slug = slugifyTitle(this.title);
  }
});

/// Pre-save hook to enforce additional validation and normalization logic.
EventSchema.pre("save", function (this: HydratedDocument<EventDocument>) {

  //code to validate and normalize required string fields, ensuring they are non-empty and trimmed.
  for (const field of REQUIRED_STRING_FIELDS) { // Loop through each required string field to validate and normalize it.
    const value = this.get(field) as string; // Get the current value of the field from the document.
    if (typeof value !== "string" || value.trim().length === 0) { // Check if the value is not a string or is an empty string after trimming whitespace.
      throw new Error(`${field} is required and cannot be empty.`);
    }
    this.set(field, value.trim());// Normalize the value by trimming whitespace and set it back to the document.
  }
  /////////

  /// code to validate and normalize agenda and tags arrays, ensuring they are non-empty and contain only non-empty strings.
  const agenda = this.get("agenda") as string[];// Get the agenda array from the document.
  const tags = this.get("tags") as string[];// Get the tags array from the document.

  if (!Array.isArray(agenda) || agenda.length === 0) {// Check if the agenda is not an array or is an empty array, and throw an error if so.
    throw new Error("agenda is required and cannot be empty.");
  }
  if (!Array.isArray(tags) || tags.length === 0) { // Check if the tags is not an array or is an empty array, and throw an error if so.
    throw new Error("tags are required and cannot be empty.");
  }
  if (!agenda.every((item) => typeof item === "string" && item.trim().length > 0)) {// Check if every item in the agenda array is a non-empty string, and throw an error if any item is invalid.
    throw new Error("agenda items must be non-empty strings.");
  }
  if (!tags.every((item) => typeof item === "string" && item.trim().length > 0)) {// Check if every item in the tags array is a non-empty string, and throw an error if any item is invalid.
    throw new Error("tags must be non-empty strings.");
  }
  // Normalize agenda and tags by trimming whitespace from each item and setting the normalized arrays back to the document.
  this.set( 
    "agenda",
    agenda.map((item) => item.trim())
  );
  // Normalize tags by trimming whitespace from each item and setting the normalized array back to the document.
  this.set(
    "tags",
    tags.map((item) => item.trim())
  );
  /////////

  // Normalize date/time into a stable storage format.
  if (this.isNew || this.isModified("date")) {
    this.date = normalizeDateToIso(this.date);
  }
  // Normalize time inputs to a consistent 24-hour HH:mm format for storage.
  if (this.isNew || this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

// Export the Event model, using an existing model if it has already been compiled to prevent recompilation issues in development environments with hot-reloading.
export const Event = (models.Event as EventModel | undefined) ?? model<EventDocument, EventModel>("Event", EventSchema);