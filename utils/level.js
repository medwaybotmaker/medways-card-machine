function giveXP(player, amount) {

    player.xp += amount;

    let leveled = false;

    while (player.xp >= player.level * 100) {

        player.xp -= player.level * 100;

        player.level++;

        leveled = true;
    }

    return leveled;
}

module.exports = {
    giveXP
};
