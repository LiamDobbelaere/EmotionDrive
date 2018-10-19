# EmotionDrive

EmotionDrive is a compact system to provide artificial emotions to any game or software application. The code is fairly simple and can be implemented in just about every programming language.

The system is based on [Plutchik's wheel of emotions](https://en.wikipedia.org/wiki/Robert_Plutchik#Plutchik%27s_wheel_of_emotions). It's a wheel that defines 8 primary and 8 derived emotions, they vary in intensity and emotions opposite on the wheel are polar opposites.

The `playground.html` contains a playground that uses just 4 of the 8 primary emotions (joy, fear, sadness, anger). You can press buttons to see how emotions affect others and how they decay over time.

The `playground_extended.html` contains the same playground but uses all 8 primary emotions and also calculates the derived emotions.

## How does it work?
Below is the core explanation of what makes EmotionDrive work. Consider it a recipe for making your own implementation. It's a very simple but powerful concept, see `Applications` below. Examples in other languages may come later, this implementation can also be found in `playground.js`.

### Step 1: State
We define emotions in this case as a value between `0.0` and `1.0`. You could interpet 0 as "no emotion of this kind" and 1 as "full emotion of this kind". So a `Joy` of `1.0` would mean as happy as you can possibly be.

You have to decide if you want to use 4 or 8 emotions (see wheel of Plutchik). The 4 basic ones are joy, fear, sadness and anger. The 4 secondary ones are trust, surprise, disgust and anticipation. Whether you choose 4 or 8, the process remains the same. Later on you will be able to decide whether to calculate the derived ones too.

We need to keep track of the values for these emotions. Ideally you could work with a dictionary to simplify the functions using for loops. In this case I'll just show how it was done in the playground example:
```javascript
var edState = {
  joy: 0.0,
  sadness: 0.0,
  fear: 0.0,
  anger: 0.0
};
```

There, simple enough right? 

### Step 2: Regulating
Emotions don't stay as they are, they decay over time. We need to call something a certain times per second to take care of this for us.

In the playground, the function is called `30` times a second and the decay for every function call is `-0.001`, thus resulting in `-0.03` per second. The `0.001` is what's most important here as that defines how fast it decays linearly over time.

Point is you should call regulate, regularly. ;)
That could be once a second or thirty or sixty times a second. Just remember to adjust the `0.001` so that it scales properly. If you run it only once a second the decay rate of `0.001` should instead be `0.03`. Like I said, in the playground it's called 30 times a second so the decay rate is `0.001` there.

Right, so what does the regulate function look like?

```javascript
  function edRegulate() {
    for (var key in edState) {        
      edDecay(key);
      //calculateDerived could come here, later
    }
  }
```

For every emotion we have in our state, we'll call a decay function for that emotion. What the decay function does is:

```javascript
function edDecay(emotion) {
  var decayValue = edDecayOverTime;

  if (edState[emotion] - decayValue >= 0.0) edState[emotion] -= decayValue;
  else edState[emotion] = 0.0;
}
```

`edDecayOverTime` would be `0.001` in this case, assuming it's being called `30` times a second. We subtract this `0.001` from the value of the emotion we're applying the decay to or set it to `0.0` if that would cause it to fall below `0`.

Cool, so far our emotions will regulate over time, moving back to a neutral position of `0.0`.

## Step 3: Stimulating
We should of course be able to stimulate emotions. Certain events can increase a certain emotion by a certain amount. The amount that it's increased by must, again, be a value between `0.0` and `1.0`. If we stimulate anger by `0.05`, that means we must stimulate `20` times to get full anger (= rage on the wheel of Plutchik). Keep this in mind to know how much to pass to the stimulate function.

Meet your stimulation function:
```javascript
function edStimulate(emotion, amount) {
  edStimulateOpposite(edOpposites[emotion], amount);

  if (edState[emotion] + amount <= 1.0) edState[emotion] += amount;
  else edState[emotion] = 1.0;
}
```

It's like almost like the decay function, except it adds a certain value and limits the highest possible value of the emotion to `1.0`. `edOpposites` in the `edStimulate` function contains the opposite names of every emotion:
```javascript
  var edOpposites = {
    joy: "sadness",
    fear: "anger",
    sadness: "joy",
    anger: "fear"
  };
```

But wait, what is `edStimulateOpposite`? Let's have a look:
```javascript
function edStimulateOpposite(emotion, amount) {
  if (edState[emotion] - amount >= 0.0) edState[emotion] -= amount;
  else edState[emotion] = 0.0;
}
```

This is even more like the decay function! Except it takes a specific value and not always `0.001`. It'll subtract the value but limit the lowest possible value of the emotion to `0.0`.

Okay so, what does this mean? Consider I have a sadness of `1.0` and I receive a stimulus for joy of `0.25`, then my sadness will drop to `0.75` because joy and sadness are polar opposites.

`edStimulateOpposite` is an important function because it balances out the opposite of an emotion when that emotion is stimulated. The value that is added to one emotion is simply subtracted from its polar opposite.

## Step 4 (Optional): Derived emotions
Now you technically should already have a working implementation with either 4 or 8 primary emotions. But, there are 8 extra emotions that can be calculated based on the existing 8. Note that you can't do the following unless you implemented all 8 and not just 4.

Going back to our regulate function, we can add something that calculates 8 extra emotions that are derived based on the existing 8:

```javascript
  function edRegulate() {
    for (var key in edState) {        
      edDecay(key);
      calculateDerived(); //<-- Here
    }
  }
```

Right, so what does `calculateDerived` do? Well, before that we need to define which emotions a derived emotion is derived from:
```javascript
var derivedEmotions = {
  "love": ["joy", "trust"],
  "submission": ["trust", "fear"],
  "awe": ["fear", "surprise"],
  "disapproval": ["surprise", "sadness"],
  "remorse": ["sadness", "disgust"],
  "contempt": ["disgust", "anger"],
  "agressiveness": ["anger", "anticipation"]
};
```

This means for example if we have joy but also trust, there is also love. Okay, so now let's look at `calculateDerived`:

```javascript
function calculateDerived() {
  for (var key in derivedEmotions) {
    var a = edState[derivedEmotions[key][0]];
    var b = edState[derivedEmotions[key][1]];
    edState[key] = a * b;
  }
}
```

It sets the derived emotions in `edState` to some calculated value. This calculated value is the product of the values of the two emotions this derived emotion is dependent on.

If I have `1.0` joy but `0.0` trust, `1.0 * 0.0 makes 0.0`, so there is no love. Only if both of them have some value, our derived emotion will form. `0.5` joy and `0.5` trust would make `0.25` love.

These derived emotions are part of `edState` (your emotion state) but should never be stimulated directly. They are calculated based on the existing emotions and can provide extra granularity.

## Applications
There are many possible applications I could think of, but one of them that I will be testing EmotionDrive in is games.

It can be used to make simulated game AI react to the environment. Say an enemy gets attacked often, its anger goes up using our stimulate functions. It starts behaving differently when the anger is above `0.5`, becoming more agressive.

If the enemy gets scared however, through EmotionDrive, the anger will sink because they are polar opposites.

You could make it even more complex by involving the 4 secondary and the 8 derived emotions.

In short, you can use the emotion parameters provided by `edState` to steer behaviour.