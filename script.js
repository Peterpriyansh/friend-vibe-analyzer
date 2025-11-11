document.getElementById("analyzeBtn").addEventListener("click", () => {
const text = document.getElementById("chatInput").value;

let vibe = Math.floor(Math.random() * 100);
let toxic = Math.floor(Math.random() * 100);
let a = Math.floor(Math.random() * 50);
let b = Math.floor(Math.random() * 50);

document.getElementById("vibeValue").innerText = vibe;
document.getElementById("toxicity").innerText = toxic;
document.getElementById("scoreA").innerText = a;
document.getElementById("scoreB").innerText = b;

document.getElementById("summaryText").innerText =
vibe > 50 ? "Good vibes detected." : "Negative or mixed vibes.";

document.getElementById("chatPreview").innerHTML =
text.replace(/\n/g, "<br>");

new Chart(document.getElementById("emotionChart"), {
type: "radar",
data: {
labels: ["Happy", "Sad", "Angry", "Neutral", "Love", "Excited"],
datasets: [{
label: "Emotion Radar",
data: [
Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100,
Math.random()*100
]
}]
},
options: { responsive: true }
});
});

document.getElementById("toggleTheme").addEventListener("click", () => {
document.body.classList.toggle("dark");
});

document.getElementById("downloadReport").addEventListener("click", () => {
const vibe = document.getElementById("vibeValue").innerText;
const tox = document.getElementById("toxicity").innerText;
const summary = document.getElementById("summaryText").innerText;

const report =
`Friend Vibe Analyzer Report

Vibe Score: ${vibe}
Toxicity: ${tox}

Summary:
${summary}
`;

const blob = new Blob([report], { type: "text/plain" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "vibe_report.txt";
link.click();
});
