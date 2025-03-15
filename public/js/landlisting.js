import { db } from './firebase.js';  // Correct path to firebase.js file
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"; 
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";  // Import Firebase Storage functions

// Example function to add land data to Firestore
document.getElementById('addLandForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const landName = document.getElementById('landName').value;
  const landDescription = document.getElementById('landDescription').value;
  const landPrice = document.getElementById('landPrice').value;
  const landLocation = document.getElementById('landLocation').value;
  const landSize = document.getElementById('landSize').value;
  const landImageFile = document.getElementById('landImage').files[0];  // Get the file from the input field

  if (landImageFile) {
    try {
      // Step 1: Upload image to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, 'lands/' + landImageFile.name);  // Create a reference for the file
      const uploadTask = uploadBytesResumable(storageRef, landImageFile);  // Upload the image

      // Step 2: Get the download URL after the upload is complete
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Optionally track upload progress
        }, 
        (error) => {
          console.error("Error uploading image: ", error);
        }, 
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);  // Get the image URL

          // Step 3: Save the data to Firestore
          await addDoc(collection(db, "lands"), {
            landName,
            landDescription,
            landPrice,
            landLocation,
            landSize,
            landImage: imageUrl,  // Save the image URL
          });

          alert('Land added successfully!');
          document.getElementById('popupForm').style.display = 'none'; // Close the popup
        }
      );
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  } else {
    alert("Please upload an image.");
  }
});


async function loadLands() {
    const querySnapshot = await getDocs(collection(db, "lands"));
    const propertyGrid = document.querySelector('.property-grid');
    propertyGrid.innerHTML = '';  // Clear previous listings

    querySnapshot.forEach((doc) => {
        const landData = doc.data();
        const landItem = document.createElement('div');
        landItem.classList.add('property-item');
        landItem.innerHTML = `
            <img src="${landData.landImage}" alt="${landData.landName}">
            <h3>${landData.landName}</h3>
            <p>${landData.landDescription}</p>
            <p>Price: $${landData.landPrice}</p>
            <p>Location: ${landData.landLocation}</p>
            <p>Size: ${landData.landSize} sq.m.</p>
        `;
        propertyGrid.appendChild(landItem);
    });
}

  

// Load lands on page load
window.addEventListener('DOMContentLoaded', loadLands);
