import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // כאן אפשר להוסיף לוגיקה לשליחת השגיאה לשרת הלוגים
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            משהו השתבש
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            מצטערים, אך התרחשה שגיאה בלתי צפויה.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            רענן את העמוד
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ mt: 4, textAlign: 'left', maxWidth: '800px' }}>
              <Typography variant="h6" color="error">
                פרטי השגיאה (מוצג רק בסביבת פיתוח):
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
