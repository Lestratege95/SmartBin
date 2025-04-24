import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const binTypes = [
  { value: 'general', label: 'Général' },
  { value: 'recyclable', label: 'Recyclable' },
  { value: 'organic', label: 'Organique' },
  { value: 'hazardous', label: 'Dangereux' },
];

const binStatuses = [
  { value: 'empty', label: 'Vide' },
  { value: 'half', label: 'À moitié plein' },
  { value: 'full', label: 'Plein' },
  { value: 'overflow', label: 'Débordement' },
];

function Bins() {
  const [bins, setBins] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'general',
    capacity: '',
    current_level: 0,
    status: 'empty',
  });

  const columns = [
    { field: 'name', headerName: 'Nom', width: 150 },
    { field: 'location', headerName: 'Emplacement', width: 200 },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      valueGetter: (params) => {
        const types = {
          general: 'Général',
          recyclable: 'Recyclable',
          organic: 'Organique',
          hazardous: 'Dangereux',
        };
        return types[params.row.type] || params.row.type;
      },
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 150,
      valueGetter: (params) => {
        const statuses = {
          empty: 'Vide',
          half: 'À moitié plein',
          full: 'Plein',
          overflow: 'Débordement',
        };
        return statuses[params.row.status] || params.row.status;
      },
    },
    {
      field: 'fill_percentage',
      headerName: 'Remplissage',
      width: 130,
      valueGetter: (params) => `${params.row.fill_percentage.toFixed(1)}%`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Modifier">
            <IconButton onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      const response = await axios.get(`${API_URL}/bins/`);
      setBins(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des poubelles:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedBin(null);
    setFormData({
      name: '',
      location: '',
      type: 'general',
      capacity: '',
      current_level: 0,
      status: 'empty',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBin(null);
  };

  const handleEdit = (bin) => {
    setSelectedBin(bin);
    setFormData({
      name: bin.name,
      location: bin.location,
      type: bin.type,
      capacity: bin.capacity,
      current_level: bin.current_level,
      status: bin.status,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette poubelle ?')) {
      try {
        await axios.delete(`${API_URL}/bins/${id}/`);
        fetchBins();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBin) {
        await axios.put(`${API_URL}/bins/${selectedBin.id}/`, formData);
      } else {
        await axios.post(`${API_URL}/bins/`, formData);
      }
      handleCloseDialog();
      fetchBins();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des poubelles</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchBins}
            sx={{ mr: 2 }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Ajouter une poubelle
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={bins}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBin ? 'Modifier la poubelle' : 'Ajouter une nouvelle poubelle'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emplacement"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  {binTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  {binStatuses.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacité (L)"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Niveau actuel (L)"
                  name="current_level"
                  type="number"
                  value={formData.current_level}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedBin ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Bins; 