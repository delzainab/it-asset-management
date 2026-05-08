import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const AssetFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    condition: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      status: '',
      condition: '',
      search: ''
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const statusOptions = [
    { value: 'EN_STOCK', label: 'En stock' },
    { value: 'AFFECTE', label: 'Affecté' },
    { value: 'EN_REPARATION', label: 'En réparation' },
    { value: 'SORTI', label: 'Sorti' }
  ];

  const conditionOptions = [
    { value: 'NEUF', label: 'Neuf' },
    { value: 'BON', label: 'Bon' },
    { value: 'MOYEN', label: 'Moyen' },
    { value: 'HS', label: 'Hors service' },
    { value: 'REFORME', label: 'Réformé' }
  ];

  const typeOptions = [
    'PC', 'Laptop', 'Écran', 'Imprimante', 'Routeur', 'Serveur', 'Switch'
  ];

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher (série, code, utilisateur...)"
            name="search"
            value={filters.search}
            onChange={handleChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Rechercher
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
            >
              Filtres
            </Button>
            <Button variant="text" onClick={handleReset}>
              Réinitialiser
            </Button>
          </Box>
        </Grid>
      </Grid>

      {showFilters && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                label="Type"
                onChange={handleChange}
              >
                <MenuItem value="">Tous</MenuItem>
                {typeOptions.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={filters.status}
                label="Statut"
                onChange={handleChange}
              >
                <MenuItem value="">Tous</MenuItem>
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>État</InputLabel>
              <Select
                name="condition"
                value={filters.condition}
                label="État"
                onChange={handleChange}
              >
                <MenuItem value="">Tous</MenuItem>
                {conditionOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default AssetFilters;