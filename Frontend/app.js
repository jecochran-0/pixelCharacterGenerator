document.addEventListener("DOMContentLoaded", function () {
  const generateBtn = document.getElementById("generate-btn");
  const characterDisplay = document.getElementById("character-display");

  generateBtn.addEventListener("click", generateCharacter);

  async function generateCharacter() {
    const description = document
      .getElementById("character-description")
      .value.trim();

    if (!description) {
      alert("Please enter a character description");
      return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    characterDisplay.innerHTML =
      '<div class="loading">Creating your pixel character...</div>';

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate character");
      }

      const data = await response.json();

      // Display the generated character with download button
      characterDisplay.innerHTML = `
        <div class="character-result">
          <img src="${data.imageUrl}" alt="Generated pixel character" id="character-image">
          <p>Your unique pixel character!</p>
          <button id="download-btn" class="download-btn">Download Character</button>
        </div>
      `;

      // Add event listener to download button
      document
        .getElementById("download-btn")
        .addEventListener("click", function () {
          downloadCharacter(data.imageUrl, `pixel-character-${Date.now()}.png`);
        });
    } catch (error) {
      console.error("Error:", error);
      characterDisplay.innerHTML =
        '<div class="error">Failed to generate character. Please try again.</div>';
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Character";
    }
  }

  // Function to download the image
  function downloadCharacter(imageUrl, filename) {
    // Create a link to our proxy endpoint
    const proxyUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}`;

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = proxyUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
});
