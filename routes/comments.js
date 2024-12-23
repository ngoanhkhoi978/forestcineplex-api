const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.get('/episode/:episodeId', commentController.getCommentsByEpisodeId);
router.patch('/like/:commentId', commentController.likeComment);
router.patch('/unlike/:commentId', commentController.unlikeComment);
router.patch('/report/:commentId', commentController.reportComment);
router.patch('/unreport/:commentId', commentController.unReportComment);
router.delete('/:commentId', commentController.deleteComment);
router.post('/', commentController.addComment);
router.get('/', commentController.getAllComments);

module.exports = router;
