"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const CabinetCategoriesModal = ({
  open,
  handleClose,
  mode = "add", // 'add' | 'edit' | 'view'
  initialData = null,
  onSubmit,
}) => {
  const [data, setData] = useState({
    name: "",
    subCategories: [{ name: "" }],
  });

  // ✅ Pre-fill data when editing/viewing
  useEffect(() => {
    if (initialData) {
      setData({ name: initialData.name || "" });
    } else {
      setData({ name: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(data);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "add" && "Add New Category"}
        {mode === "edit" && "Edit Category"}
        {mode === "view" && "View Category"}
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          margin="normal"
          label="Category Name"
          name="name"
          value={data.name}
          onChange={handleChange}
          disabled={mode === "view"} // ✅ disable field in view mode
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          {mode === "view" ? "Close" : "Cancel"}
        </Button>

        {mode !== "view" && (
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {mode === "add" ? "Add" : "Update"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CabinetCategoriesModal;
