const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getClients, addClient } = require('../controllers/clientController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', auth, getClients);
router.post('/', auth, upload.array('documents', 5), addClient);

module.exports = router;
