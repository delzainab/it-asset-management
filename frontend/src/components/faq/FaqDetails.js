import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import faqService from '../../services/faq.service';

const FaqDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await faqService.getArticleById(id);
      setArticle(data);
    } catch (err) {
      setError('Article non trouvé');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/faq')} sx={{ mb: 2 }}>
        Retour à la FAQ
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip label={article.category || 'Général'} color="primary" />
          <Typography variant="caption" color="text.secondary">
            Mis à jour le {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {article.title}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {article.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default FaqDetails;