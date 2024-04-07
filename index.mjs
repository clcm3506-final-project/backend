import { Patients, Records } from './models.mjs';
import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 80;
const app = express();
const islocal = process.env.LOCAL || false;

app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/patients', (req, res) => {
  try {
    Patients.scan()
      .loadAll()
      .exec(function (err, patients) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json(patients);
      });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/patients/:id', (req, res) => {
  try {
    Patients.query(req.params.id).exec(function (err, patient) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(patient);
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/patients', async (req, res) => {
  try {
    const newPatient = new Patients(req.body);
    console.log(newPatient);
    await newPatient.save();
    return res.status(201).json({ id: newPatient.id });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.put('/patients/:id', (req, res) => {
  try {
    Patients.update({ id: req.params.id, ...req.body }, function (err, data) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.sendStatus(200);
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/patients/:id', (req, res) => {
  try {
    Patients.destroy({ id: req.params.id }, function (err, data) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.sendStatus(204);
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/records', (req, res) => {
  Records.scan()
    .loadAll()
    .exec(function (err, records) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(records);
    });
});

app.get('/records/:id', (req, res) => {
  Records.query(req.params.id).exec(function (err, data) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(data);
  });
});

app.post('/records', async (req, res) => {
  const newRecord = new Records(req.body);
  // check if patient exists
  const patient = await Patients.get(newRecord.patientId);
  if (!patient) {
    return res.status(400).json({ error: 'Patient not found' });
  }
  await newRecord.save();
  return res.status(201).json({ id: newRecord.id });
});

app.put('/records/:id', (req, res) => {
  Records.update({ id: req.params.id, ...req.body }, function (err, data) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200);
  });
});

app.delete('/records/:id', (req, res) => {
  Records.destroy({ id: req.params.id }, function (err, data) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(204);
  });
});

app.listen(port, () => {
  console.log(`Patients Management System is listening on port ${port}`);
});
