# dauntless-builder

Create and share Dauntless builds with your friends!

## Contributing

Want to contribute? Great! Read the [contribution guide first](CONTRIBUTING.md).

## Using the dauntless-builder.com data

Since this is an open source project, I want to make it as easy as possible for others to be able
to reuse the data we've collected, for whatever application you might want to build.

If you want to GET the built data, just fire a GET request to: https://www.dauntless-builder.com/data.json

Here a small example in pseudo-JavaScript:

```js
getData("https://www.dauntless-builder.com/data.json", data => {
    const json = JSON.parse(data);

    console.log("Weapons: ", json.weapons);
    // ...

    console.log("All data: ", json);
});
```

## Using the dauntless-builder build ID format

If you want to use our build format, to export/import builds or something else you can do so like this:

The build ID is powered by [HashIds](https://hashids.org/), which also explains roughly on how they work. You might've
to reimplement this mechanism in other programming languages though.

Next lets take a build, lets say [r5C7H8iPeIY6HV8cwievsjdF6i35hNZt2i6zcBwtnizrCLjSZ3](https://www.dauntless-builder.com/b/r5C7H8iPeIY6HV8cwievsjdF6i35hNZt2i6zcBwtnizrCLjSZ3).

```js
import Hashids from "hashids";

// instantiate the Hashids parser with the salt "spicy"
const hashids = new Hashids("spicy");

// next decode the build
let build = hashids.decode("r5C7H8iPeIY6HV8cwievsjdF6i35hNZt2i6zcBwtnizrCLjSZ3");
```

**build** should now have the value ``[1, 27, 10, 177, 120, 75, 10, 120, 74, 10, 192, 86, 10, 195, 72, 10, 195, 100, 201]``.

### The format

Here is a list of what these numbers mean:

1. **Version** - The version of the build, reserved for future use in case PHXLabs changes something in a way, that the current model can't handle
2. **Weapon Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
3. **Weapon Level** - The level of the weapon.
4. **Weapon - Cell 1** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
5. **Weapon - Cell 2** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
6. **Armour - Head Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
7. **Armour - Head Level** - The level of the Head piece.
8. **Armour - Head - Cell** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
9. **Armour - Torso Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
10. **Armour - Torso Level** - The level of the Torso piece.
11. **Armour - Torso - Cell** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
12. **Armour - Arms Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
13. **Armour - Arms Level** - The level of the Arms piece.
14. **Armour - Arms - Cell** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
15. **Armour - Legs Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
16. **Armour - Legs Level** - The level of the Legs piece.
17. **Armour - Legs - Cell** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
18. **Lantern Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
19. **Lantern - Cell** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.

In order to fit repeaters into the current format, I had to hack a little bit :).

**IF** the weapon name is set to **Repeater** the list is expanded with more data:

20. **Barrel - Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
21. **Barrel - Name** - The level of the Repeater Barrel.
22. **Chamber - Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
23. **Chamber - Name** - The level of the Repeater Chamber.
24. **Grip - Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
25. **Grip - Name** - The level of the Repeater Grip.
26. **Prism - Name** - This represents an item name, you can find the value mapping inside of the map file with the corresponding version.
27. **Prism - Name** - The level of the Repeater Prism.

### The number - name map

You can find the map with the corresponding version in either .map/v**$VERSION_NUMBER**.json or for convenience, you can also
request them via ``GET https://www.dauntless-builder-com/map/v$VERSION_NUMBER.json``

Here a small example in pseudo JavaScript:

```js
getData("https://www.dauntless-builder.com/map/v1.json", data => {
    const map = JSON.parse(data);

    const itemId = "98"; // 98 is tragic echo in v1

    const itemName = map[itemId];

    // itemData is the data from https://www.dauntless-builder.com/data.json
    const tragicEcho = itemData.armours[itemName];

    // prints: Upon your first death, become a shadow clone that deals 100% increased damage for 15 seconds.
    console.log(tragicEcho.unique_effects[0].description);
});
```

## Assets

All Dauntless related assets are the property of Phoenix Labs.

We're also using some icons from [Game Icons](https://game-icons.net/), such as:

* [Visored Helm](/assets/icons/general/Head.png)
* [Breastplate](/assets/icons/general/Torso.png)
* [Mailed Fist](/assets/icons/general/Arms.png)
* [Steeltoe Boots](/assets/icons/general/Legs.png)

The icons and the data are mostly from the [Dauntless Wiki](https://dauntless.gamepedia.com/Dauntless_Wiki), so huge thanks
to all who are working on it :).

## Support me

<a href="https://www.buymeacoffee.com/atomicptr" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

## Contact me

If you want to contact me, you can do so via these methods:

* E-Mail: me@atomicptr.de
* Discord: Hecate#0001
* Reddit: /u/SirNullptr

Please use [Github Issues](https://github.com/atomicptr/dauntless-builder/issues) for feature requests, bug reports and stuff along those lines.

## License

MIT
