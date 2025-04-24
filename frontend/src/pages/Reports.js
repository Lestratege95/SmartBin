import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Reports() {
  const [bins, setBins] = useState([]);
  const [collections, setCollections] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [binsResponse, collectionsResponse] = await Promise.all([
        axios.get(`${API_URL}/bins/`),
        axios.get(`${API_URL}/collections/`),
      ]);

      setBins(binsResponse.data);
      setCollections(collectionsResponse.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const getCollectionsByType = () => {
    const typeCounts = bins.reduce((acc, bin) => {
      acc[bin.type] = (acc[bin.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  };

  const getCollectionsByStatus = () => {
    const statusCounts = bins.reduce((acc, bin) => {
      acc[bin.status] = (acc[bin.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const getCollectionsOverTime = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const filteredCollections = collections.filter(
      (collection) => new Date(collection.date) >= startDate
    );

    const dailyCounts = filteredCollections.reduce((acc, collection) => {
      const date = new Date(collection.date).toLocaleDateString('fr-FR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Rapports et statistiques</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={timeRange}
            label="Période"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">7 derniers jours</MenuItem>
            <MenuItem value="month">30 derniers jours</MenuItem>
            <MenuItem value="year">12 derniers mois</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Collectes par type de poubelle
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={getCollectionsByType()}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getCollectionsByType().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              État des poubelles
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={getCollectionsByStatus()}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getCollectionsByStatus().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Historique des collectes
            </Typography>
            <BarChart
              width={800}
              height={300}
              data={getCollectionsOverTime()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Nombre de collectes" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total des poubelles
              </Typography>
              <Typography variant="h4">{bins.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Collectes totales
              </Typography>
              <Typography variant="h4">{collections.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taux de remplissage moyen
              </Typography>
              <Typography variant="h4">
                {bins.length > 0
                  ? `${(
                      bins.reduce((acc, bin) => acc + bin.fill_percentage, 0) / bins.length
                    ).toFixed(1)}%`
                  : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports; 