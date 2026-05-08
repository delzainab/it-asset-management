import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticket.service';
import assetService from '../../services/asset.service';
import useRole from '../../hooks/useRole';

const TicketList = () => {
  const navigate = useNavigate();
  const { isAdmin, isTechnician } = useRole();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetId: '',
    priority: 'MOYENNE'
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });

  const canCreateTicket = isAdmin || isTechnician;
  const canEditTicket = isAdmin || isTechnician;
  const canDeleteTicket = isAdmin;

  useEffect(() => {
    loadTickets();
    if (canCreateTicket) loadAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tickets]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
      setFilteredTickets(data);
    } catch (err) {
      setError('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (err) {
      console.error('Erreur chargement assets:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];
    
    if (filters.search) {
      filtered = filtered.filter(ticket => 
        ticket.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.id?.toString().includes(filters.search)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }
    
    setFilteredTickets(filtered);
  };

  const handleCreateTicket = async () => {
    try {
      await ticketService.createTicket(formData);
      setSuccess('Ticket créé avec succès');
      setOpenDialog(false);
      setFormData({ title: '', description: '', assetId: '', priority: 'MOYENNE' });
      loadTickets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleUpdateTicket = async () => {
    try {
      await ticketService.updateTicket(editingTicket.id, formData);
      setSuccess('Ticket modifié avec succès');
      setOpenDialog(false);
      setEditingTicket(null);
      setFormData({ title: '', description: '', assetId: '', priority: 'MOYENNE' });
      loadTickets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification');
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    try {
      await ticketService.deleteTicket(ticketToDelete.id);
      setSuccess('Ticket supprimé avec succès');
      setOpenDeleteDialog(false);
      setTicketToDelete(null);
      loadTickets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleOpenEditDialog = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description || '',
      assetId: ticket.asset?.id || '',
      priority: ticket.priority || 'MOYENNE'
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (ticket) => {
    setTicketToDelete(ticket);
    setOpenDeleteDialog(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ search: '', status: '', priority: '' });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITIQUE': return 'error';
      case 'ELEVEE': return 'error';
      case 'MOYENNE': return 'warning';
      case 'BASSE': return 'success';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'CRITIQUE': return 'Critique';
      case 'ELEVEE': return 'Élevée';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return priority;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OUVERT': return 'error';
      case 'EN_COURS': return 'warning';
      case 'RESOLU': return 'success';
      case 'FERME': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'OUVERT': return 'Ouvert';
      case 'EN_COURS': return 'En cours';
      case 'RESOLU': return 'Résolu';
      case 'FERME': return 'Fermé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Tickets</Typography>
        
        {canCreateTicket && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTicket(null);
              setFormData({ title: '', description: '', assetId: '', priority: 'MOYENNE' });
              setOpenDialog(true);
            }}
            sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
          >
            Nouveau ticket
          </Button>
        )}
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher (titre, ID...)"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select name="status" value={filters.status} label="Statut" onChange={handleFilterChange}>
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="OUVERT">Ouvert</MenuItem>
                <MenuItem value="EN_COURS">En cours</MenuItem>
                <MenuItem value="RESOLU">Résolu</MenuItem>
                <MenuItem value="FERME">Fermé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priorité</InputLabel>
              <Select name="priority" value={filters.priority} label="Priorité" onChange={handleFilterChange}>
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="CRITIQUE">Critique</MenuItem>
                <MenuItem value="ELEVEE">Élevée</MenuItem>
                <MenuItem value="MOYENNE">Moyenne</MenuItem>
                <MenuItem value="BASSE">Basse</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" onClick={resetFilters} fullWidth>
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Priorité</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Matériel</TableCell>
              <TableCell>Créé par</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun ticket trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket, index) => (
                <TableRow key={ticket.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <Chip 
                      size="small"
                      label={getPriorityLabel(ticket.priority)} 
                      color={getPriorityColor(ticket.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small"
                      label={getStatusLabel(ticket.status)} 
                      color={getStatusColor(ticket.status)}
                    />
                  </TableCell>
                  <TableCell>{ticket.asset?.type || '-'}</TableCell>
                  <TableCell>{ticket.createdBy?.fullName || '-'}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => navigate(`/tickets/${ticket.id}`)} title="Voir">
                      <ViewIcon />
                    </IconButton>
                    {canEditTicket && (
                      <IconButton size="small" onClick={() => handleOpenEditDialog(ticket)} title="Modifier">
                        <EditIcon />
                      </IconButton>
                    )}
                    {canDeleteTicket && (
                      <IconButton size="small" onClick={() => handleOpenDeleteDialog(ticket)} title="Supprimer">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de création/modification */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTicket ? 'Modifier le ticket' : 'Nouveau ticket'}
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Matériel concerné</InputLabel>
                <Select
                  value={formData.assetId}
                  label="Matériel concerné"
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                >
                  <MenuItem value="">-- Sélectionner --</MenuItem>
                  {assets.map(asset => (
                    <MenuItem key={asset.id} value={asset.id}>
                      {asset.type} - {asset.brand} {asset.model} ({asset.serialNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priorité"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="CRITIQUE">Critique</MenuItem>
                  <MenuItem value="ELEVEE">Élevée</MenuItem>
                  <MenuItem value="MOYENNE">Moyenne</MenuItem>
                  <MenuItem value="BASSE">Basse</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={editingTicket ? handleUpdateTicket : handleCreateTicket} 
            variant="contained"
            disabled={!formData.title}
            sx={{ bgcolor: '#e67e22', '&:hover': { bgcolor: '#d35400' } }}
          >
            {editingTicket ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le ticket <strong>"{ticketToDelete?.title}"</strong> ?
            <br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteTicket} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketList;