# Data Deprecations

While I always considered it to be super important to keep the public "API" of Dauntless Builder aka the data super
stable/fixed, I decided it is necessary to start removing some old concepts that aren't really a part of Dauntless
anymore, like gear levels! More to come, probably.

# 2022-06-13

## Removal of perk key and value

Up until now we've been trying to express data points as seperate fields in order to easily extract them for
calculations and stuff. This feature is not used by anyone (as far as I'm aware) and definitely not by
Dauntless Builder either (although it is semi planned...). Due to the localization features there is
a new field "values" which does also extract values from text albeit only to be used for string interpolation.

It should however be trivial to make use of these.

Before:

```yaml
name: Engineer
description: Increases range of pylons.
type: Insight
key: IncreasedPylonRange
effects:
    "1":
        description: +35% increase Pylon range
        value: 0.35
    "2":
        description: +50% increase Pylon range
        value: 0.5
    "3":
        description: +65% increase Pylon range
        value: 0.65
    "4":
        description: +80% increase Pylon range
        value: 0.8
    "5":
        description: +115% increase Pylon range
        value: 1.15
    "6":
        description: +150% increase Pylon range
        value: 1.5
```

After:

```yaml
name: Engineer
description: Increases range of pylons.
type: Insight
effects:
    "1":
        description: +{{percentage}}% increase Pylon range
        values:
            percentage: 35
    "2":
        description: +{{percentage}}% increase Pylon range
        values:
            percentage: 50
    "3":
        description: +{{percentage}}% increase Pylon range
        values:
            percentage: 65
    "4":
        description: +{{percentage}}% increase Pylon range
        values:
            percentage: 80
    "5":
        description: +{{percentage}}% increase Pylon range
        values:
            percentage: 115
    "6":
        description: +{{percentage}}% increase Pylon range
        values:
            percentage: 150
```

# 2022-05-31

## Level scaling values

Levels haven't been a thing in Dauntless since the 1.5.0 Reforged update. Since then we've represented the
power surged state with level: 1 and the base state with level: 0.

This has been removed.

Before:

```yaml
power:
    0: 100
    1: 120
```

After:

```yaml
power:
    base: 100
    powerSurged: 120
```

## Perk/Unique Effect level scaling values

Similar to power and resistance, unique effects and perks have used a "from" "to" value range to describe
when the effect is active. This has been replaced with a much easier boolean flag.

powerSurged: true -> effect is active when power surged
powerSurged: false -> effect is active when not power surged

if the key is missing the effect is always active.

Before:

```yaml
perks:
    - name: Aetheric Attunement
      value: 2
      from: 0
      to: 1
    - name: Aetheric Attunement
      value: 3
      from: 1
      to: 1
```

After:

```yaml
perks:
    - name: Aetheric Attunement
      value: 2
      powerSurged: false
    - name: Aetheric Attunement
      value: 3
      powerSurged: true
```
