'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORY_WORDS } from '../categoryWords';

// Styled components for landscape orientation and mobile-friendly design
const LandscapeContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
  touchAction: 'manipulation', // Prevents zoom on double-tap
  userSelect: 'none',
  '@media (orientation: portrait)': {
    '&::before': {
      content: '"Please rotate your device to landscape mode"',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '1.5rem',
      textAlign: 'center',
      padding: theme.spacing(3),
      zIndex: 1000,
    }
  }
}));

const CarouselBox = styled(Box)(({ theme }) => ({
  width: '80vw',
  height: '50vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:active': {
    transform: 'scale(0.98)',
  }
}));

const WordText = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '3rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  }
}));

const TimerText = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const ControlButton = styled(Button)(({ theme }) => ({
  fontSize: '1.5rem',
  padding: theme.spacing(2, 6),
  marginTop: theme.spacing(3),
  minWidth: '200px',
}));

const ScoreButton = styled(Button)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  width: '80px',
  height: '50vh',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    width: '60px',
    fontSize: '1.5rem',
  },
}));

const RedScoreButton = styled(Button)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  width: '80px',
  height: '50vh',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  writingMode: 'vertical-rl',
  textOrientation: 'mixed',
  [theme.breakpoints.down('md')]: {
    width: '60px',
    fontSize: '1.2rem',
  },
}));

const PointsDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

// Shuffle function to randomize word order
const shuffleArray = (array: string[]): string[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get words for the selected category or use all available words if no category selected
const getWordsForCategory = (category: string | undefined | null): string[] => {
  if (category && CATEGORY_WORDS[category as keyof typeof CATEGORY_WORDS]) {
    return shuffleArray(CATEGORY_WORDS[category as keyof typeof CATEGORY_WORDS]);
  }
  // If no category or invalid category, use a default list
  return shuffleArray([
    'Apple', 'Banana', 'Cherry', 'Dragon', 'Elephant',
    'Forest', 'Galaxy', 'Harmony', 'Island', 'Journey',
    'Kindle', 'Liberty', 'Mountain', 'Neptune', 'Ocean',
    'Phoenix', 'Quantum', 'Rainbow', 'Sunrise', 'Thunder',
  ]);
};

const TIMER_DURATION = 45; // seconds

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [points, setPoints] = useState(0);
  const [words, setWords] = useState<string[]>(() => getWordsForCategory(selectedCategory));
  const [isListening, setIsListening] = useState(false);

// Ref to hold the speech recognition instance
  const recognitionRef = useRef<any>(null);

  // Timer countdown effect
  useEffect(() => {
    if (!isStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeRemaining]);

  // Speech recognition effect
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim().toLowerCase();
      const currentWord = words[currentIndex]?.toLowerCase();

      console.log('Heard:', transcript, '| Expected:', currentWord);

      // Check if spoken word matches current word
      if (transcript === currentWord) {
        // Same behavior as green button - add 1 point and advance
        setPoints((prev) => prev + 1);
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Silently handle these errors
        return;
      }
    };

    recognition.onend = () => {
      // Restart recognition if game is still active
      if (isStarted && timeRemaining > 0) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Error restarting recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    // Start recognition when game starts
    if (isStarted) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }

    // Cleanup: stop recognition when game ends or component unmounts
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    };
  }, [isStarted, timeRemaining, currentIndex, words]);

  // Handle single/double click to advance carousel
  const handleCarouselClick = () => {
    if (!isStarted) return;

    // Treat both single click and double click as advance
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  // Green button: Add 1 point and advance
  const handleGreenButton = () => {
    if (!isStarted) return;
    setPoints((prev) => prev + 1);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  // Red button: Subtract 0.5 point and advance
  const handleRedButton = () => {
    if (!isStarted) return;
    setPoints((prev) => prev - 0.5);
    setCurrentIndex((prev) => (prev + 1) % words.length);
  };

  // Start button handler
  const handleStart = () => {
    setWords(getWordsForCategory(selectedCategory));
    setIsStarted(true);
    setCurrentIndex(0);
    setTimeRemaining(TIMER_DURATION);
    setPoints(0);
  };

  // Reset button handler
  const handleReset = () => {
    setIsStarted(false);
    setCurrentIndex(0);
    setTimeRemaining(TIMER_DURATION);
    setPoints(0);
  };

  return (
    <LandscapeContainer>
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        {/* Timer Display */}
        {isStarted && (
          <TimerText>
            Time Remaining: {timeRemaining}s
          </TimerText>
        )}

        {/* Category Display */}
        {selectedCategory && (
          <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
            Category: {selectedCategory}
          </Typography>
        )}

        {/* Speech Recognition Indicator */}
        {isListening && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 }
                }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              🎤 Listening...
            </Typography>
          </Box>
        )}

        {/* Points Display - Always visible during game */}
        {isStarted && (
          <PointsDisplay>
            Points: {points}
          </PointsDisplay>
        )}

        {/* Carousel Display with Score Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {/* Green Button on the Left */}
          {isStarted && (
            <ScoreButton
              variant="contained"
              onClick={handleGreenButton}
              sx={{
                backgroundColor: 'success.main',
                '&:hover': { backgroundColor: 'success.dark' }
              }}
            >
              +1
            </ScoreButton>
          )}

          {/* Carousel Box */}
          <CarouselBox
            onClick={handleCarouselClick}
            sx={{
              opacity: isStarted ? 1 : 0.5,
              pointerEvents: isStarted ? 'auto' : 'none',
            }}
          >
            <WordText>
              {isStarted ? words[currentIndex] : 'Click Start to Begin'}
            </WordText>
          </CarouselBox>

          {/* Red Button on the Right */}
          {isStarted && (
            <RedScoreButton
              variant="contained"
              onClick={handleRedButton}
              sx={{
                backgroundColor: 'error.main',
                '&:hover': { backgroundColor: 'error.dark' }
              }}
            >
              Pass
            </RedScoreButton>
          )}
        </Box>

        {/* Progress Indicator */}
        {isStarted && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Word {currentIndex + 1} of {words.length}
          </Typography>
        )}

        {/* Final Score Display - When timer ends */}
        {!isStarted && timeRemaining === 0 && (
          <Box sx={{ mt: 3 }}>
            <PointsDisplay sx={{ color: 'success.main' }}>
              Final Score: {points} points
            </PointsDisplay>
          </Box>
        )}

        {/* Control Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {timeRemaining === TIMER_DURATION ? (
            <ControlButton
              variant="contained"
              color="primary"
              onClick={handleStart}
              size="large"
            >
              Start
            </ControlButton>
          ) : (
            <>
              {timeRemaining === 0 && (
                <>
                  <ControlButton
                    variant="contained"
                    color="primary"
                    onClick={handleStart}
                    size="large"
                  >
                    Play Again
                  </ControlButton>
                  <ControlButton
                    variant="contained"
                    color="success"
                    onClick={() => router.push('/charades/categories')}
                    size="large"
                  >
                    Back to Categories
                  </ControlButton>
                </>
              )}
              <ControlButton
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                size="large"
              >
                Reset
              </ControlButton>
            </>
          )}
        </Box>

        {/* Instructions */}
        {timeRemaining === TIMER_DURATION && (
          <Box sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body1" color="text.secondary">
              Click Start to begin the 45-second timer. <br />
              <strong>🎤 Speech Recognition:</strong> Say the word aloud to score +1 point automatically! <br />
              Click the GREEN button (+1 point) or RED "Pass" button (-0.5 points) to score and advance. <br />
              You can also click the word box to advance without scoring. <br />
              The carousel will be disabled when the timer runs out.
            </Typography>
          </Box>
        )}
      </Container>
    </LandscapeContainer>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <GameContent />
      </Container>
    </Suspense>
  );
}
