document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("file-input");
    const fileInfo = document.getElementById("fileInfo");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const uploadBtn = document.getElementById("uploadBtn");
    const uploadContainer = document.querySelector(".upload-container");
    const browserBtn = document.querySelector(".browser-button");
  
    // Prevent default behavior for drag and drop events
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
  
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    // Highlight drop zone on dragover or dragenter
    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, highlight, false);
    });
  
    // Unhighlight drop zone on dragleave or drop
    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });
  
    function highlight() {
      dropZone.classList.add("dragged");
    }
  
    function unhighlight() {
      dropZone.classList.remove("dragged");
    }
  
    // Handle file drop
    dropZone.addEventListener("drop", handleDrop, false);
  
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    }
  
    // Handle file selection from input
    fileInput.addEventListener("change", function () {
      handleFiles(this.files);
    });
  
    function handleFiles(files) {
      if (files.length > 0) {
        const file = files[0];
        displayFileInfo(file);
        uploadBtn.disabled = false;
      }
    }
  
    // Display file information
    function displayFileInfo(file) {
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // File size in MB
      fileInfo.textContent = `${file.name} (${fileSize} MB)`;
      fileInfo.classList.add("show");
    }
  
    // Handle upload button click
    uploadBtn.addEventListener("click", () => {
      if (fileInput.files.length > 0) {
        uploadFile(fileInput.files[0]);
      }
    });
  
    // Upload file to the server
    const uploadFile = async (file) => {
      const formData = new FormData();
      formData.append("upload", file);
  
      try {
        // Update UI during upload
        progressContainer.style.display = "block";
        dropZone.style.cursor = "wait";
        uploadBtn.disabled = true;
  
        const xhr = new XMLHttpRequest();
  
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressBar.style.width = percentComplete + "%";
            progressText.textContent = percentComplete.toFixed(2) + "%";
          }
        };
  
        // Handle upload success
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log("Upload complete", response);
            alert("File uploaded successfully!");
            uploadComplete();
          } else {
            console.error("Upload failed");
            alert("Upload failed!");
            resetUpload();
          }
        };
  
        // Handle upload error
        xhr.onerror = () => {
          console.error("Upload error");
          alert("Error uploading file!");
          resetUpload();
        };
  
        // Send the request
        xhr.open("POST", "/", true);
        xhr.send(formData);
      } catch (err) {
        console.error("Error uploading file: ", err);
        alert("Error uploading file! Please try again.");
        resetUpload();
      }
    };
  
    // Reset UI after upload completion
    function uploadComplete() {
      uploadContainer.classList.add("success");
      setTimeout(() => {
        resetUpload();
      }, 2000);
    }
  
    // Reset the upload process and UI
    function resetUpload() {
      fileInfo.textContent = "";
      fileInfo.classList.remove("show");
      progressContainer.style.display = "none";
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      uploadBtn.disabled = true;
      uploadContainer.classList.remove("success");
      fileInput.value = "";
      dropZone.style.cursor = "default";
    }
  
    // Open file input dialog on browser button click
    browserBtn.addEventListener("click", () => {
      fileInput.click();
    });
});  