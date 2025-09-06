export const parseIngredients = (ingredients) => {
  return ingredients
    .replace(/C\s*\(/, "")
    .replace(")", "")
    .split(",")
    .map((item) => `𐤟 ${item.replace(/"/g, "").trim()}`);
};

export const parseInstructions = (instructions) => {
  return instructions
    .replace(/^C\s*\(/, "")
    .replace(/\)$/, "")
    .replace(/,\s*$/, "")
    .replace(/([a-zA-Z0-9])\./g, "$1.")
    .split(/\.(?!\s*\d)/)
    .map((step) => step.trim())
    .filter((step) => step.length >= 1);
};

export function parseImageUrls(val) {
  if (!val || typeof val !== "string") return [];

  // Remove extra wrapping characters
  let cleaned = val.trim()
    .replace(/^"+|"+$/g, "")    // strip surrounding quotes
    .replace(/,+$/, "");        // strip trailing commas

  if (!cleaned) return [];

  // Special case: if URL starts with https but contains commas inside, 
  // rejoin everything until ".jpg" or ".png"
  const match = cleaned.match(/https?:\/\/[^\s"]+\.(jpg|png|jpeg|webp)/i);
  if (match) {
    return [match[0]]; // extract full proper URL
  }

  // If multiple valid URLs exist, return them
  return cleaned.split(",").map(u => u.trim()).filter(Boolean);
}

export const convertCookingTime = (time) => {
  const regex = /PT(\d+)H(\d+)M/;
  const regexMinutes = /PT(\d+)M/;

  let match = time.match(regex);
  if (match) {
    const hours = match[1];
    const minutes = match[2];
    return `${hours} saat ${minutes} dk`;
  }

  match = time.match(regexMinutes);
  if (match) {
    const minutes = match[1];
    return `${minutes} dk`;
  }

  return time;
};
