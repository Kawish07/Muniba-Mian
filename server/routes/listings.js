const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const { upload } = require('../middlewares/upload');

// Map multer's `req.files` (array from `upload.any()`) into an object
// where keys are fieldnames and values are arrays - matching what
// `upload.fields()` normally produces. This keeps controller code unchanged.
function mapFilesMiddleware(req, res, next) {
	if (!req.files || !Array.isArray(req.files)) return next();
	const filesByField = {};
	req.files.forEach((f) => {
		if (!filesByField[f.fieldname]) filesByField[f.fieldname] = [];
		filesByField[f.fieldname].push(f);
	});
	req.files = filesByField;
	next();
}

router.get('/', listingsController.list);
router.get('/:id', listingsController.get);
router.post('/', upload.any(), mapFilesMiddleware, listingsController.create);
router.put('/:id', upload.any(), mapFilesMiddleware, listingsController.update);
router.delete('/:id', listingsController.remove);

module.exports = router;
