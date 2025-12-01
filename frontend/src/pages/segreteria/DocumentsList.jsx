import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import useSegretariaStore from '../../stores/segretariaStore';
import { useAuthStore } from '../../stores/authStore';
import DocumentCard from '../../components/segreteria/DocumentCard';
import DocumentUpload from '../../components/segreteria/DocumentUpload';

const DocumentsList = () => {
  const { user } = useAuthStore();
  const {
    documentsByCategoria,
    loading,
    error,
    fetchDocumentsByCategoria,
    deleteDocument,
  } = useSegretariaStore();

  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchDocumentsByCategoria();
  }, [fetchDocumentsByCategoria]);

  const handleTabChange = (event, newValue) => {
    setSelectedCategoria(newValue);
  };

  const handleCreate = () => {
    setSelectedDocument(null);
    setUploadOpen(true);
  };

  const handleEdit = (document) => {
    setSelectedDocument(document);
    setUploadOpen(true);
  };

  const handleDelete = async (documentId) => {
    try {
      await deleteDocument(documentId);
      fetchDocumentsByCategoria();
    } catch (err) {
      console.error('Errore eliminazione:', err);
    }
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
    setSelectedDocument(null);
    fetchDocumentsByCategoria();
  };

  const canManage =
    user &&
    (user.role === 'superadmin' ||
      (user.role === 'admin' &&
        user.work_areas?.some((wa) => wa.code === 'segreteria')));

  // Filtra documenti per categoria e ricerca
  const getFilteredDocuments = () => {
    let documents = [];

    if (selectedCategoria === 'all') {
      // Tutte le categorie
      Object.values(documentsByCategoria).forEach((catDocs) => {
        documents = [...documents, ...catDocs];
      });
    } else {
      // Categoria specifica
      documents = documentsByCategoria[selectedCategoria] || [];
    }

    // Filtro ricerca
    if (searchQuery) {
      documents = documents.filter(
        (doc) =>
          doc.titolo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.descrizione.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return documents;
  };

  const filteredDocuments = getFilteredDocuments();

  // Tabs per categorie
  const categoriaTabs = [
    { value: 'all', label: 'Tutti' },
    ...Object.keys(documentsByCategoria).map((categoria) => ({
      value: categoria,
      label:
        documentsByCategoria[categoria][0]?.categoria_display ||
        categoria.toUpperCase(),
    })),
  ];

  if (loading && Object.keys(documentsByCategoria).length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Documenti Utili
        </Typography>

        {canManage && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Carica Documento
          </Button>
        )}
      </Box>

      {/* Barra di ricerca */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Cerca documenti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs per categorie */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategoria}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categoriaTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Grid di documenti */}
      {filteredDocuments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredDocuments.map((document) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
              <DocumentCard
                document={document}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={canManage}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6">
            {searchQuery
              ? 'Nessun documento trovato'
              : 'Nessun documento disponibile'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {searchQuery
              ? 'Prova a modificare i criteri di ricerca'
              : 'I documenti verranno visualizzati qui quando disponibili'}
          </Typography>
        </Box>
      )}

      {/* Dialog Upload */}
      <DocumentUpload
        open={uploadOpen}
        onClose={handleUploadClose}
        document={selectedDocument}
      />
    </Container>
  );
};

export default DocumentsList;
