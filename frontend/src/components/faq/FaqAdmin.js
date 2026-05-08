import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon
} from '@mui/icons-material';
import useRole from '../../hooks/useRole';
import faqService from '../../services/faq.service';

const FaqAdmin = () => {
  const { isAdmin } = useRole();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    if (isAdmin) {
      loadArticles();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await faqService.getAllArticles();
      setArticles(data);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category || ''
      });
    } else {
      setEditingArticle(null);
      setFormData({ title: '', content: '', category: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingArticle(null);
    setFormData({ title: '', content: '', category: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingArticle) {
        await faqService.updateArticle(editingArticle.id, formData);
        setSuccess('Article modifié avec succès');
      } else {
        await faqService.createArticle(formData);
        setSuccess('Article créé avec succès');
      }
      handleCloseDialog();
      loadArticles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Supprimer l'article "${title}" ?`)) {
      try {
        await faqService.deleteArticle(id);
        setSuccess('Article supprimé');
        loadArticles();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (!isAdmin) return <Navigate to="/dashboard" />;
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion de la FAQ</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#e67e22' }}>
          Nouvel article
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">Aucun article</TableCell></TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} hover>
                  <TableCell>{article.title}</TableCell>
                  <TableCell><Chip label={article.category || 'Général'} size="small" /></TableCell>
                  <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(article)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(article.id, article.title)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
          <IconButton onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Titre" name="title" value={formData.title} onChange={handleChange} required sx={{ mt: 2, mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select name="category" value={formData.category} label="Catégorie" onChange={handleChange}>
              <MenuItem value="">Général</MenuItem>
              <MenuItem value="Réseau">Réseau</MenuItem>
              <MenuItem value="Matériel">Matériel</MenuItem>
              <MenuItem value="Logiciel">Logiciel</MenuItem>
              <MenuItem value="Comptes">Comptes</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Contenu" name="content" multiline rows={10} value={formData.content} onChange={handleChange} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title || !formData.content}>
            {editingArticle ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FaqAdmin;