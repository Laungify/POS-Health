const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductDataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genericName: { type: String, required: true },
    properties: {
      ATC_code: { type: String },
      Indications_and_dose: {
        Adult: { type: String },
        Paediatric: { type: String }
      },
      Contraindications: { type: String },
      Precautions: { type: String },
      Hepatic_impairment: { type: String },
      Pregnancy: { type: String },
      Breastfeeding: { type: String },
      Adverse_effects: { type: String },
      Interactions_with_other_medicines: { type: String }
    }
  },
  { collection: 'productData' } 
);

const ProductData = mongoose.model('ProductData', ProductDataSchema);

module.exports = ProductData;
