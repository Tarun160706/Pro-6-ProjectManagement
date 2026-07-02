const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema(
  {
    versionName: {
      type: String,
      default: "",
      trim: true,
    },
    questionnaireId: {
      type: String,
      default: "",
      trim: true,
    },
    copiedFrom: {
      type: String,
      default: "",
    },
  },
  { _id: true, timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    columns: {
      type: Object,
      default: {},
    },
    versions: {
      type: [VersionSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    questionnaireId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);