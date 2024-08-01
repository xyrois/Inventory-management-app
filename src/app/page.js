'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#a86e68', // Updated background color for the popup
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  color: 'white', // White text color
};

const shelfContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxHeight: '69vh', // Adjust the maximum height as needed
  overflowY: 'auto', // Enable vertical scrolling
};

const tierStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 2,
  flexWrap: 'wrap',
  width: '800px',
  marginBottom: '20px', // Add some space between tiers
};

const itemStyle = {
  backgroundColor: '#833', 
  border: '1px solid #777',
  borderRadius: '8px',
  padding: '10px',
  width: '150px',
  textAlign: 'center',
  color: 'white', 
};

const buttonStyle = {
  position: 'fixed',
  bottom: '20px',
  width: '150px',
  left: '50%',
  transform: 'translateX(-50%)',
  bgcolor: '#db5b4f', // Initial button color
  color: 'white', // Text color
  '&:hover': {
    bgcolor: '#a8463d', // Hover color
  },
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [filter, setFilter] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFilter = () => {
    if (filter === '') {
      setFilteredInventory(inventory);
    } else {
      setFilteredInventory(
        inventory.filter((item) =>
          item.name.toLowerCase().includes(filter.toLowerCase())
        )
      );
    }
  };

  // Function to split inventory into tiers
  const getTiers = (items, itemsPerTier) => {
    const tiers = [];
    for (let i = 0; i < items.length; i += itemsPerTier) {
      tiers.push(items.slice(i, i + itemsPerTier));
    }
    return tiers;
  };

  const itemsPerTier = 4; // Adjust as needed
  const tiers = getTiers(filteredInventory, itemsPerTier);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      padding={2}
      bgcolor="#805450" // Dark background color for the entire page
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              InputProps={{
                style: { color: 'white' },
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              style={{ color: 'white', borderColor: 'white' }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          id="filter"
          label="Filter Items"
          variant="outlined"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputLabelProps={{
            style: { color: 'white' },
          }}
          InputProps={{
            style: { color: 'white' },
          }}
        />
        <Button variant="contained" onClick={handleFilter} sx={{ bgcolor: '#db5b4f', color: 'white', '&:hover': { bgcolor: '#a8463d' } }}>
          Filter
        </Button>
      </Box>
      <Box border={'1px solid #333'} padding={2} borderRadius={2} bgcolor="#a86d68">
        <Typography variant={'h4'} color={'white'} textAlign={'center'} marginBottom={2}>
          Inventory Items
        </Typography>
        <Box sx={shelfContainerStyle}>
          {tiers.map((tier, index) => (
            <Box key={index} sx={tierStyle}>
              {tier.map(({ name, quantity }) => (
                <Box key={name} sx={itemStyle}>
                  <Typography variant={'h6'} color={'white'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant={'body1'} color={'white'}>
                    Quantity: {quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => removeItem(name)}
                    sx={{ marginTop: 1, bgcolor: '#db5b4f', '&:hover': { bgcolor: '#a8463d' }, color: 'white' }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Button variant="contained" onClick={handleOpen} sx={buttonStyle}>
        Add New Item
      </Button>
    </Box>
  );
}