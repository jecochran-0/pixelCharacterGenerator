document.addEventListener("DOMContentLoaded", function () {
  const generateBtn = document.getElementById("generate-btn");
  const characterDisplay = document.getElementById("character-display");

  generateBtn.addEventListener("click", generateCharacter);

  async function generateCharacter() {
    const word1 = document.getElementById("word1").value.trim();
    const word2 = document.getElementById("word2").value.trim();
    const word3 = document.getElementById("word3").value.trim();

    if (!word1 || !word2 || !word3) {
      alert("Please enter all three words");
      return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    characterDisplay.innerHTML =
      '<div class="loading">Creating your character...</div>';

    try {
      const response = await fetch("/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word1, word2, word3 }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate character");
      }

      const data = await response.json();

      // Display the generated character
      characterDisplay.innerHTML = `
        <div class="character-result">
          <img src="${data.imageUrl}" alt="Generated pixel character">
          <p>Character based on: ${word1}, ${word2}, ${word3}</p>
        </div>
      `;
    } catch (error) {
      console.error("Error:", error);
      characterDisplay.innerHTML =
        '<div class="error">Failed to generate character. Please try again.</div>';
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Character";
    }
  }
});
