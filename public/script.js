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
    const shareContainer = document.querySelector(".share-container");
    const fileURLInput = document.querySelector("#fileURL");
    const copyURLBtn = document.querySelector("#copyURLBtn");
    const emailToInput = document.querySelector("#emailTo");
    const sendEmailBtn = document.querySelector("#sendEmailBtn");
  
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
  
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, highlight, false);
    });
  
    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });
  
    function highlight() {
      dropZone.classList.add("dragged");
    }
  
    function unhighlight() {
      dropZone.classList.remove("dragged");
    }
  
    dropZone.addEventListener("drop", handleDrop, false);
  
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    }
  
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
  
    function displayFileInfo(file) {
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      fileInfo.textContent = `${file.name} (${fileSize} MB)`;
      fileInfo.classList.add("show");
    }
  
    uploadBtn.addEventListener("click", () => {
      if (fileInput.files.length > 0) {
        uploadFile(fileInput.files[0]);
      }
    });
  
    async function uploadFile(file) {
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        progressContainer.style.display = "block";
        dropZone.style.cursor = "wait";
        uploadBtn.disabled = true;
  
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log("Upload complete", result);
          alert("File uploaded successfully!");
          uploadComplete(result.fileUrl);
        } else {
          console.error("Upload failed");
          alert("Upload failed!");
          resetUpload();
        }
      } catch (err) {
        console.error("Error uploading file: ", err);
        alert("Error uploading file! Please try again.");
        resetUpload();
      }
    }
  
    function uploadComplete(fileUrl) {
      uploadContainer.classList.add("success");
      shareContainer.style.display = "block";
      fileURLInput.value = fileUrl;
      setTimeout(() => {
        resetUpload();
      }, 2000);
    }
  
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
  
    browserBtn.addEventListener("click", () => {
      fileInput.click();
    });

    copyURLBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(fileURLInput.value);
        copyURLBtn.textContent = "Copied!";
        setTimeout(() => {
          copyURLBtn.textContent = "Copy Link";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });

    sendEmailBtn.addEventListener("click", async () => {
      const emailTo = emailToInput.value;
      if (!emailTo) {
        alert("Please enter an email address");
        return;
      }

      try {
        sendEmailBtn.disabled = true;
        sendEmailBtn.textContent = "Sending...";
        
        const response = await fetch("/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            emailTo,
            fileUrl: fileURLInput.value
          })
        });

        const data = await response.json();
        alert(data.message);
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Error sending email");
      } finally {
        sendEmailBtn.disabled = false;
        sendEmailBtn.textContent = "Send Email";
      }
    });
});