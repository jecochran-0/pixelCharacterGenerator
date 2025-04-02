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
      // Step 1: Initiate image generation
      const initiateResponse = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!initiateResponse.ok) {
        throw new Error("Failed to start character generation");
      }

      const initiateData = await initiateResponse.json();
      const requestId = initiateData.requestId;

      // Step 2: Poll for results
      let result = null;
      let attempts = 0;
      const maxAttempts = 30; // Try for about 30 seconds

      while (attempts < maxAttempts && !result) {
        attempts++;

        // Show progress
        characterDisplay.innerHTML = `<div class="loading">Creating your pixel character (${attempts}/${maxAttempts})...</div>`;

        // Wait 1 second between poll attempts
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check status
        const statusResponse = await fetch(
          `/api/generate-character?requestId=${requestId}`,
          {
            method: "GET",
          }
        );

        if (!statusResponse.ok) {
          continue; // Skip this attempt if there's an error
        }

        const statusData = await statusResponse.json();

        // If image is ready, store the result
        if (statusData.status === "completed") {
          result = statusData;
          break;
        }

        // If error occurred, throw
        if (statusData.status === "error") {
          throw new Error(statusData.error || "Error generating image");
        }
      }

      if (!result) {
        throw new Error("Timed out waiting for image generation");
      }

      // Display the generated character with download button
      characterDisplay.innerHTML = `
        <div class="character-result">
          <img src="${result.imageUrl}" alt="Generated pixel character" id="character-image">
          <p>Your unique pixel character!</p>
          <button id="download-btn" class="download-btn">Download Character</button>
        </div>
      `;

      // Add event listener to download button
      document
        .getElementById("download-btn")
        .addEventListener("click", function () {
          downloadCharacter(
            result.imageUrl,
            `pixel-character-${Date.now()}.png`
          );
        });
    } catch (error) {
      console.error("Error:", error);
      characterDisplay.innerHTML = `<div class="error">Failed to generate character: ${error.message}</div>`;
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
