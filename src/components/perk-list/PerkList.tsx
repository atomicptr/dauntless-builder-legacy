import { List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { useTranslation } from "react-i18next";

import { findCellByVariantName, findPerkByName } from "../../data/BuildModel";
import { ItemType } from "../../data/ItemType";
import { Perk, PerkValue } from "../../data/Perks";
import { selectBuild } from "../../features/build/build-slice";
import { useAppSelector } from "../../hooks/redux";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";

const PerkList: React.FC = () => {
    const build = useAppSelector(selectBuild);
    const { t } = useTranslation();

    const perks: PerkValue[] = [];

    const addPerk = (perk: PerkValue) => perks.push(perk);
    const filterSurged = (surged: boolean) => (perk: PerkValue) => surged ? perk.from === 1 : perk.from === 0;

    build.data.weapon?.perks?.filter(filterSurged(build.weaponSurged)).forEach(addPerk);
    build.data.head?.perks?.filter(filterSurged(build.headSurged)).forEach(addPerk);
    build.data.torso?.perks?.filter(filterSurged(build.torsoSurged)).forEach(addPerk);
    build.data.arms?.perks?.filter(filterSurged(build.armsSurged)).forEach(addPerk);
    build.data.legs?.perks?.filter(filterSurged(build.legsSurged)).forEach(addPerk);

    [
        build.weaponCell1,
        build.weaponCell2,
        build.headCell,
        build.torsoCell,
        build.armsCell,
        build.legsCell,
        build.lanternCell,
    ]
        .filter(variant => variant !== null)
        .map(variant => {
            const cell = findCellByVariantName(variant as string);
            const cellPerks = cell?.variants[variant as string].perks;
            if (cellPerks) {
                Object.keys(cellPerks).forEach(name => {
                    const value = cellPerks[name];
                    perks.push({ name, value });
                });
            }
        });

    const perkMap: { [name: string]: { count: number; data: Perk } } = {};

    perks.forEach(perk => {
        if (!(perk.name in perkMap)) {
            const data = findPerkByName(perk.name);

            if (!data) {
                return;
            }

            perkMap[perk.name] = { count: 0, data };
        }

        perkMap[perk.name].count += perk.value;
    });

    const sortedPerks = Object.keys(perkMap)
        .map(name => ({ count: perkMap[name].count, data: perkMap[name].data, name }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return (
        <List
            sx={{ bgcolor: "background.paper", maxWidth: 360, userSelect: "none", width: "100%" }}
            subheader={<ListSubheader>{t("terms.perks")}</ListSubheader>}>
            {sortedPerks.map(perk => (
                <ListItem key={perk.name}>
                    <ListItemIcon sx={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
                        <img
                            style={{ height: 32, width: 32 }}
                            src={`/assets/icons/perks/${perk.data.type}.png`}
                        />
                    </ListItemIcon>
                    <ListItemText
                        primary={`+${perk.count} ${t(itemTranslationIdentifier(ItemType.Perk, perk.name, "name"))}`}
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default PerkList;