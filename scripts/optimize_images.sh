#!/bin/bash

CONVERT="convert"

# on windows there ImageMagick convert is called "magick convert" instead of "convert"
if [[ "$OSTYPE" == "win32" || "$OSTYPE" == "msys" ]]; then
    CONVERT="magick convert"
fi

function optimize_path () {
    for file in $(find $1 -name '*.png')
    do
        if [[ $(identify -format "%wx%h" $file) != "128x128" ]]; then
            # resize to 128px height
            $CONVERT -resize 128x128 -gravity center -extent 128x128 -background none "$file" "$file"
        fi

        # optmize images
        optipng -silent -O2 "$file"
    done
}

echo "Optimizing images..."
optimize_path ./assets/icons/armours
optimize_path ./assets/icons/weapons
optimize_path ./assets/icons/parts
echo "...done"
