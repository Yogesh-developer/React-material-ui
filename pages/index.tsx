// pages/index.js
import React from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

export default function Home({ greeting }) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {greeting}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" color="text.secondary" gutterBottom>
              This is a statically generated page using Next.js and Material UI.
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              You can customize this card further to display user info, dynamic
              content, or API-driven data.
            </Typography>

            <h2 style={{ color: "green", fontWeight: "bold" }}>
              Hi welcome to HTML
            </h2>
            <p>This is Home Page</p>
            <ul>
              <li>Its a good UI</li>
              <li>Hey</li>
              <li>How are You ?</li>
            </ul>
          </CardContent>

          <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
            <Button variant="contained" color="primary">
              Get Started
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}

export async function getStaticProps() {
  return {
    props: { greeting: "👋 Welcome to Your MUI Page!" },
  };
}
