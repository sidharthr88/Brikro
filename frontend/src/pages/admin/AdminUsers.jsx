import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import api from "../../api/axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id, isActive) => {
    try {
      await api.put(`/admin/users/${id}/status`, {
        isActive: !isActive
      });

      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          mb: 1
        }}
      >
        Users
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4
        }}
      >
        Manage BRIKRO users and account status.
      </Typography>

      {loading ? (
        <Typography>Loading users...</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #262626",
            borderRadius: 3
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.isActive ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={user.role === "admin"}
                      onClick={() =>
                        handleStatusChange(user._id, user.isActive)
                      }
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default AdminUsers;