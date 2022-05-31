# Data Deprecations

While I always considered it to be super important to keep the public "API" of Dauntless Builder aka the data super
up to date, I decided it is necessary to start removing some old concepts that aren't really a part of Dauntless
anymore,
like gear levels! More to come probably.

# 2022-05-31

1. from/to values to determine level appropriate values are deprecated and will be removed in the near future, please
   use the new powerSurged: false / powerSurged: true instead
2. power/resistance level scaling will be removed in the near future, please use the new base: / powerSurged: values
   instead

```yaml
power:
  # example for 2.
  base: 100
  powerSurged: 120
perks:
  - name: Aetheric Attunement
    value: 2
    # example for 1.
    powerSurged: false
  - name: Aetheric Attunement
    value: 3
    powerSurged: true
```
