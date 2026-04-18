import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema(
  {
    /** OSM node/way id (positive); manual entries use negative synthetic ids */
    osm_id: { type: Number, required: true, unique: true, index: true },
    source: {
      type: String,
      enum: ["osm", "manual"],
      default: "osm",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name:   { type: String, required: true },
    nameEn: { type: String, default: "" },
    category: {
      type: String,
      enum: ["hospital", "clinic", "doctors", "dentist", "pharmacy", "default"],
      default: "default",
      index: true,
    },
    address: { type: String, default: "" },
    lat:     { type: Number, required: true },
    lon:     { type: Number, required: true },
    phone:   { type: String, default: null },
    phone2:  { type: String, default: null },
    email:   { type: String, default: null },
    website: { type: String, default: null },
    facebook:{ type: String, default: null },
    openingHours: { type: String, default: null },
    specialty:    { type: String, default: null },
    operator:     { type: String, default: null },
    beds:         { type: String, default: null },
    emergency:    { type: String, default: null },
    wheelchair:   { type: String, default: null },
    bbox:     { type: String, default: "" },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PlaceSchema.index({
  name: "text",
  nameEn: "text",
  address: "text",
  specialty: "text",
  operator: "text",
});

export default mongoose.models.Place || mongoose.model("Place", PlaceSchema);
