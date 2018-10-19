var derivedEmotions = {
  "love": ["joy", "trust"],
  "submission": ["trust", "fear"],
  "awe": ["fear", "surprise"],
  "disapproval": ["surprise", "sadness"],
  "remorse": ["sadness", "disgust"],
  "contempt": ["disgust", "anger"],
  "agressiveness": ["anger", "anticipation"]
};

var colors = {
  joy: "#aa0",
  trust: "#9d9",
  fear: "#0a0",
  surprise: "#0aa",
  sadness: "#00a",
  disgust: "#a0a",
  anger: "#a00",
  anticipation: "#a50",
  love: "#ff0",
  submission: "#0f0",
  awe: "#0ff",
  disapproval: "#00f",
  remorse: "#f0f",
  contempt: "#faa",
  agressiveness: "#f00"
};

if (enableDerived) {
  for (var key in derivedEmotions) {
    edState[key] = 0.0;
  }
}

function updateUI() {
  for (var key in edState) {        
    document.getElementById(key + "-value").style.width = edState[key] * 100.0 + "px";
    document.getElementById(key + "-value").innerHTML = key + " " + edState[key].toFixed(3);
  }
}

function createUI() {
  var values = [0.05, 0.10, 0.25, 0.50, 1.00];
  for (var key in edState) {
    if (Object.keys(derivedEmotions).indexOf(key) !== -1) continue;

    var div = document.createElement("div");
    
    for (var i = 0; i < 5; i++) {
      var currentValue = values[i];
      var btn = document.createElement("button");
      btn.onclick = edStimulate.bind(this, key, currentValue);
      btn.innerHTML = key + " +" + currentValue.toFixed(2);
      btn.style = "border-color: " + colors[key];

      div.append(btn);
    }

    document.getElementsByTagName("body")[0].append(div);
  }

  for (var key in edState) {
    //<span id="joy-value" style="border-color: #aa0"></span>
    var span = document.createElement("span");
    span.id = key + "-value";
    span.style = "border-color: " + colors[key];

    document.getElementsByTagName("body")[0].append(span);
  }
}

createUI();

var edDecayOverTime = 0.001;
var edTimesPerSecond = 30;

function edDecay(emotion) {
  var decayValue = edDecayOverTime * (30 / edTimesPerSecond);

  if (edState[emotion] - decayValue >= 0.0) edState[emotion] -= decayValue;
  else edState[emotion] = 0.0;
}

function calculateDerived() {
  for (var key in derivedEmotions) {
    var a = edState[derivedEmotions[key][0]];
    var b = edState[derivedEmotions[key][1]];
    edState[key] = a * b;
  }
}

function edRegulate() {
  for (var key in edState) {        
    edDecay(key);
    if (enableDerived) calculateDerived();
  }

  updateUI();
};

function edStimulateOpposite(emotion, amount) {
  if (edState[emotion] - amount >= 0.0) edState[emotion] -= amount;
  else edState[emotion] = 0.0;
}

function edStimulate(emotion, amount) {
  edStimulateOpposite(edOpposites[emotion], amount);

  if (edState[emotion] + amount <= 1.0) edState[emotion] += amount;
  else edState[emotion] = 1.0;
}

edRegulate();
setInterval(edRegulate, 1000 / edTimesPerSecond);