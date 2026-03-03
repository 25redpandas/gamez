'use client';

import { Box, Typography, Container, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

// Styled components for portrait orientation and mobile-friendly design
const PortraitContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  overflow: 'auto',
  touchAction: 'manipulation', // Prevents zoom on double-tap
  userSelect: 'none',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  }
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
    backgroundColor: theme.palette.primary.light,
  },
  '&:active': {
    transform: 'scale(0.98)',
  }
}));

const CategoryText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  }
}));

const CategoryGrid = styled(Box)(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  width: '100%',
}));

const CategoryItem = styled(Box)(() => ({
  flex: '1 1 calc(50% - 8px)',
  minWidth: 'calc(50% - 8px)',
  maxWidth: 'calc(50% - 8px)',
}));

// Categories list
const CATEGORIES = [
  { id: 1, name: 'Movies', icon: '🎬' },
  { id: 2, name: 'Fruits', icon: '🍎' },
  { id: 3, name: 'Companies', icon: '🏢' },
  { id: 4, name: 'Animals', icon: '🐾' },
  { id: 5, name: 'Countries', icon: '🌍' },
  { id: 6, name: 'Sports', icon: '⚽' },
  { id: 7, name: 'Music', icon: '🎵' },
  { id: 8, name: 'Food', icon: '🍕' },
  { id: 9, name: 'Cities', icon: '🏙️' },
  { id: 10, name: 'Colors', icon: '🎨' },
  { id: 11, name: 'Vehicles', icon: '🚗' },
  { id: 12, name: 'Technology', icon: '💻' },
];

export default function CategorySelectionPage() {
  const router = useRouter();

  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    // Navigate to word carousel page with category as query parameter
    router.push(`/charades/word-carousel?category=${encodeURIComponent(category.name)}`);
  };

  return (
    <PortraitContainer>
      <Container maxWidth="sm">
        <PageTitle>
          Select a Category
        </PageTitle>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: 'center' }}
        >
          Choose a category to start the word game
        </Typography>

        {/* 2x6 Grid of Categories */}
        <CategoryGrid>
          {CATEGORIES.map((category) => (
            <CategoryItem key={category.id}>
              <CategoryCard
                onClick={() => handleCategoryClick(category)}
                elevation={3}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {category.icon}
                  </Typography>
                  <CategoryText>
                    {category.name}
                  </CategoryText>
                </CardContent>
              </CategoryCard>
            </CategoryItem>
          ))}
        </CategoryGrid>

        {/* Instructions */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Tap any category to begin playing
          </Typography>
        </Box>
      </Container>
    </PortraitContainer>
  );
}

