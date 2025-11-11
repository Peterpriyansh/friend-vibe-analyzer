document.getElementById("analyzeBtn").addEventListener("click", analyzeChat);
document.getElementById("fileInput").addEventListener("change", uploadFile);

let chart;

function uploadFile(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        document.getElementById("chatInput").value = reader.result;
    };
    reader.readAsText(file);
}

function extractEmojis(str) {
    return Array.from(str).filter(char => /\p{Emoji}/u.test(char));
}

function autoSentiment(word) {
    word = word.toLowerCase().replace(/[^a-zA-Z]/g, "");

    if (!word) return 0;
    if (/(bro|bhai|yaar|sweet|cute)/.test(word)) return 2;
    if (/(haha|lol|nice|awesome|good|great|mast)/.test(word)) return 2;
    if (/(sad|cry|hurt|angry|idiot|hate)/.test(word)) return -3;
    if (/(mn|man|mood|nhi|nahi|baat|down|tired|thak|dukhi|akela)/.test(word)) return -3;
    if (/(mc|bc|bsdk|gandu|madarchod|chutiya)/.test(word)) return -5;
    if (/^(ok|k|hmm|hn)$/.test(word)) return -1;
    if (/(please|thank|sorry)/.test(word)) return 1;

    const v = word.match(/[aeiou]/g)?.length || 0;
    if (word.length > 6 && v >= 3) return 1;
    if (word.length <= 3 && v === 0) return -1;

    return 0;
}

function parseChat(raw) {
    const lines = raw.split("\n").filter(x => x.trim().length > 0);
    let parsed = [];

    lines.forEach(line => {
        if (/^\[.*?\]/.test(line)) {
            let after = line.split("]")[1].trim();
            let name = after.split(":")[0].trim();
            let msg = after.split(":").slice(1).join(":").trim();
            parsed.push({ name, msg });
            return;
        }

        if (line.includes(":")) {
            let name = line.split(":")[0].trim();
            let msg = line.split(":").slice(1).join(":").trim();
            parsed.push({ name, msg });
            return;
        }

        parsed.push({ name: "Unknown", msg: line.trim() });
    });

    return parsed;
}

function analyzeChat() {
    let raw = document.getElementById("chatInput").value.trim();
    if (!raw) return alert("Paste chat first!");

    let parsed = parseChat(raw);

    let vibe = 50;
    let toxic = 0;
    let scoreA = 50, scoreB = 50;

    let names = [...new Set(parsed.map(x => x.name))];
    let A = names[0] || "Person A";
    let B = names[1] || "Person B";

    let emotion = { happy: 0, sad: 0, angry: 0, excited: 0, neutral: 0, love: 0 };

    const preview = document.getElementById("chatPreview");
    preview.innerHTML = "";

    parsed.forEach(item => {
        let txt = item.msg.toLowerCase();

        let bubble = document.createElement("div");
        bubble.classList.add("bubble");
        bubble.classList.add(item.name === A ? "left" : "right");
        bubble.innerText = item.name + ": " + item.msg;

        let emos = extractEmojis(item.msg);

        let emotionalAnger = false;
        if (/(khana|nhi khaya|take care|so ja|rest kar|uth ja)/.test(txt) && /😤|😡/.test(item.msg))
            emotionalAnger = true;

        if (/(akela|chorr de|mann nahi|mn nhi|baat nahi|baat krne ka)/.test(txt)) {
            vibe -= 4;
            emotion.sad += 2;
        }

        emos.forEach(e => {
            if ("😊🙂😄😁😃😇".includes(e)) { emotion.happy++; vibe += 3; }
            else if ("😂🤣".includes(e)) { emotion.happy += 2; vibe += 4; }
            else if ("❤️💕💖💗😘😍🥰".includes(e)) { emotion.love++; vibe += 5; }
            else if ("😢😭🥺💔😖😫😩😔😞😟".includes(e)) { emotion.sad += 2; vibe -= 6; }
            else if ("😡🤬😠😤".includes(e)) {
                if (emotionalAnger) {
                    emotion.sad++;
                    vibe -= 2;
                } else {
                    emotion.angry++;
                    vibe -= 5;
                    toxic += 3;
                }
            }
            else if ("😒🙄😑".includes(e)) { emotion.angry++; vibe -= 2; }
            else emotion.neutral++;
        });

        txt.split(/\s+/).forEach(w => {
            let s = autoSentiment(w);
            vibe += s;

            if (item.name === A) scoreA += s;
            else scoreB += s;

            if (s < 0 && !emotionalAnger) bubble.classList.add("bubble-toxic");
        });

        preview.appendChild(bubble);
    });

    vibe = Math.max(0, Math.min(100, vibe));
    scoreA = Math.max(0, Math.min(100, scoreA));
    scoreB = Math.max(0, Math.min(100, scoreB));

    document.getElementById("vibeValue").innerText = vibe;
    document.getElementById("vibeFill").style.width = vibe + "%";

    document.getElementById("scoreA").innerText = scoreA;
    document.getElementById("scoreB").innerText = scoreB;

    let toxText = document.getElementById("toxicity");
    if (toxic < 4) { toxText.innerText = "Low"; toxText.style.color = "#2ecc71"; }
    else if (toxic < 8) { toxText.innerText = "Medium"; toxText.style.color = "#f1c40f"; }
    else { toxText.innerText = "High"; toxText.style.color = "#e74c3c"; }

    document.getElementById("summaryText").innerText =
        `Vibe Score: ${vibe}. ${A}: ${scoreA}, ${B}: ${scoreB}. Toxicity: ${toxText.innerText}.`;

    const ctx = document.getElementById("emotionChart");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: ["Happy", "Sad", "Angry", "Excited", "Neutral", "Love"],
            datasets: [{
                label: "Emotions",
                data: [
                    emotion.happy,
                    emotion.sad,
                    emotion.angry,
                    emotion.excited,
                    emotion.neutral,
                    emotion.love
                ],
                backgroundColor: "#007aff22",
                borderColor: "#007aff",
                pointBackgroundColor: "#007aff"
            }]
        },
        options: {
            plugins: { legend: { labels: { color: "#333" } } },
            scales: {
                r: {
                    ticks: { display: false },
                    grid: { color: "#ddd" },
                    angleLines: { color: "#bbb" }
                }
            }
        }
    });
}
