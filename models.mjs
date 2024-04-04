import dynamo from 'dynamodb';
import Joi from 'joi';

dynamo.AWS.config.update({ region: 'us-east-1' });

const Patients = dynamo.define('Patients', {
  hashKey: 'id',

  // add the timestamp attributes (updatedAt, createdAt)
  timestamps: true,

  schema: {
    id: dynamo.types.uuid(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    dateOfBirth: Joi.date(),
    address: Joi.string(),
    city: Joi.string(),
    country: Joi.string()
  }
});

const Records = dynamo.define('Records', {
  hashKey: 'id',
  timestamps: true,

  schema: {
    id: dynamo.types.uuid(),
    patientId: Joi.string(),
    date: Joi.date(),
    diagnosis: Joi.string(),
    treatment: Joi.string()
  }
});

export { Patients, Records };
