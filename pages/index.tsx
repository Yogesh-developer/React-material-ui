// pages/index.js
import React, { useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";

const unusedConst = "I'm not used anywhere";

function UserCard({ name, email }) {
  return (
    <Paper elevation={2} sx={{ p: 2, my: 1 }}>
      <Typography variant="h6">{name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {email}
      </Typography>
    </Paper>
  );
}

function ProfileSection() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then(setUser);
  }, []);

  return (
    <Box style={{ border: "1px solid red", padding: 10 }}>
      <h3>Profile</h3>
      <img src="/profile.jpg" />
      <p>Name: {user?.name}</p>
    </Box>
  );
}

function BadForm() {
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Submitting: " + formData.name + ", " + formData.email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Name"
        value={formData.name}
        onChange={(e) => {
          formData.name = e.target.value;
          setFormData({ ...formData });
        }}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Email"
        value={formData.email}
        onChange={(e) => {
          formData.email = e.target.value;
          setFormData({ ...formData });
        }}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" color="secondary">
        Submit
      </Button>
    </form>
  );
}

export default function Home({ greeting }) {
  const sampleUsers = [
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" },
    { name: "Charlie", email: "charlie@example.com" },
  ];

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

            <Divider sx={{ my: 2 }} />
            <ProfileSection />

            <Divider sx={{ my: 2 }} />
            <BadForm />

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Users</Typography>
            {sampleUsers.map((user) => (
              <UserCard name={user.name} email={user.email} />
            ))}
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
