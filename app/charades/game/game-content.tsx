'use client';

import { useSearchParams } from 'next/navigation';
import { Typography, Container } from '@mui/material';

export default function GameContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Category: {category}
      </Typography>

      {/* ...existing code... */}
    </Container>
  );
}

