const { 
    Client, 
    GatewayIntentBits, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PRICE_PER_SPAWNER = 3000000;   // 3M pro Spawner
const PAY_TARGET = "ytdnmz";

// Deine Channel IDs
const SHOP_CHANNEL_ID = "1495762997875052554";     // Purchase Channel
const FAKE_CHANNEL_ID = "1495764340299534467";     // Fake-Customer Channel

// Rolle, die bei Fake-Käufen gepingt werden soll
const FAKE_ROLE_ID = "1495854128340144139";

let fakeInterval = null;

client.once('ready', () => {
    console.log(`✅ CheapSpawner Bot ist online: ${client.user.tag}`);
    startFakeBuys();
    sendShopEmbed();        // Sendet das Purchase-Embed automatisch
});

function startFakeBuys() {
    if (fakeInterval) clearInterval(fakeInterval);

    fakeInterval = setInterval(async () => {
        const channel = client.channels.cache.get(FAKE_CHANNEL_ID);
        if (!channel) return;

        const fakeEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ 
                name: "CheapSpawner", 
                iconURL: "attachment://spawner.png" 
            })
            .setDescription(`**Someone just bought spawners!**\nBuyer: <@&${FAKE_ROLE_ID}>`)
            .setTimestamp();

        await channel.send({ 
            embeds: [fakeEmbed],
            files: ['./spawner.png']
        }).catch(() => {});
    }, Math.floor(Math.random() * 60000) + 45000); // alle 45–105 Sekunden
}

// Sendet das clickable Purchase Embed
async function sendShopEmbed() {
    const shopChannel = client.channels.cache.get(SHOP_CHANNEL_ID);
    if (!shopChannel) return console.log("❌ Purchase Channel nicht gefunden!");

    const embed = new EmbedBuilder()
        .setTitle("CheapSpawner")
        .setDescription("**3M EACH** 😊\nWe are Trusted: #sales ✅")
        .setColor(0x00ff88);

    const button = new ButtonBuilder()
        .setCustomId('buy_spawners')
        .setLabel('Purchase')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🛒');

    const row = new ActionRowBuilder().addComponents(button);

    await shopChannel.send({ embeds: [embed], components: [row] });
}

// Button → Modal öffnen
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'buy_spawners') {
        const modal = new ModalBuilder()
            .setCustomId('buy_modal')
            .setTitle('Purchase Skeleton Spawners');

        const amountInput = new TextInputBuilder()
            .setCustomId('amount')
            .setLabel('How many skellys would you like to purchase?')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('ex. 15')
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(amountInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    }
});

// Modal auswerten
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'buy_modal') return;

    const amount = parseInt(interaction.fields.getTextInputValue('amount'));

    if (isNaN(amount) || amount < 1) {
        return interaction.reply({ 
            content: '❌ Please enter a valid number (minimum 1)!', 
            ephemeral: true 
        });
    }

    const total = amount * PRICE_PER_SPAWNER;

    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('✅ Order Created!')
        .setDescription(`You want to buy **${amount} Skeleton Spawners**.`)
        .addFields(
            { name: 'Total Price', value: `${total.toLocaleString('en-US')} $` },
            { name: 'Payment', value: `Send **${total.toLocaleString('en-US')}** using:\n\`/pay ${PAY_TARGET}\`` }
        )
        .setFooter({ text: 'After paying, just type "paid" here.' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
});

client.login('MTQ5NTc2MTc5ODA5ODQ1NjcxNw.GBHDXY.n8RqZPQ2l0Wn_5iY1slclGt2oRR72V_JuENZ6c');   // ← Hier deinen Bot Token einfügen
